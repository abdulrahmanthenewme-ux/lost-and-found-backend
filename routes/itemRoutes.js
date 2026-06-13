import express from 'express';
import multer from 'multer';
import Item from '../models/Item.js';

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

router.get('/', async (req, res) => {
  try {
    const items = await Item.find({ isArchived: false });
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', upload.single('image'), async (req, res) => {
  try {
    const { title, status, location, description, contact, userId } = req.body;
    const newItem = new Item({
      title, status, location, description, contact, userId,
      image: req.file ? req.file.path.replace(/\\/g, '/') : ''  // fix backslashes
    });
    await newItem.save();
    res.status(201).json(newItem);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', upload.single('image'), async (req, res) => {
  try {
    const { title, status, location, description, contact } = req.body;
    const updateData = { title, status, location, description, contact };
    if (req.file) updateData.image = req.file.path.replace(/\\/g, '/');

    const updated = await Item.findByIdAndUpdate(req.params.id, updateData, { new: true });
    if (!updated) return res.status(404).json({ message: "Item not found." });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const item = await Item.findByIdAndUpdate(req.params.id, { isArchived: true }, { new: true });
    if (!item) return res.status(404).json({ message: "Item not found." });
    res.json({ message: "Item archived successfully." });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id/restore', async (req, res) => {
  try {
    const item = await Item.findByIdAndUpdate(req.params.id, { isArchived: false }, { new: true });
    if (!item) return res.status(404).json({ message: "Item not found." });
    res.json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;