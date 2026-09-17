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
  const { teamName, leaderEmail } = req.body;
  if (!teamName || !leaderEmail) {
    return res.status(400).json({ error: "Team name and email are required." });
  }
  res.status(201).json({
    message: "Registration received!",
    data: { teamName, leaderEmail },
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
