import { type NextRequest, NextResponse } from "next/server"
import { connect } from "@/dbconfig/dbconfig"
import mongoose from "mongoose"

// Space Allocation Schema (reference only - using the model from the main route)
const SpaceAllocation = mongoose.models.Space || mongoose.model("Space")

export async function GET(req: NextRequest) {
  try {
    // Establish database connection
    await connect()

    // Get the latest entry
    const latestEntry = await SpaceAllocation.findOne().sort({ createdAt: -1 })

    if (!latestEntry) {
      return NextResponse.json({ message: "No scan data available" }, { status: 404 })
    }

    return NextResponse.json({
      items: latestEntry.items,
      suggestions: latestEntry.suggestions,
      formattedSuggestions: latestEntry.formattedSuggestions,
      createdAt: latestEntry.createdAt,
    })
  } catch (err) {
    console.error("[Space Allocation Error]", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

