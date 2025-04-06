import mongoose from 'mongoose';

const SpaceAllocationSchema = new mongoose.Schema({
  items: {
    type: [String], // e.g., ['chair', 'table', 'cabinet']
    required: true,
  },
  suggestions: {
    type: [String], // e.g., ['move chair to left', 'add another table']
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export const SpaceAllocation =
  mongoose.models.SpaceAllocation || mongoose.model('SpaceAllocation', SpaceAllocationSchema);