const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: JSON.stringify({ ok: false, error: "Method not allowed" }),
    };
  }

  try {
    const body = JSON.parse(event.body || "{}");

    const {
      name,
      email,
      phone,
      street,
      city,
      state,
      zipcode,
      hasTruck,
      experience,
      equipment,
      message,
    } = body;

    if (!name || !email || !phone || !city || !state || !zipcode) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          ok: false,
          error: "Missing required fields",
        }),
      };
    }

    const has_truck =
      hasTruck === "yes" ? true : hasTruck === "no" ? false : null;

    const { data, error } = await supabase
      .from("applications")
      .insert([
        {
          name: String(name).trim(),
          email: String(email).trim().toLowerCase(),
          phone: String(phone).trim(),
          street: street ? String(street).trim() : null,
          city: String(city).trim(),
          state: String(state).trim().toUpperCase(),
          zipcode: String(zipcode).trim(),
          has_truck,
          experience: experience ? String(experience).trim() : null,
          equipment: equipment ? String(equipment).trim() : null,
          message: message ? String(message).trim() : null,
          status: "new",
        },
      ])
      .select();

    if (error) {
      console.error("Supabase insert error:", error);

      return {
        statusCode: 500,
        body: JSON.stringify({
          ok: false,
          error: error.message || "Database insert failed",
        }),
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        ok: true,
        message: "Application submitted successfully",
        data,
      }),
    };
  } catch (err) {
    console.error("Function error:", err);

    return {
      statusCode: 500,
      body: JSON.stringify({
        ok: false,
        error: err.message || "Server error",
      }),
    };
  }
};
