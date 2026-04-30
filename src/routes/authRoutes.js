const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { User } = require("../models");

const router = express.Router();
const MIN_PASSWORD_LENGTH = 6;

function normalizeEmail(email = "") {
  return String(email).trim().toLowerCase();
}

function toPublicUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  };
}

router.post("/signup", async (req, res) => {
  try {
    const rawName = req.body?.name;
    const rawEmail = req.body?.email;
    const password = req.body?.password;

    const name = String(rawName || "").trim();
    const email = normalizeEmail(rawEmail);

    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ message: "Name, email, and password are required." });
    }

    if (password.length < MIN_PASSWORD_LENGTH) {
      return res.status(400).json({
        message: `Password must be at least ${MIN_PASSWORD_LENGTH} characters long.`,
      });
    }

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(409).json({ message: "Email is already registered." });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const adminEmail = normalizeEmail(process.env.ADMIN_EMAIL);
    const role = adminEmail && email === adminEmail ? "admin" : "member";

    const user = await User.create({ name, email, password: passwordHash, role });
    return res.status(201).json({
      message: "Signup successful.",
      user: toPublicUser(user),
    });
  } catch (error) {
    return res.status(500).json({ message: "Signup failed", error: error.message });
  }
});

router.post("/login", async (req, res) => {
  try {
    if (!process.env.JWT_SECRET) {
      return res.status(500).json({
        message: "Server configuration error: JWT_SECRET is missing",
      });
    }

    const email = normalizeEmail(req.body?.email);
    const password = req.body?.password;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(401).json({ message: "Invalid credentials" });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ message: "Invalid credentials" });

    const token = jwt.sign({ userId: user.id, role: user.role }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    return res.json({
      message: "Login successful",
      token,
      user: toPublicUser(user),
    });
  } catch (error) {
    return res.status(500).json({ message: "Login failed", error: error.message });
  }
});

module.exports = router;
