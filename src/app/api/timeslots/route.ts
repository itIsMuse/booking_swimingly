import { NextResponse } from "next/server";
import { connectToDB } from "@/lib/db";
import Timeslot from "@/lib/models/Timeslot";

export async function GET() {
  await connectToDB();

  // 1️⃣ Fetch only available slots
  const slots = await Timeslot.find({ isBooked: false }).sort({
    date: 1,
    time: 1,
  });

  // 2️⃣ Format slots exactly how frontend expects
  const formattedSlots = slots.map((slot) => {
    const [startTime, endTime] = slot.time.split(" - ");

    return {
      _id: slot._id.toString(),
      date: slot.date.toISOString().split("T")[0], // yyyy-mm-dd
      startTime,
      endTime,
      location: slot.location,
      isBooked: slot.isBooked,
    };
  });

  return NextResponse.json({ slots: formattedSlots });
}
