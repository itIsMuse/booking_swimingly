// src/app/api/bookings/confirm/route.ts
import { NextResponse } from "next/server";
import { connectToDB } from "@/lib/db";
import Timeslot from "@/lib/models/Timeslot";

export async function POST(req: Request) {
  const { slotId } = await req.json();
  if (!slotId) return NextResponse.json({ error: "Missing slotId" }, { status: 400 });

  await connectToDB();

  try {
    const slot = await Timeslot.findById(slotId);
    if (!slot) return NextResponse.json({ error: "Slot not found" }, { status: 404 });

    if (slot.isBooked)
      return NextResponse.json({ error: "Slot already booked" }, { status: 400 });

    slot.isBooked = true;
    await slot.save();

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Booking failed" }, { status: 500 });
  }
}

