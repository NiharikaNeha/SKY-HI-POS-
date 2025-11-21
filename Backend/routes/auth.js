import express from "express";
import admin from "firebase-admin";
import { authenticate } from "../middleware/auth.js";
import User from "../models/User.js";

const router = express.Router();

// Get admin emails from environment variable
const getAdminEmails = () => {
  const adminEmailsEnv = process.env.ADMIN_EMAILS || '';
  return adminEmailsEnv.split(',').map(email => email.trim()).filter(Boolean);
};

// Helper function to check if email is admin 
const isAdminEmail = (email) => {
  if (!email) return false;
  const normalizedEmail = email.toLowerCase().trim();
  const adminEmails = getAdminEmails();
  return adminEmails.some(
    (adminEmail) => adminEmail.toLowerCase() === normalizedEmail
  );
};

// Get current user info (protected route)
router.get("/me", authenticate, async (req, res) => {
  try {
    res.json({
      user: {
        id: req.user._id,
        firebaseUid: req.user.firebaseUid,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role,
      },
    });
  } catch (error) {
    console.error("Get user error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Update user role (Admin only - for making users admin)
router.post("/make-admin", authenticate, async (req, res) => {
  try {
    // Check if current user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: "Admin access required" });
    }

    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.role = 'admin';
    await user.save();

    res.json({
      message: "User upgraded to admin successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Make admin error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

export default router;
