import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    {
      success: false,
      message: "Booking confirmation endpoint is not active yet.",
    },
    { status: 501 }
  );
}