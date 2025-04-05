import { NextResponse } from 'next/server';
import { connect } from '@/dbconfig/dbconfig';
import mongoose from 'mongoose';

// Updated schema
const inventorySchema = new mongoose.Schema({
  before: {
    items: [String],
    number_of_items: [Number],
  },
  after: {
    items: [String],
    number_of_items: [Number],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Inventory =
  mongoose.models.Inventory || mongoose.model('Inventory', inventorySchema);

export async function GET() {
  try {
    const res = await fetch('http://localhost:5001/process');
    const data = await res.json();

    if (data.error) {
      return NextResponse.json({ error: data.error }, { status: 400 });
    }

    await connect();

    // 🧠 Extract keys and values from data.before / after
    const beforeKeys = Object.keys(data.before || {});
    const afterKeys = Object.keys(data.after || {});

    const beforeValues = beforeKeys.map((key) => data.before[key]);
    const afterValues = afterKeys.map((key) => data.after[key]);

    const payload = {
      before: {
        items: beforeKeys,
        number_of_items: beforeValues,
      },
      after: {
        items: afterKeys,
        number_of_items: afterValues,
      },
    };

    // ✅ Log final structured payload
    console.log("📦 Data being saved to MongoDB:");
    console.log(payload);

    const newEntry = new Inventory(payload);
    await newEntry.save();

    return NextResponse.json({ success: true, ...payload });
  } catch (err) {
    console.error('[Inventory Error]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}