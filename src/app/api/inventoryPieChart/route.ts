import { connect } from '@/dbconfig/dbconfig';
import { NextResponse } from 'next/server';
import { Inventory } from '@/models/Inventory'; // Adjust the path based on your project structure

export async function GET() {
  try {
    await connect();
    const latestEntry = await Inventory.findOne().sort({ createdAt: -1 }).lean();
    if (!latestEntry) {
      return NextResponse.json({ error: "No inventory data found" }, { status: 404 });
    }
    return NextResponse.json({ ...latestEntry });
  } catch (err) {
    console.error("[Inventory Fetch Error]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
