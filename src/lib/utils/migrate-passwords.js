/**
 * Database Password Migration Script
 * Connects to MongoDB, finds all users and admins with plain-text passwords,
 * hashes them using bcryptjs, and saves the secure hashes back to MongoDB.
 * 
 * Usage: node src/lib/utils/migrate-passwords.js
 */

const path = require("path");
// Load environment variables from .env.local
require("dotenv").config({ path: path.resolve(process.cwd(), ".env.local") });

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const UserModel = require("../../models/UserModel");
const AdminModel = require("../../models/AdminModel");

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error("❌ MONGODB_URI environment variable is not defined in .env.local!");
  process.exit(1);
}

function isBcryptHash(password) {
  return password && (password.startsWith("$2a$") || password.startsWith("$2b$") || password.startsWith("$2y$"));
}

async function runMigration() {
  try {
    console.log("🔄 Connecting to MongoDB...");
    await mongoose.connect(MONGODB_URI);
    console.log("✅ Connected to MongoDB successfully.");

    // Build models (replicating createModel behavior)
    const UserSchema = new mongoose.Schema(UserModel, { timestamps: true });
    const AdminSchema = new mongoose.Schema(AdminModel, { timestamps: true });

    // Pre-save hooks for future-proofing
    const registerHook = (schema) => {
      schema.pre("save", async function() {
        if (!this.isModified("password")) return;
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
      });
    };
    registerHook(UserSchema);
    registerHook(AdminSchema);

    const User = mongoose.models.User || mongoose.model("User", UserSchema);
    const Admin = mongoose.models.Admin || mongoose.model("Admin", AdminSchema);

    // 1. Migrate Users
    console.log("\n👤 Checking Users password security...");
    const users = await User.find({});
    let usersUpdated = 0;

    for (const user of users) {
      if (!isBcryptHash(user.password)) {
        const plainTextPassword = user.password;
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(plainTextPassword, salt);
        await user.save();
        usersUpdated++;
        console.log(`   [UPDATED] User ${user.email} password securely hashed.`);
      }
    }
    console.log(`✅ User migration complete. Total updated: ${usersUpdated}/${users.length}`);

    // 2. Migrate Admins/Instructors
    console.log("\n🛠️ Checking Admins password security...");
    const admins = await Admin.find({});
    let adminsUpdated = 0;

    for (const admin of admins) {
      if (!isBcryptHash(admin.password)) {
        const plainTextPassword = admin.password;
        const salt = await bcrypt.genSalt(10);
        admin.password = await bcrypt.hash(plainTextPassword, salt);
        await admin.save();
        adminsUpdated++;
        console.log(`   [UPDATED] Admin/Instructor ${admin.email} password securely hashed.`);
      }
    }
    console.log(`✅ Admin migration complete. Total updated: ${adminsUpdated}/${admins.length}`);

    console.log("\n🎉 Database password security migration completed successfully!");
    process.exit(0);

  } catch (error) {
    console.error("❌ Migration error:", error);
    process.exit(1);
  }
}

runMigration();
