// netlify/functions/apply.js
// Netlify Function: verify Cloudflare Turnstile, then email the application.

const TURNSTILE_SECRET = process.env.TURNSTILE_SECRET || "";
const RESEND_API_KEY = process.env.RESEND_API_KEY || "";
const TO_EMAIL = process.env.APPLY_TO_EMAIL || "applications@bdfreightpartners.com";
const FROM_EMAIL = process.env.APPLY_FROM_EMAIL || "onboarding@resend.dev";

function resp(statusCode, obj) {
  return {
    statusCode,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "Content-Type",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
    },
    body: JSON.stringify(obj),
  };
}

async function verifyTurnstile(token, ip) {
  if (!TURNSTILE_SECRET) return { ok: false, error: "missing_turnstile_secret" };
  if (!token) return { ok: false, error: "missing_turnstile_token" };

  const form = new URLSearchParams();
  form.append("secret", TURNSTILE_SECRET);
  form.append("response", token);
  if (ip) form.append("remoteip", ip);

  const r = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: form.toString(),
  });

  const data = await r.json().catch(() => ({}));
  return { ok: !!data.success, data };
}

async function sendEmail({ subject, text }) {
  if (!RESEND_API_KEY) return { ok: false, error: "missing_resend_api_key" };

  const r = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: FROM_EMAIL,
      to: [TO_EMAIL],
      subject,
      text,
    }),
  });

  const data = await r.json().catch(() => ({}));
  if (!r.ok) return { ok: false, error: "resend_failed", detail: data };
  return { ok: true, data };
}

exports.handler = async (event) => {
  if (event.httpMethod === "OPTIONS") return resp(200, { ok: true });
  if (event.httpMethod !== "POST") return resp(405, { ok: false, error: "method_not_allowed" });

  let body = {};
  try {
    body = JSON.parse(event.body || "{}");
  } catch {
    return resp(400, { ok: false, error: "invalid_json" });
  }

  const token = (body["cf-turnstile-response"] || "").trim();
  const ip =
    event.headers["x-nf-client-connection-ip"] ||
    event.headers["x-forwarded-for"] ||
    "";

  // 1) Turnstile verification
  const v = await verifyTurnstile(token, ip);
  if (!v.ok) return resp(403, { ok: false, error: "turnstile_failed", detail: v.data || v.error });

  // 2) Minimal required fields
  const contact_name = (body.contact_name || "").trim();
  const phone = (body.phone || "").trim();
  if (!contact_name || !phone) {
    return resp(400, { ok: false, error: "missing_required_fields" });
  }

  // 3) Email content
  const safe = (x) => (x == null ? "" : String(x)).trim();

  const subject = `New OO Application: ${contact_name} (${phone})`;
  const text = `New Owner-Operator Application

Name: ${contact_name}
Phone: ${phone}
Email: ${safe(body.email) || "(blank)"}
Home ZIP: ${safe(body.home_zip) || "(blank)"}

Equipment: ${safe(body.equipment_type) || "(blank)"}
Trucks: ${safe(body.truck_count) || "(blank)"}

Preferred Regions/Lanes:
${safe(body.preferred_regions) || "(blank)"}

Notes:
${safe(body.notes) || "(blank)"}

IP: ${ip || "(unknown)"}
Time: ${new Date().toISOString()}
`;

  const sent = await sendEmail({ subject, text });
  if (!sent.ok) return resp(500, { ok: false, error: sent.error, detail: sent.detail || null });

  return resp(200, { ok: true });
};
