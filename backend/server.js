// backend/server.js
const express = require("express");
const { MongoClient } = require("mongodb");
const cors = require("cors");
const nodemailer = require("nodemailer");
require("dotenv").config();

const app = express();

// ==================== MIDDLEWARE ====================
app.use(express.json());

// ✅ SIMPLE CORS - No complex patterns
const allowedOrigins = [
  'https://madsha.vercel.app',
  'https://www.madsha.com',
  'http://localhost:3000',
  'https://madsha-api.onrender.com'
];

app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (like mobile apps, curl, postman)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, origin);
    } else {
      console.log('❌ Blocked origin:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin']
}));

// ✅ Request logging middleware
app.use((req, res, next) => {
  console.log(`\n📨 ${new Date().toISOString()} - ${req.method} ${req.url}`);
  console.log(`   Origin: ${req.headers.origin || 'No origin'}`);
  console.log(`   User-Agent: ${req.headers['user-agent']}`);
  next();
});

// ✅ Security headers
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  next();
});

// ==================== ENVIRONMENT VARIABLES CHECK ====================
console.log("\n🚀 ===== SERVER STARTING =====");
console.log("📦 Environment:", process.env.NODE_ENV || 'development');
console.log("🔌 PORT from env:", process.env.PORT);
console.log("📊 MONGODB_URI exists:", !!process.env.MONGODB_URI);
console.log("📧 EMAIL_USER exists:", !!process.env.EMAIL_USER);
console.log("🔑 EMAIL_PASS exists:", !!process.env.EMAIL_PASS);
console.log("===========================\n");

// ==================== MONGODB CONNECTION ====================
const client = new MongoClient(process.env.MONGODB_URI, {
  connectTimeoutMS: 30000,
  socketTimeoutMS: 45000,
  serverSelectionTimeoutMS: 30000,
  tls: true,
  tlsAllowInvalidCertificates: true,
  retryWrites: true,
  retryReads: true
});
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
    console.log("✅ MongoDB Connected Successfully");
    
    // Create collections if they don't exist
    const collections = await db.listCollections().toArray();
    const collectionNames = collections.map(c => c.name);
    
    if (!collectionNames.includes("users")) {
      await db.createCollection("users");
      console.log("✅ Users collection created");
    }
    
    if (!collectionNames.includes("admins")) {
      await db.createCollection("admins");
      console.log("✅ Admins collection created");
      
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
        console.log("✅ Default admin created - Email: admin@madsha.com, Password: Admin@123");
      }
    }
    
    // Create categories collection
    if (!collectionNames.includes("categories")) {
      await db.createCollection("categories");
      console.log("✅ Categories collection created");
      
      // Insert default categories
      const defaultCategories = [
        // Main Categories
        { name: "Fashion", slug: "fashion", description: "Clothing, footwear & accessories", icon: "👕", order: 1, isActive: true, parentCategory: null, createdAt: new Date() },
        { name: "Electronics", slug: "electronics", description: "Mobiles, laptops, gadgets", icon: "💻", order: 2, isActive: true, parentCategory: null, createdAt: new Date() },
        { name: "Home & Kitchen", slug: "home-kitchen", description: "Furniture, decor, kitchenware", icon: "🏠", order: 3, isActive: true, parentCategory: null, createdAt: new Date() },
        { name: "Beauty", slug: "beauty", description: "Makeup, skincare, haircare", icon: "💄", order: 4, isActive: true, parentCategory: null, createdAt: new Date() },
        { name: "Grocery", slug: "grocery", description: "Daily essentials, staples", icon: "🛒", order: 5, isActive: true, parentCategory: null, createdAt: new Date() },
        { name: "Sports", slug: "sports", description: "Fitness, outdoor sports", icon: "⚽", order: 6, isActive: true, parentCategory: null, createdAt: new Date() },
        { name: "Books", slug: "books", description: "Books, stationery", icon: "📚", order: 7, isActive: true, parentCategory: null, createdAt: new Date() },
        { name: "Toys", slug: "toys", description: "Toys, baby care", icon: "🧸", order: 8, isActive: true, parentCategory: null, createdAt: new Date() },
        { name: "Automotive", slug: "automotive", description: "Car & bike accessories", icon: "🚗", order: 9, isActive: true, parentCategory: null, createdAt: new Date() },
        { name: "Health", slug: "health", description: "Healthcare, medicines", icon: "💊", order: 10, isActive: true, parentCategory: null, createdAt: new Date() },
        { name: "Jewellery", slug: "jewellery", description: "Gold, silver, imitation", icon: "💎", order: 11, isActive: true, parentCategory: null, createdAt: new Date() },
        
        // Farmer/Kisan Special Category
        { name: "Kisan Store", slug: "farmer", description: "Fresh from farms - Direct from farmers", icon: "🌾", order: 0, isActive: true, parentCategory: null, isFarmer: true, createdAt: new Date() },
        
        // Subcategories for Fashion
        { name: "Men's Clothing", slug: "mens-clothing", parentCategory: "fashion", icon: "👔", order: 1, isActive: true, createdAt: new Date() },
        { name: "Women's Clothing", slug: "womens-clothing", parentCategory: "fashion", icon: "👗", order: 2, isActive: true, createdAt: new Date() },
        { name: "Kids' Clothing", slug: "kids-clothing", parentCategory: "fashion", icon: "🧥", order: 3, isActive: true, createdAt: new Date() },
        { name: "Footwear", slug: "footwear", parentCategory: "fashion", icon: "👟", order: 4, isActive: true, createdAt: new Date() },
        
        // Subcategories for Electronics
        { name: "Mobiles", slug: "mobiles", parentCategory: "electronics", icon: "📱", order: 1, isActive: true, createdAt: new Date() },
        { name: "Laptops", slug: "laptops", parentCategory: "electronics", icon: "💻", order: 2, isActive: true, createdAt: new Date() },
        { name: "Audio", slug: "audio", parentCategory: "electronics", icon: "🎧", order: 3, isActive: true, createdAt: new Date() },
        { name: "Cameras", slug: "cameras", parentCategory: "electronics", icon: "📷", order: 4, isActive: true, createdAt: new Date() },
        
        // Subcategories for Grocery
        { name: "Fresh Vegetables", slug: "vegetables", parentCategory: "grocery", icon: "🥬", order: 1, isActive: true, isFarmerProduct: true, createdAt: new Date() },
        { name: "Fresh Fruits", slug: "fruits", parentCategory: "grocery", icon: "🍎", order: 2, isActive: true, isFarmerProduct: true, createdAt: new Date() },
        { name: "Organic Products", slug: "organic", parentCategory: "grocery", icon: "🌱", order: 3, isActive: true, isFarmerProduct: true, createdAt: new Date() },
        { name: "Staples", slug: "staples", parentCategory: "grocery", icon: "🍚", order: 4, isActive: true, createdAt: new Date() },
      ];
      
      await db.collection("categories").insertMany(defaultCategories);
      console.log("✅ Default categories inserted");
    }
    
    console.log("✅ Database ready with collections:", collectionNames);
    
  } catch (error) {
    console.error("❌ MongoDB connection error:", error);
    console.log("⏳ Retrying in 5 seconds...");
    setTimeout(connectDB, 5000);
  }
}

connectDB();

// ==================== TEST ROUTES ====================

// Root route
app.get("/", (req, res) => {
  res.send(`
    <html>
      <head><title>MADSHA Backend</title></head>
      <body style="font-family: Arial; text-align: center; padding: 50px;">
        <h1 style="color: #f97316;">🚀 MADSHA Backend Running</h1>
        <p>Server is live and ready!</p>
        <p>✅ MongoDB Connected</p>
        <p>✅ API Routes Active</p>
        <hr>
        <p style="color: #666;">Available endpoints:</p>
        <ul style="list-style: none; padding: 0;">
          <li>📊 GET /api/admin/users/stats</li>
          <li>👥 GET /api/admin/users/all</li>
          <li>🔑 POST /api/login/admin</li>
          <li>📝 POST /api/register/:role</li>
          <li>✅ POST /api/admin/users/approve</li>
          <li>❌ POST /api/admin/users/reject</li>
          <li>🗑️ DELETE /api/admin/users/delete/:email</li>
          <li>📁 GET /api/categories</li>
          <li>🌾 GET /api/farmer/products</li>
        </ul>
      </body>
    </html>
  `);
});

// Test route
app.get("/api/test", (req, res) => {
  res.json({ 
    success: true, 
    message: "API is working!",
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV
  });
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
    const expiry = Date.now() + 30 * 1000; // 30 SECONDS
    
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
    const expiry = Date.now() + 30 * 1000; // 30 SECONDS
    
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
  console.log("🌐 Origin:", req.headers.origin);

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
  console.log("📋 Fetching all users...");
  try {
    const users = await db.collection("users")
      .find({})
      .project({ password: 0 })
      .toArray();
    
    console.log(`✅ Found ${users.length} users`);
    res.json({ success: true, users });
  } catch (error) {
    console.error("❌ Error fetching users:", error);
    res.status(500).json({ error: "Something went wrong" });
  }
});

// ==================== ADMIN: GET USER STATS ====================
app.get("/api/admin/users/stats", async (req, res) => {
  console.log("📊 Fetching user stats...");
  try {
    const allUsers = await db.collection("users").find({}).toArray();
    
    const stats = {
      total: allUsers.length,
      active: allUsers.filter(u => u.status === "approved").length,
      pending: allUsers.filter(u => u.status === "pending").length,
      blocked: allUsers.filter(u => u.status === "rejected").length,
      users: allUsers.filter(u => u.role === "user").length,
      riders: allUsers.filter(u => u.role === "rider").length,
      businesses: allUsers.filter(u => u.role === "business").length
    };

    console.log("📊 User Stats:", stats);
    res.json({ success: true, stats });
  } catch (error) {
    console.error("❌ Error fetching stats:", error);
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
    console.error("❌ Error fetching users:", error);
    res.status(500).json({ error: "Something went wrong" });
  }
});

// ==================== ADMIN: APPROVE USER ====================
app.post("/api/admin/users/approve", async (req, res) => {
  const { email, approvedBy } = req.body;
  console.log(`✅ Approving user: ${email} by ${approvedBy}`);
  
  try {
    await db.collection("users").updateOne(
      { email },
      { $set: { status: "approved", approvedBy, approvedAt: new Date() } }
    );
    console.log(`✅ User approved: ${email}`);
    res.json({ success: true });
  } catch (error) {
    console.error("❌ Approve error:", error);
    res.status(500).json({ error: "Something went wrong" });
  }
});

// ==================== ADMIN: REJECT USER ====================
app.post("/api/admin/users/reject", async (req, res) => {
  const { email, reason } = req.body;
  console.log(`❌ Rejecting user: ${email} - Reason: ${reason}`);
  
  try {
    await db.collection("users").updateOne(
      { email },
      { $set: { status: "rejected", rejectionReason: reason, rejectedAt: new Date() } }
    );
    console.log(`✅ User rejected: ${email}`);
    res.json({ success: true });
  } catch (error) {
    console.error("❌ Reject error:", error);
    res.status(500).json({ error: "Something went wrong" });
  }
});

// ==================== ADMIN: DELETE USER ====================
app.delete("/api/admin/users/delete/:email", async (req, res) => {
  const { email } = req.params;
  console.log(`🗑️ Deleting user: ${email}`);
  
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

// ==================== CATEGORY APIS ====================

// Get all categories (with optional filters)
app.get("/api/categories", async (req, res) => {
  console.log("📁 Fetching all categories...");
  try {
    const { search, parent, active, limit = 50, page = 1 } = req.query;
    
    let query = {};
    
    // Search filter
    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }
    
    // Parent category filter
    if (parent === 'null') {
      query.parentCategory = null;
    } else if (parent) {
      query.parentCategory = parent;
    }
    
    // Active status filter
    if (active !== undefined) {
      query.isActive = active === 'true';
    }
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const categories = await db.collection("categories")
      .find(query)
      .sort({ order: 1, name: 1 })
      .limit(parseInt(limit))
      .skip(skip)
      .toArray();
    
    const total = await db.collection("categories").countDocuments(query);
    
    res.json({
      success: true,
      categories,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error("❌ Error fetching categories:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get single category by slug or ID
app.get("/api/categories/:identifier", async (req, res) => {
  console.log(`📁 Fetching category: ${req.params.identifier}`);
  try {
    const { identifier } = req.params;
    
    let query = {};
    
    // Check if identifier is MongoDB ObjectId
    if (identifier.match(/^[0-9a-fA-F]{24}$/)) {
      query = { _id: identifier };
    } else {
      query = { slug: identifier };
    }
    
    const category = await db.collection("categories").findOne(query);
    
    if (!category) {
      return res.status(404).json({ success: false, error: "Category not found" });
    }
    
    res.json({ success: true, category });
  } catch (error) {
    console.error("❌ Error fetching category:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get categories with hierarchy (main + sub)
app.get("/api/categories/hierarchy", async (req, res) => {
  console.log("📁 Fetching category hierarchy...");
  try {
    // Get all main categories (parent = null)
    const mainCategories = await db.collection("categories")
      .find({ parentCategory: null })
      .sort({ order: 1 })
      .toArray();
    
    // For each main category, get its subcategories
    const categoriesWithSub = await Promise.all(
      mainCategories.map(async (cat) => {
        const subCategories = await db.collection("categories")
          .find({ parentCategory: cat.slug })
          .sort({ order: 1 })
          .toArray();
        
        return {
          ...cat,
          subCategories
        };
      })
    );
    
    res.json({ success: true, categories: categoriesWithSub });
  } catch (error) {
    console.error("❌ Error fetching hierarchy:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ==================== FARMER PRODUCTS API ====================
app.get("/api/farmer/products", async (req, res) => {
  console.log("🌾 Fetching farmer products...");
  try {
    const { type, location } = req.query;
    
    let query = { 
      $or: [
        { isFarmerProduct: true },
        { category: "farmer" },
        { parentCategory: "farmer" }
      ]
    };
    
    if (type) query.productType = type;
    if (location) query.farmLocation = location;
    
    // Sample products (you can replace with actual products collection)
    const products = [
      { id: 1, name: "Fresh Tomatoes", price: 40, unit: "kg", farmer: "Ramesh Kumar", location: "Malda", image: "🍅", freshness: "Today", organic: true },
      { id: 2, name: "Organic Potatoes", price: 30, unit: "kg", farmer: "Suresh Singh", location: "Malda", image: "🥔", freshness: "Today", organic: true },
      { id: 3, name: "Fresh Spinach", price: 20, unit: "bunch", farmer: "Priya Devi", location: "Malda", image: "🥬", freshness: "Today", organic: true },
      { id: 4, name: "Farm Fresh Eggs", price: 80, unit: "dozen", farmer: "Mohan Das", location: "Malda", image: "🥚", freshness: "Today", organic: false },
      { id: 5, name: "Organic Mangoes", price: 120, unit: "kg", farmer: "Lakhan Singh", location: "Malda", image: "🥭", freshness: "Seasonal", organic: true },
      { id: 6, name: "Fresh Milk", price: 60, unit: "liter", farmer: "Gopal Yadav", location: "Malda", image: "🥛", freshness: "Today", organic: false },
    ];
    
    res.json({
      success: true,
      products,
      message: "🌾 Fresh from farm! Direct from farmers"
    });
  } catch (error) {
    console.error("❌ Error fetching farmer products:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ==================== ADMIN: CREATE CATEGORY ====================
app.post("/api/admin/categories", async (req, res) => {
  console.log("📁 Creating new category...");
  try {
    const { name, description, icon, parentCategory, order, isActive, isFarmer } = req.body;
    
    // Generate slug from name
    const slug = name.toLowerCase().replace(/[^a-z0-9]/g, '-');
    
    // Check if category exists
    const existing = await db.collection("categories").findOne({ 
      $or: [
        { name },
        { slug }
      ]
    });
    
    if (existing) {
      return res.status(400).json({ 
        success: false, 
        error: "Category with this name already exists" 
      });
    }
    
    const category = {
      name,
      slug,
      description: description || "",
      icon: icon || "📦",
      parentCategory: parentCategory || null,
      order: order || 0,
      isActive: isActive !== undefined ? isActive : true,
      isFarmer: isFarmer || false,
      createdAt: new Date()
    };
    
    await db.collection("categories").insertOne(category);
    
    res.json({ 
      success: true, 
      message: "Category created successfully",
      category 
    });
  } catch (error) {
    console.error("❌ Error creating category:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ==================== ADMIN: UPDATE CATEGORY ====================
app.put("/api/admin/categories/:id", async (req, res) => {
  console.log(`📁 Updating category: ${req.params.id}`);
  try {
    const { id } = req.params;
    const updates = req.body;
    
    // If name is updated, update slug too
    if (updates.name) {
      updates.slug = updates.name.toLowerCase().replace(/[^a-z0-9]/g, '-');
    }
    
    updates.updatedAt = new Date();
    
    const result = await db.collection("categories").updateOne(
      { _id: id },
      { $set: updates }
    );
    
    if (result.matchedCount === 0) {
      return res.status(404).json({ success: false, error: "Category not found" });
    }
    
    res.json({ 
      success: true, 
      message: "Category updated successfully"
    });
  } catch (error) {
    console.error("❌ Error updating category:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ==================== ADMIN: DELETE CATEGORY ====================
app.delete("/api/admin/categories/:id", async (req, res) => {
  console.log(`📁 Deleting category: ${req.params.id}`);
  try {
    const { id } = req.params;
    
    // Check if category has subcategories
    const category = await db.collection("categories").findOne({ _id: id });
    
    if (!category) {
      return res.status(404).json({ success: false, error: "Category not found" });
    }
    
    // Check if it has subcategories
    const subCategories = await db.collection("categories")
      .find({ parentCategory: category.slug })
      .toArray();
    
    if (subCategories.length > 0) {
      return res.status(400).json({ 
        success: false, 
        error: "Cannot delete category with subcategories. Delete subcategories first." 
      });
    }
    
    const result = await db.collection("categories").deleteOne({ _id: id });
    
    res.json({ 
      success: true, 
      message: "Category deleted successfully" 
    });
  } catch (error) {
    console.error("❌ Error deleting category:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ==================== 404 HANDLER ====================
app.use((req, res) => {
  console.log(`❌ 404 - Route not found: ${req.method} ${req.url}`);
  res.status(404).json({ 
    error: "Route not found", 
    method: req.method,
    path: req.url,
    message: "The requested API endpoint does not exist"
  });
});

// ==================== ERROR HANDLER ====================
app.use((err, req, res, next) => {
  console.error("❌ Server error:", err);
  res.status(500).json({ 
    error: "Internal server error",
    message: err.message 
  });
});

// ==================== START SERVER ====================
const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log("\n" + "=".repeat(50));
  console.log(`🚀 SERVER STARTED SUCCESSFULLY`);
  console.log("=".repeat(50));
  console.log(`🌍 URL: https://madsha-api.onrender.com`);
  console.log(`🔌 Port: ${PORT}`);
  console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log("\n📋 Registered Routes:");
  console.log("   ✅ GET  /");
  console.log("   ✅ GET  /api/test");
  console.log("   ✅ POST /api/login/admin");
  console.log("   ✅ GET  /api/admin/users/stats");
  console.log("   ✅ GET  /api/admin/users/all");
  console.log("   ✅ GET  /api/admin/users/pending");
  console.log("   ✅ POST /api/admin/users/approve");
  console.log("   ✅ POST /api/admin/users/reject");
  console.log("   ✅ DELETE /api/admin/users/delete/:email");
  console.log("   ✅ POST /api/register/:role");
  console.log("   ✅ POST /api/login/:role");
  console.log("   ✅ POST /api/send-otp");
  console.log("   ✅ POST /api/verify-otp");
  console.log("   ✅ POST /api/forgot-password");
  console.log("   ✅ POST /api/reset-password");
  console.log("   ✅ GET  /api/dashboard/rider/:email");
  console.log("   ✅ GET  /api/dashboard/business/:email");
  console.log("   ✅ GET  /api/categories");
  console.log("   ✅ GET  /api/categories/hierarchy");
  console.log("   ✅ GET  /api/categories/:identifier");
  console.log("   ✅ GET  /api/farmer/products");
  console.log("   ✅ POST /api/admin/categories");
  console.log("   ✅ PUT  /api/admin/categories/:id");
  console.log("   ✅ DELETE /api/admin/categories/:id");
  console.log("=".repeat(50) + "\n");
});