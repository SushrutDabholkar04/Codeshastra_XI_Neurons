import { NextResponse } from 'next/server';

export async function GET() {
  const res = await fetch('http://localhost:5001/process');
  const data = await res.json();

  // You can now modify `data` before returning if needed
  return NextResponse.json(data);
}
