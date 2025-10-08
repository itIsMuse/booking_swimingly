import { NextResponse } from "next/server";
import { connectToDB } from "@/lib/db";
import Booking from "@/lib/models/Booking";

export async function GET() {
  try {
    await connectToDB();
    const bookings = await Booking.find();
    return NextResponse.json({ message: "✅ Connected successfully", bookings });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
