exports.handler = async (event) => {
  try {
    const body = JSON.parse(event.body || "{}");

    console.log("Incoming submission:", body);

    // 🔒 Check Turnstile token
    if (!body["cf-turnstile-response"]) {
      return {
        statusCode: 400,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ok: false, error: "Missing Turnstile token" })
      };
    }

    // ✅ SUCCESS (temporary)
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
