import User from '../models/User.js';
import Item from '../models/Item.js';

export const restoreUser = async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Admins only' });
  await User.findByIdAndUpdate(req.params.id, { isArchived: false });
  res.json({ message: 'User restored' });
};

export const restoreItem = async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Admins only' });
  await Item.findByIdAndUpdate(req.params.id, { isArchived: false });
  res.json({ message: 'Item restored' });
};