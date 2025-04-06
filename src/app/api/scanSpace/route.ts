import { type NextRequest, NextResponse } from "next/server"
import { connect } from "@/dbconfig/dbconfig"
import mongoose from "mongoose"
import { GoogleGenAI } from "@google/genai"

// Space Allocation Schema
const spaceAllocationSchema = new mongoose.Schema({
  items: {
    type: [String],
    required: true,
  },
  suggestions: {
    type: [String],
    required: true,
  },
  formattedSuggestions: {
    type: String,
    required: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
})

const SpaceAllocation = mongoose.models.Space || mongoose.model("Space", spaceAllocationSchema)

// Format raw suggestions using Gemini AI
async function formatSuggestionsWithGemini(items: string[], suggestions: string[]) {
  try {
    // Initialize Gemini API
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

    // // Create a combined prompt with items and suggestions
    let combinedData = "Items detected and their suggestions:\n"
    for (let i = 0; i < items.length; i++) {
      combinedData += `- ${items[i]}: ${suggestions[i]}\n`
    }

    // // Create the prompt for Gemini
    const prompt = `
      You are a professional space optimization assistant. 
      Based on the following items detected in a room and their raw suggestions, 
      provide a well-formatted, natural language summary of space optimization recommendations.
      Make it concise, professional, and actionable.
      
      ${combinedData}
      
      Format your response as a few paragraphs of professional advice. 
      Focus on practical suggestions for better space utilization.
    // `

    // // Generate content with Gemini
      const response = await ai.models.generateContent({
        model: "gemini-2.0-flash",
        contents: `${prompt}`,
      });
      console.log(response.text);
      return response.text
  } catch (error) {
    console.error("Error formatting with Gemini:", error)
    return null
  }
}

export async function POST(req: NextRequest) {
  try {
    // Parse the incoming JSON data
    const data = await req.json()

    console.log("📦 Received Space Allocation Data:", data)

    // Ensure the structure of the incoming data matches what you expect
    const items = data.items || []
    const suggestions = data.suggestions || []

    // Log the items and suggestions separately for clarity
    console.log("📝 Items to allocate:", items)
    console.log("💡 Suggestions for allocation:", suggestions)

    // Format suggestions with Gemini
    const formattedSuggestions = await formatSuggestionsWithGemini(items, suggestions)

    // Establish database connection
    await connect()

    // Prepare payload to be saved
    const payload = {
      items: items,
      suggestions: suggestions,
      formattedSuggestions: formattedSuggestions,
    }

    // Log the payload that will be saved
    console.log("📦 Data being saved to MongoDB:", payload)

    // Save to MongoDB
    const newEntry = new SpaceAllocation(payload)
    await newEntry.save()

    // Return success response with formatted suggestions
    return NextResponse.json({
      status: "received",
      data: payload,
      formattedSuggestions,
    })
  } catch (err) {
    console.error("[Space Allocation Error]", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// GET endpoint to retrieve the latest scan
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

