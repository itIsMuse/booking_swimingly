import { NextResponse } from "next/server";
import { connectToDB } from "@/lib/db";

import Payment from "@/lib/models/Payment";
import Booking from "@/lib/models/Booking";
import Timeslot from "@/lib/models/Timeslot";

export async function POST(req: Request) {
  try {
    const { reference, timeslotId } = await req.json();

    if (!reference || !timeslotId) {
      return NextResponse.json(
        { success: false, error: "Missing reference or timeslotId" },
        { status: 400 }
      );
    }

    await connectToDB();

    // Fetch payment
    const payment = await Payment.findOne({ reference });
    if (!payment)
      return NextResponse.json({ success: false, error: "Payment not found" });

    if (payment.status !== "SUCCESS") {
      return NextResponse.json({
        success: false,
        error: "Payment not completed.",
      });
    }

    // Fetch slot
    const slot = await Timeslot.findById(timeslotId);
    if (!slot)
      return NextResponse.json({ success: false, error: "Timeslot not found" });

    if (slot.isBooked)
      return NextResponse.json({
        success: false,
        error: "This timeslot is already booked.",
      });

    // Create booking
    const booking = await Booking.create({
      name: payment.name,
      email: payment.email,
      phone: payment.phone,
      reference,
      timeslot: slot._id,
      location: slot.location,
      status: "CONFIRMED",
    });

    // Update slot + payment
    slot.isBooked = true;
    await slot.save();

    payment.bookingId = booking._id;
    await payment.save();

    return NextResponse.json({
      success: true,
      message: "Booking confirmed!",
      booking,
    });
  } catch (err: any) {
    console.error("Booking confirmation error:", err);
    return NextResponse.json(
      { success: false, error: "Server error" },
      { status: 500 }
    );
  }
}
