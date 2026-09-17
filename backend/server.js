const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Health check route
app.get("/api/health", (req, res) => {
  res.json({ status: "success", message: "RSIC Backend is running!" });
});

// Registration endpoint preview
app.post("/api/register", (req, res) => {
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

  // Handle Delegate Route
  if (route === "delegate") {
    if (!name || !email) {
      return res.status(400).json({ error: "Name and email are required." });
    }
    console.log(`[DELEGATE REGISTRATION] ${name} (${email}) - Realm: ${realm}`);
    return res
      .status(200)
      .json({ message: "Delegate registration received successfully!" });
  }

  // Handle School Route
  if (route === "school") {
    if (!school || !contactEmail) {
      return res
        .status(400)
        .json({ error: "School name and contact email are required." });
    }
    console.log(`[SCHOOL REGISTRATION] ${school} - Contact: ${contactEmail}`);
    return res
      .status(200)
      .json({ message: "School registration received successfully!" });
  }

  return res.status(400).json({ error: "Invalid registration route." });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
