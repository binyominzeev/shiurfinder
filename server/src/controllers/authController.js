// server/src/controllers/authController.js
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const signup = async (req, res) => {
  const { username, email, password } = req.body;

  try {
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const user = new User({ username, email, password: hashedPassword });
    await user.save();

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET || 'fallback-secret');
    res.status(201).json({ token, user: { id: user._id, username: user.username, email: user.email } });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const login = async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET || 'fallback-secret');
    res.json({ token, user: { id: user._id, username: user.username, email: user.email } });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const resetPasswordRequest = async (req, res) => {
  const { email } = req.body;

  if (!email) return res.status(400).json({ message: 'Email required' });

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.json({ message: 'If an account exists for this email, a reset link has been sent.' });
    }

    const token = crypto.randomBytes(32).toString('hex');
    const expires = Date.now() + 1000 * 60 * 60;

    user.resetPasswordToken = token;
    user.resetPasswordExpires = expires;
    await user.save();

    // Send email logic here...

    res.json({ message: 'If an account exists for this email, a reset link has been sent.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const resetPasswordConfirm = async (req, res) => {
  const { token, password } = req.body;

  if (!token || !password) return res.status(400).json({ message: 'Token and new password required' });

  try {
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    });
    if (!user) return res.status(400).json({ message: 'Invalid or expired token' });

    const hashed = await bcrypt.hash(password, 12);
    user.password = hashed;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json({ message: 'Password has been reset successfully.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  signup,
  login,
  resetPasswordRequest,
  resetPasswordConfirm
};