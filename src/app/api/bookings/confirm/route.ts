// src/app/api/bookings/confirm/route.ts
import { NextResponse } from "next/server";
import { connectToDB } from "@/lib/db";
import Booking from "@/lib/models/Booking";
import Timeslot from "@/lib/models/Timeslot";
import Payment from "@/lib/models/Payment";
import { sendEmail } from "@/lib/sendEmail";
import { format } from "date-fns";

export async function POST(req: Request) {
  try {
    const { reference, timeslotId, name, email } = await req.json();

    if (!reference || !timeslotId || !name || !email) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    await connectToDB();

    /* ---------------------------------
       1️⃣ VERIFY PAYMENT
    ---------------------------------- */
    const payment = await Payment.findOne({
      reference,
      status: "PAID",
    });

    if (!payment) {
      return NextResponse.json(
        { error: "Payment not verified" },
        { status: 403 }
      );
    }

    /* ---------------------------------
       2️⃣ ATOMIC SLOT BOOKING
       (prevents double booking)
    ---------------------------------- */
    const slot = await Timeslot.findOneAndUpdate(
      { _id: timeslotId, isBooked: false },
      { isBooked: true },
      { new: true }
    );

    if (!slot) {
      return NextResponse.json(
        { error: "Timeslot already booked or not found" },
        { status: 400 }
      );
    }

    /* ---------------------------------
       3️⃣ CREATE BOOKING RECORD
    ---------------------------------- */
    const booking = await Booking.create({
      name,
      email,
      timeslot: slot._id,
      paymentReference: reference,
      paymentStatus: "PAID",
      status: "CONFIRMED",
    });

    /* ---------------------------------
       4️⃣ EMAIL CONFIRMATION
    ---------------------------------- */
    const formattedDate = format(new Date(slot.date), "EEEE, MMM d yyyy");

    const htmlTemplate = `
      <div style="font-family: Arial, sans-serif; background-color: #f7faff; padding: 24px;">
        <div style="max-width: 600px; margin: auto; background: #ffffff; border-radius: 10px;">
          <div style="background: #0077b6; padding: 20px; text-align: center;">
            <h1 style="color: white; margin: 0;">Swimingly Swim School 💦</h1>
          </div>
          <div style="padding: 20px; color: #333;">
            <h2>Hi ${name},</h2>
            <p>Your swimming session has been <strong>successfully booked!</strong></p>

            <h3>Booking Details</h3>
            <ul>
              <li><strong>Date:</strong> ${formattedDate}</li>
              <li><strong>Time:</strong> ${slot.time}</li>
              <li><strong>Location:</strong> ${slot.location}</li>
              <li><strong>Payment Ref:</strong> ${reference}</li>
            </ul>

            <p>We’re excited to have you. See you at the pool! 🏊‍♂️</p>

            <p>— Swimingly Team 💙</p>
          </div>
        </div>
      </div>
    `;

    await sendEmail(
      email,
      "✅ Your Swimingly Booking is Confirmed",
      htmlTemplate
    );

    /* ---------------------------------
       5️⃣ ADMIN NOTIFICATION
    ---------------------------------- */
    await sendEmail(
      "swiminglyschool@gmail.com",
      "📥 New Booking Confirmed",
      `
        <p><strong>${name}</strong> booked a class.</p>
        <p>Date: ${formattedDate}</p>
        <p>Time: ${slot.time}</p>
        <p>Location: ${slot.location}</p>
        <p>Reference: ${reference}</p>
      `
    );

    /* ---------------------------------
       6️⃣ RESPONSE (IMPORTANT)
    ---------------------------------- */
    return NextResponse.json({
      message: "Booking confirmed successfully",
      booking,
      slot,
    });
  } catch (error) {
    console.error("Booking confirmation error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
