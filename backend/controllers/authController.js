const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Wallet = require("../models/Wallet");
const makeReferralCode = require("../utils/referral");

function publicUser(user) {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    address: user.address,
    city: user.city,
    district: user.district,
    state: user.state,
    pincode: user.pincode,
    role: user.role,
    status: user.status,
    referralCode: user.referralCode,
    referredBy: user.referredBy,

    // TEAM STRUCTURE
    teamLeader: user.teamLeader || null,
    superTeamLeader: user.superTeamLeader || null,
    sellingTeamLeader: user.sellingTeamLeader || null,
    distributor: user.distributor || null
  };
}

async function register(req, res) {
  const { name, email, phone, address, city, district, state, pincode, password, referralCode, aadhaarNumber } = req.body;

  if (!name || !email || !phone || !address || !pincode || !password) {
    return res.status(400).json({ message: "Required fields are missing" });
  }
  if (password.length < 8) return res.status(400).json({ message: "Password must be at least 8 characters" });

  const exists = await User.findOne({ email: email.toLowerCase() });
  if (exists) return res.status(409).json({ message: "Email already registered" });

  let referredBy = null;
  if (referralCode) {
    const sponsor = await User.findOne({ referralCode });
    if (!sponsor) return res.status(400).json({ message: "Invalid referral code" });
    referredBy = sponsor._id;
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const user = await User.create({
    name, email: email.toLowerCase(), phone, address, city, district, state, pincode,
    password: passwordHash, aadhaarNumber, referredBy, referralCode: makeReferralCode(name)
  });

  await Wallet.create({ user: user._id });
  res.status(201).json({ message: "Registration successful", user: publicUser(user) });
}

async function login(req, res) {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ message: "Email and password are required" });

  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) return res.status(401).json({ message: "Invalid email or password" });

  const match = await bcrypt.compare(password, user.password);
  if (!match) return res.status(401).json({ message: "Invalid email or password" });
  if (user.status !== "ACTIVE" && user.role !== "ADMIN") {
    return res.status(403).json({ message: "Your account is not active" });
  }

  const token = jwt.sign(
    { id: user._id.toString(), email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "1d" }
  );

  res.json({ message: "Login successful", token, user: publicUser(user) });
}

module.exports = { register, login, publicUser };
