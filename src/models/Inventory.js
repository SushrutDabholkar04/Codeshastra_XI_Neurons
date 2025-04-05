import mongoose from 'mongoose';

const InventorySchema = new mongoose.Schema({
  before: {
    type: Object,
    required: true,
  },
  after: {
    type: Object,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export const Inventory = mongoose.models.Inventory || mongoose.model('Inventory', InventorySchema);