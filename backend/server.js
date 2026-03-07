const express = require("express");
const { MongoClient } = require("mongodb");
const cors = require("cors");
const nodemailer = require("nodemailer");
require("dotenv").config();

const app = express();
app.use(express.json());
app.use(cors());

console.log("PORT from env:", process.env.PORT);
console.log("MONGODB_URI from env:", process.env.MONGODB_URI);
console.log("EMAIL_USER from env:", process.env.EMAIL_USER);
console.log("EMAIL_PASS from env:", process.env.EMAIL_PASS ? "✅ Set" : "❌ Not set");

const client = new MongoClient(process.env.MONGODB_URI);
let db;

// Email configuration
const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE || 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Store OTPs temporarily (in production, use Redis)
const otpStore = new Map();

async function connectDB() {
  try {
    await client.connect();
    db = client.db("madsha");
    console.log("✅ MongoDB Connected");
    
    // Create collections
    await db.createCollection("users");
    await db.createCollection("admins");
    console.log("✅ Collections ready");
    
    // Create default admin if not exists
    const adminExists = await db.collection("admins").findOne({ email: "admin@madsha.com" });
    if (!adminExists) {
      await db.collection("admins").insertOne({
        email: "admin@madsha.com",
        password: "Admin@123",
        name: "Super Admin",
        role: "admin",
        createdAt: new Date()
      });
      console.log("✅ Default admin created");
    }
    
  } catch (error) {
    console.error("❌ MongoDB connection error:", error);
  }
}

connectDB();

// Test route
app.get("/", (req, res) => {
  res.send("Backend Running");
});

// ==================== OTP GENERATOR ====================
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// ==================== SEND OTP API ====================
app.post("/api/send-otp", async (req, res) => {
  const { email } = req.body;
  
  if (!email) {
    return res.status(400).json({ success: false, error: "Email is required" });
  }

  try {
    // Generate OTP
    const otp = generateOTP();
    const expiry = Date.now() + 30 * 1000; // ✅ 30 SECONDS
    
    // Store OTP
    otpStore.set(email, { otp, expiry });
    
    // Send email
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "MADSHA - OTP Verification",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
          <h2 style="color: #f97316; text-align: center;">MADSHA OTP Verification</h2>
          <p style="font-size: 16px; color: #333;">Your One-Time Password (OTP) for login is:</p>
          <div style="background: linear-gradient(135deg, #f97316, #ec4899); padding: 20px; border-radius: 10px; text-align: center; margin: 20px 0;">
            <h1 style="font-size: 48px; letter-spacing: 10px; color: white; margin: 0;">${otp}</h1>
          </div>
          <p style="font-size: 14px; color: #666;">This OTP is valid for 30 Sec. Do not share it with anyone.</p>
          <p style="font-size: 14px; color: #666;">If you didn't request this, please ignore this email.</p>
          <hr style="border: 1px solid #eee; margin: 20px 0;">
          <p style="font-size: 12px; color: #999; text-align: center;">© 2025 Madsha Services Private Limited. All rights reserved.</p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ OTP sent to: ${email}`);
    
    res.json({ 
      success: true, 
      message: "OTP sent successfully" 
    });

  } catch (error) {
    console.error("❌ Error sending OTP:", error);
    res.status(500).json({ 
      success: false, 
      error: "Failed to send OTP. Please check your email configuration." 
    });
  }
});

// ==================== VERIFY OTP API ====================
app.post("/api/verify-otp", async (req, res) => {
  const { email, otp } = req.body;
  
  if (!email || !otp) {
    return res.status(400).json({ 
      success: false, 
      error: "Email and OTP are required" 
    });
  }

  try {
    const stored = otpStore.get(email);
    
    if (!stored) {
      return res.status(400).json({ 
        success: false, 
        error: "OTP not found. Please request a new one." 
      });
    }

    if (Date.now() > stored.expiry) {
      otpStore.delete(email);
      return res.status(400).json({ 
        success: false, 
        error: "OTP has expired. Please request a new one." 
      });
    }

    if (stored.otp !== otp) {
      return res.status(400).json({ 
        success: false, 
        error: "Invalid OTP. Please try again." 
      });
    }

    // OTP verified successfully
    otpStore.delete(email);
    
    res.json({ 
      success: true, 
      message: "OTP verified successfully" 
    });

  } catch (error) {
    console.error("❌ OTP verification error:", error);
    res.status(500).json({ 
      success: false, 
      error: "Something went wrong" 
    });
  }
});

// ==================== FORGOT PASSWORD API ====================
app.post("/api/forgot-password", async (req, res) => {
  const { email } = req.body;
  
  try {
    // Check if user exists
    const user = await db.collection("users").findOne({ email });
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        error: "User not found" 
      });
    }

    // Generate OTP
    const otp = generateOTP();
    const expiry = Date.now() + 30 * 1000; // ✅ 30 SECONDS
    
    otpStore.set(`reset_${email}`, { otp, expiry });

    // Send password reset email
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "MADSHA - Password Reset Request",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
          <h2 style="color: #f97316; text-align: center;">MADSHA Password Reset</h2>
          <p style="font-size: 16px; color: #333;">We received a request to reset your password. Use this OTP to proceed:</p>
          <div style="background: linear-gradient(135deg, #f97316, #ec4899); padding: 20px; border-radius: 10px; text-align: center; margin: 20px 0;">
            <h1 style="font-size: 48px; letter-spacing: 10px; color: white; margin: 0;">${otp}</h1>
          </div>
          <p style="font-size: 14px; color: #666;">This OTP is valid for 10 minutes. If you didn't request this, please ignore this email.</p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    
    res.json({ 
      success: true, 
      message: "Password reset OTP sent to your email" 
    });

  } catch (error) {
    console.error("❌ Forgot password error:", error);
    res.status(500).json({ 
      success: false, 
      error: "Something went wrong" 
    });
  }
});

// ==================== RESET PASSWORD API ====================
app.post("/api/reset-password", async (req, res) => {
  const { email, otp, newPassword } = req.body;
  
  try {
    const stored = otpStore.get(`reset_${email}`);
    
    if (!stored || stored.otp !== otp) {
      return res.status(400).json({ 
        success: false, 
        error: "Invalid OTP" 
      });
    }

    if (Date.now() > stored.expiry) {
      otpStore.delete(`reset_${email}`);
      return res.status(400).json({ 
        success: false, 
        error: "OTP has expired" 
      });
    }

    // Update password
    await db.collection("users").updateOne(
      { email },
      { $set: { password: newPassword } }
    );

    otpStore.delete(`reset_${email}`);
    
    res.json({ 
      success: true, 
      message: "Password reset successfully" 
    });

  } catch (error) {
    console.error("❌ Reset password error:", error);
    res.status(500).json({ 
      success: false, 
      error: "Something went wrong" 
    });
  }
});

// ==================== ADMIN LOGIN API ====================
app.post("/api/login/admin", async (req, res) => {
  const { email, password } = req.body;
  
  console.log("\n🔍 ===== ADMIN LOGIN ATTEMPT =====");
  console.log("📧 Email:", email);
  console.log("🔑 Password:", password);

  try {
    if (!db) {
      console.log("❌ Database not connected");
      return res.status(500).json({ success: false, error: "Database error" });
    }

    const admin = await db.collection("admins").findOne({ email });
    
    if (!admin) {
      console.log("❌ Admin not found");
      return res.status(401).json({ success: false, error: "Invalid credentials" });
    }

    console.log("✅ Admin found in database");
    console.log("📦 DB Password:", admin.password);
    console.log("📦 Input Password:", password);
    console.log("📦 Match:", admin.password === password);

    if (admin.password !== password) {
      console.log("❌ Password mismatch");
      return res.status(401).json({ success: false, error: "Invalid credentials" });
    }

    console.log("✅ Admin login successful!");
    res.json({
      success: true,
      admin: {
        name: admin.name,
        email: admin.email,
        role: admin.role
      }
    });

  } catch (error) {
    console.error("❌ Admin login error:", error);
    res.status(500).json({ success: false, error: "Server error" });
  }
});

// ==================== REGISTER API ====================
app.post("/api/register/:role", async (req, res) => {
  console.log("📝 Register route hit!");
  const { role } = req.params;
  const { name, email, phone, password } = req.body;

  try {
    const existingUser = await db.collection("users").findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, error: "User already exists" });
    }

    const status = role === "user" ? "approved" : "pending";

    const user = {
      name,
      email,
      phone,
      password,
      role,
      status,
      registeredAt: new Date(),
      createdAt: new Date()
    };

    await db.collection("users").insertOne(user);

    let message = `${role} registered successfully!`;
    if (role !== "user") {
      message = `${role} registered successfully! Your account is pending admin approval.`;
    }

    res.json({ success: true, message, user: { name, email, role, status } });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ success: false, error: "Something went wrong" });
  }
});

// ==================== LOGIN API ====================
app.post("/api/login/:role", async (req, res) => {
  const { role } = req.params;
  const { email, password } = req.body;
  
  console.log(`🔑 Login attempt for ${role}:`, email);

  try {
    const user = await db.collection("users").findOne({ email, role });
    
    if (!user || user.password !== password) {
      return res.status(401).json({ success: false, error: "Invalid credentials" });
    }

    if (role !== "user" && user.status !== "approved") {
      return res.status(403).json({
        success: false,
        error: "Your account is pending admin approval",
        status: user.status
      });
    }

    let redirectUrl = "/";
    if (role === "rider") redirectUrl = "/dashboard/rider";
    if (role === "business") redirectUrl = "/dashboard/business";

    res.json({
      success: true,
      redirectTo: redirectUrl,
      user: {
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        status: user.status
      }
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ success: false, error: "Server error" });
  }
});

// ==================== ADMIN: GET ALL USERS ====================
app.get("/api/admin/users/all", async (req, res) => {
  try {
    const users = await db.collection("users")
      .find({})
      .project({ password: 0 })
      .toArray();
    
    res.json({ success: true, users });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ error: "Something went wrong" });
  }
});

// ==================== ADMIN: GET USER STATS ====================
app.get("/api/admin/users/stats", async (req, res) => {
  try {
    const allUsers = await db.collection("users").find({}).toArray();
    
    const stats = {
      total: allUsers.length,
      approved: allUsers.filter(u => u.status === "approved").length,
      pending: allUsers.filter(u => u.status === "pending").length,
      rejected: allUsers.filter(u => u.status === "rejected").length,
      users: allUsers.filter(u => u.role === "user").length,
      riders: allUsers.filter(u => u.role === "rider").length,
      businesses: allUsers.filter(u => u.role === "business").length
    };

    console.log("📊 User Stats:", stats);
    res.json({ success: true, stats });
  } catch (error) {
    console.error("Error fetching stats:", error);
    res.status(500).json({ error: "Something went wrong" });
  }
});

// ==================== ADMIN: GET PENDING USERS ====================
app.get("/api/admin/users/pending", async (req, res) => {
  try {
    const allUsers = await db.collection("users")
      .find({})
      .project({ password: 0 })
      .toArray();
    
    const pending = allUsers.filter(user => user.status === "pending");
    const approved = allUsers.filter(user => user.status === "approved");
    const rejected = allUsers.filter(user => user.status === "rejected");

    console.log(`📊 Found: ${allUsers.length} total users`);
    console.log(`   ✅ Approved: ${approved.length}`);
    console.log(`   ⏳ Pending: ${pending.length}`);
    console.log(`   ❌ Rejected: ${rejected.length}`);

    res.json({ 
      pending: pending || [], 
      approved: approved || [], 
      rejected: rejected || [] 
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ error: "Something went wrong" });
  }
});

// ==================== ADMIN: APPROVE USER ====================
app.post("/api/admin/users/approve", async (req, res) => {
  const { email, approvedBy } = req.body;
  try {
    await db.collection("users").updateOne(
      { email },
      { $set: { status: "approved", approvedBy, approvedAt: new Date() } }
    );
    res.json({ success: true });
  } catch (error) {
    console.error("Approve error:", error);
    res.status(500).json({ error: "Something went wrong" });
  }
});

// ==================== ADMIN: REJECT USER ====================
app.post("/api/admin/users/reject", async (req, res) => {
  const { email, reason } = req.body;
  try {
    await db.collection("users").updateOne(
      { email },
      { $set: { status: "rejected", rejectionReason: reason, rejectedAt: new Date() } }
    );
    res.json({ success: true });
  } catch (error) {
    console.error("Reject error:", error);
    res.status(500).json({ error: "Something went wrong" });
  }
});

// ==================== ADMIN: DELETE USER ====================
app.delete("/api/admin/users/delete/:email", async (req, res) => {
  const { email } = req.params;
  
  try {
    const user = await db.collection("users").findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, error: "User not found" });
    }

    await db.collection("users").deleteOne({ email });
    
    console.log(`✅ User permanently deleted: ${email}`);
    res.json({ 
      success: true, 
      message: "User permanently deleted from database" 
    });
  } catch (error) {
    console.error("❌ Delete error:", error);
    res.status(500).json({ success: false, error: "Something went wrong" });
  }
});

// ==================== RIDER DASHBOARD ====================
app.get("/api/dashboard/rider/:email", async (req, res) => {
  try {
    const deliveries = [
      { customer: "Rahul Sharma", address: "123 Main St", time: "10:30 AM", status: "delivered" },
      { customer: "Priya Patel", address: "456 Oak Ave", time: "2:15 PM", status: "pending" }
    ];
    const stats = { totalDeliveries: 12, completed: 8, inTransit: 3, pending: 1 };
    res.json({ success: true, stats, deliveries });
  } catch (error) {
    res.status(500).json({ error: "Something went wrong" });
  }
});

// ==================== BUSINESS DASHBOARD ====================
app.get("/api/dashboard/business/:email", async (req, res) => {
  try {
    const stats = { totalProducts: 24, todayOrders: 15, pendingOrders: 7, revenue: 12450 };
    const recentOrders = [
      { id: "#ORD001", customer: "Rahul Sharma", product: "Watch", amount: "₹1,999", status: "Delivered" }
    ];
    res.json({ success: true, stats, recentOrders });
  } catch (error) {
    res.status(500).json({ error: "Something went wrong" });
  }
});

const PORT = parseInt(process.env.PORT) || 5000;
app.listen(PORT, () => {
  console.log(`\n🚀 Server running on port ${PORT}`);
});