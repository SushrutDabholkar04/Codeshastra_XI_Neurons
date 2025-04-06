import { type NextRequest, NextResponse } from "next/server"
import mongoose from "mongoose"
import { connect } from "@/dbconfig/dbconfig"

// Define the schema for Security logs
const securitySchema = new mongoose.Schema({
  items: [String], // Items detected
  status_or_position: [String], // Added/Removed statuses
  timestamp: {
    type: Date,
    default: Date.now,
  },
})

const Security = mongoose.models.Security || mongoose.model("Security", securitySchema)

// GET handler to fetch the most recent logs
export async function GET() {
  try {
    await connect()

    // Fetch the 5 most recent entries
    const recentLogs = await Security.find().sort({ timestamp: -1 }).limit(5).lean()

    return NextResponse.json({
      success: true,
      logs: recentLogs,
    })
  } catch (err) {
    console.error("[Security Error]", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const data = await req.json()
    console.log("🔐 Received from Python backend:", data)

    await connect()

    // Assuming data is like: { "item": [...], "status_or_position": [...] }
    const { item, status_or_position } = data

    // Ensure both arrays have the same length
    if (item.length !== status_or_position.length) {
      return NextResponse.json({ error: "Items and statuses must have the same length" }, { status: 400 })
    }

    // Create the new entry in the Security log
    const newEntry = new Security({
      items: item,
      status_or_position: status_or_position,
    })

    await newEntry.save()

    console.log("✅ Security data saved.")

    // Return the received data as a success response
    return NextResponse.json({
      success: true,
      message: "Security log saved",
      data: { item, status_or_position },
    })
  } catch (err) {
    console.error("[Security Error]", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

