import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.post('/register', async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: "Email already in use." });

    const hashed = await bcrypt.hash(password, 10);
    await User.create({ name, email, password: hashed });

    res.status(201).json({ message: "Account created successfully. You can now log in." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Registration failed." });
  }
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user || !(await bcrypt.compare(password, user.password)))
    return res.status(400).json({ message: "Invalid credentials." });

  const token = jwt.sign({ userId: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1d' });
  // Fixed: added email to the returned user object
  res.json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
});

router.post('/forgot-password', async (req, res) => {
  const { email, currentPassword, newPassword } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "No account found with that email." });

    const valid = await bcrypt.compare(currentPassword, user.password);
    if (!valid) return res.status(400).json({ message: "Current password is incorrect." });

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();
    res.json({ message: "Password updated successfully." });
  } catch (err) {
    res.status(500).json({ message: "Failed to update password." });
  }
});

router.put('/update', authenticateToken, async (req, res) => {
  const { name, email, password } = req.body;
  const user = await User.findById(req.user.userId);
  user.name = name || user.name;
  user.email = email || user.email;
  if (password) user.password = await bcrypt.hash(password, 10);
  await user.save();
  res.json({ message: "Profile updated!", user: { id: user._id, name: user.name, email: user.email, role: user.role } });
});

export default router;