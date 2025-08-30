// Simple script to create an admin user
const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config();
const User = require("../models/User");

async function run() {
  if (!process.env.MONGO_URI) {
    console.error("MONGO_URI not set in environment");
    process.exit(1);
  }
  await mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  const username = process.argv[2] || "admin";
  const password = process.argv[3] || "admin123";
  const exists = await User.findOne({ username });
  if (exists) {
    console.log("Admin user already exists:", username);
    process.exit(0);
  }
  const u = new User({ username, password, isAdmin: true });
  await u.save();
  console.log("Created admin user:", username);
  process.exit(0);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
