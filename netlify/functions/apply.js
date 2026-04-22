exports.handler = async (event) => {
  try {
    if (event.httpMethod !== "POST") {
      return {
        statusCode: 405,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ok: false, error: "Method not allowed" })
      };
    }

    const body = JSON.parse(event.body || "{}");

    console.log("Incoming submission:", body);

    const token = body["cf-turnstile-response"];
    if (!token) {
      return {
        statusCode: 400,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ok: false, error: "Missing Turnstile token" })
      };
    }

    const secret = process.env.TURNSTILE_SECRET_KEY;
    if (!secret) {
      return {
        statusCode: 500,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ok: false, error: "Missing server secret" })
      };
    }

    const ip =
      event.headers["x-forwarded-for"] ||
      event.headers["client-ip"] ||
      "";

    const verifyRes = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: new URLSearchParams({
        secret,
        response: token,
        remoteip: ip
      }).toString()
    });

    const verifyData = await verifyRes.json();

    if (!verifyData.success) {
      return {
        statusCode: 400,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ok: false,
          error: "Bot verification failed",
          detail: verifyData
        })
      };
    }

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ok: true })
    };
  } catch (err) {
    console.error("Function error:", err);

    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ok: false, error: "Server error" })
    };
  }
};
