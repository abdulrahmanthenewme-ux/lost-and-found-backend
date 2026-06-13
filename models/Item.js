import mongoose from 'mongoose';

const itemSchema = new mongoose.Schema({
  title: { type: String, required: true },
  status: { type: String, default: 'Lost' },
  location: { type: String, required: true },
  description: { type: String, required: true },
  contact: { type: String, required: true },
  image: { type: String, default: '' },
  userId: { type: String, required: true },
  isArchived: { type: Boolean, default: false }
});

export default mongoose.model('Item', itemSchema);