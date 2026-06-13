import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { restoreUser, restoreItem } from '../controllers/adminController.js';
import User from '../models/User.js';
import Item from '../models/Item.js';

const router = express.Router();

// --- USERS ---
router.get('/users', authenticateToken, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).send();
  try {
    const users = await User.find({ isArchived: { $ne: true } }, '-password');
    const totalUsers = await User.countDocuments({ isArchived: { $ne: true } });
    res.json({ users, totalUsers });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/archived-users', authenticateToken, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).send();
  try {
    const users = await User.find({ isArchived: true }, '-password');
    res.json({ users });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete('/users/:id', authenticateToken, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).send();
  try {
    const user = await User.findByIdAndUpdate(req.params.id, { isArchived: true }, { new: true });
    if (!user) return res.status(404).json({ message: "User not found." });
    res.json({ message: "User archived successfully." });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put('/users/:id/restore', authenticateToken, restoreUser);

// --- ITEMS ---
router.get('/archived-items', authenticateToken, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).send();
  try {
    const items = await Item.find({ isArchived: true }); // Fixed: was 'archived', must match your Item model field
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put('/items/:id', authenticateToken, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).send();
  try {
    const { title, status, location, description, contact } = req.body;
    const updated = await Item.findByIdAndUpdate(
      req.params.id,
      { title, status, location, description, contact },
      { new: true }
    );
    if (!updated) return res.status(404).json({ message: "Item not found." });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put('/items/:id/archive', authenticateToken, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).send();
  try {
    const item = await Item.findByIdAndUpdate(req.params.id, { isArchived: true }, { new: true });
    if (!item) return res.status(404).json({ message: "Item not found." });
    res.json({ message: "Item archived." });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put('/items/:id/restore', authenticateToken, restoreItem);

export default router;