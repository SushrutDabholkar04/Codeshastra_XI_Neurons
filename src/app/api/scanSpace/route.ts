import { NextRequest, NextResponse } from 'next/server';
import { connect } from '@/dbconfig/dbconfig';
import mongoose from 'mongoose';

// Space Allocation Schema
const spaceAllocationSchema = new mongoose.Schema({
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

const SpaceAllocation = mongoose.models.Space || mongoose.model('Space', spaceAllocationSchema);

export async function POST(req: NextRequest) {
  try {
    // Parse the incoming JSON data
    const data = await req.json();
    
    console.log("📦 Received Space Allocation Data:", data);

    // Ensure the structure of the incoming data matches what you expect
    const items = data.items || [];
    const suggestions = data.suggestions || [];

    // Log the items and suggestions separately for clarity
    console.log("📝 Items to allocate:", items);
    console.log("💡 Suggestions for allocation:", suggestions);

    // Establish database connection
    await connect();

    // Prepare payload to be saved
    const payload = {
      items: items,
      suggestions: suggestions,
    };

    // Log the payload that will be saved
    console.log("📦 Data being saved to MongoDB:", payload);

    // Save to MongoDB
    const newEntry = new SpaceAllocation(payload);
    await newEntry.save();

    // Return success response
    return NextResponse.json({ status: 'received', data: payload });

  } catch (err) {
    console.error('[Space Allocation Error]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}