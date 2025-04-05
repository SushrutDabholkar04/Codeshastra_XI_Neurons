import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const data = await req.json()
  console.log("📦 Received from Python backend:", data)

  // TODO: Further processing like DB save, alerts, etc.
  return NextResponse.json({ status: 'ok', received: data })
}
