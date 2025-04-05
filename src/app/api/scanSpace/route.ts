import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const data = await req.json()
  console.log("📦 Received Scan Data:", data)

  // Perform further processing here...

  return NextResponse.json({ status: 'received', data })
}
