const express = require("express");
const cors = require("cors");
const { createClient } = require("@supabase/supabase-js");
require("dotenv").config({ path: __dirname + "/.env" });

const app = express();

app.use(cors());
app.use(express.json());

// Initialize Supabase Client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

app.post("/api/register", async (req, res) => {
  const {
    route,
    name,
    email,
    phone,
    realm,
    school,
    contactName,
    contactEmail,
    delegates,
  } = req.body;

  // 1. Validation
  if (route === "delegate" && (!name || !email)) {
    return res.status(400).json({ error: "Name and email are required." });
  }
  if (route === "school" && (!school || !contactEmail)) {
    return res
      .status(400)
      .json({ error: "School name and contact email are required." });
  }

  // 2. Prepare payload for PostgreSQL table
  const payload = {
    route,
    name: route === "delegate" ? name : null,
    email: route === "delegate" ? email : null,
    phone: route === "delegate" ? phone : null,
    realm: route === "delegate" ? realm : null,
    school: route === "school" ? school : null,
    contact_name: route === "school" ? contactName : null,
    contact_email: route === "school" ? contactEmail : null,
    delegates: route === "school" ? parseInt(delegates, 10) || null : null,
  };

  // 3. Save entry to Supabase
  const { data, error } = await supabase
    .from("registrations")
    .insert([payload]);

  if (error) {
    console.error("Supabase Error:", error);
    return res
      .status(500)
      .json({ error: "Failed to save registration to database." });
  }

  return res
    .status(200)
    .json({ message: "Registration submitted and saved successfully!" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
