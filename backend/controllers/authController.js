const User = require("../models/User");
const jwt = require("jsonwebtoken");

exports.login = async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username });
  if (!user) return res.status(400).json({ message: "Invalid credentials" });
  const isMatch = await user.comparePassword(password);
  if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });
  const token = jwt.sign(
    { id: user._id, username: user.username, isAdmin: user.isAdmin },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || "1d" }
  );
  res.json({ token, user: { username: user.username, isAdmin: user.isAdmin } });
};

exports.register = async (req, res) => {
  const { username, password, isAdmin } = req.body;
  const exists = await User.findOne({ username });
  if (exists) return res.status(400).json({ message: "User already exists" });
  const user = new User({ username, password, isAdmin });
  await user.save();
  res.status(201).json({ message: "User registered" });
};
