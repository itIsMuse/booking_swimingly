import { NextResponse } from "next/server";
import { connectToDB } from "@/lib/db";
import  Timeslot  from "@/lib/models/Timeslot";
import  Booking  from "@/lib/models/Booking";
import { isAfter } from "date-fns";

// 1️⃣ Define what a Timeslot looks like
interface ITimeslot {
  _id: string;
  start: Date;
  end: Date;
  capacity: number;
  location?: string;
  __v?: number;
}

// 2️⃣ Define what we’ll send back to the client
interface IAvailableSlot extends ITimeslot {
  spotsLeft: number;
}

export async function GET() {
  await connectToDB();

  const now = new Date();
  const future = new Date();
  future.setDate(now.getDate() + 30);

  // 3️⃣ Tell TypeScript what the find() will return
  const timeslots = (await Timeslot.find({
    start: { $gte: now, $lte: future },
  })
    .sort({ start: 1 })
    .lean()) as ITimeslot[];

  // 4️⃣ Calculate spots left for each slot
  const slotsWithAvailability: IAvailableSlot[] = await Promise.all(
    timeslots.map(async (t) => {
      const bookedCount = await Booking.countDocuments({
        timeslotId: t._id,
        status: "BOOKED",
      });
      const spotsLeft = Math.max(0, (t.capacity || 1) - bookedCount);
      return { ...t, spotsLeft };
    })
  );

  // 5️⃣ Only keep those still available and in the future
  const available = slotsWithAvailability.filter(
    (s) => s.spotsLeft > 0 && isAfter(new Date(s.start), new Date())
  );

  return NextResponse.json({ slots: available });
}
