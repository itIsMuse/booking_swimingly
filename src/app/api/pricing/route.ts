// src/app/api/pricing/route.ts
import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({ amountNGN: 150000 });
}
