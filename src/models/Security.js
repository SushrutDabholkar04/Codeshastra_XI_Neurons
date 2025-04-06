import mongoose from 'mongoose';

const SecuritySchema = new mongoose.Schema({
  item: {
    type: [String], // e.g., ['person', 'bottle']
    required: true,
  },
  status_or_position: {
    type: [String], // e.g., ['added', 'removed', 'person detected']
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export const Security = mongoose.models.Security || mongoose.model('Security', SecuritySchema);