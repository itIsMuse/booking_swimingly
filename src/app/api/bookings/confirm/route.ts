// src/app/api/bookings/confirm/route.ts
import { NextResponse } from "next/server";
import { connectToDB } from "@/lib/db";
import Booking from "@/lib/models/Booking";
import Timeslot from "@/lib/models/Timeslot";
import Payment from "@/lib/models/Payment";
import { sendEmail } from "@/lib/sendEmail"; // 📩 import email utility

export async function POST(req: Request) {
  try {
    const { reference, timeslotId, name, email } = await req.json();

    if (!reference || !timeslotId || !name || !email) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    await connectToDB();

    // ✅ Confirm payment exists and is PAID
    const payment = await Payment.findOne({ reference, status: "PAID" });
    if (!payment) {
      return NextResponse.json(
        { error: "Payment not verified or not found" },
        { status: 403 }
      );
    }

    // ✅ Check if timeslot exists and is available
    const slot = await Timeslot.findById(timeslotId);
    if (!slot) {
      return NextResponse.json({ error: "Timeslot not found" }, { status: 404 });
    }
    if (slot.isBooked) {
      return NextResponse.json({ error: "Timeslot already booked" }, { status: 400 });
    }

    // ✅ Mark slot as booked
    slot.isBooked = true;
    await slot.save();

    // ✅ Create booking record
    const booking = await Booking.create({
      name,
      email,
      timeslot: timeslotId,
      paymentReference: reference,
      paymentStatus: "PAID",
      status: "CONFIRMED",
    });

    // ✅ Send branded confirmation email
    const htmlTemplate = `
      <div style="font-family: Arial, sans-serif; background-color: #f7faff; padding: 24px;">
        <div style="max-width: 600px; margin: auto; background: #ffffff; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
          <div style="background: #0077b6; padding: 20px; text-align: center;">
            <h1 style="color: white; margin: 0;">Swimingly Swim School 💦</h1>
          </div>
          <div style="padding: 20px; color: #333;">
            <h2 style="color: #0077b6;">Hi ${name},</h2>
            <p>We’re excited to let you know that your swimming class has been successfully <strong>booked and confirmed!</strong></p>
            
            <h3 style="color: #0077b6;">Booking Details:</h3>
            <ul style="list-style: none; padding: 0;">
              <li><strong>Package:</strong> Beginner 10-Class Pack</li>
              <li><strong>Date:</strong> ${slot.date}</li>
              <li><strong>Time:</strong> ${slot.time}</li>
              <li><strong>Payment Reference:</strong> ${reference}</li>
            </ul>

            <p>Thank you for trusting <strong>Swimingly Swim School</strong>. Your journey to becoming a confident swimmer starts now! 🏊‍♂️</p>
            <p>We’ll see you soon at the pool!</p>
            
            <br />
            <p>— The Swimingly Team 💙</p>
          </div>
        </div>
      </div>
    `;

    await sendEmail(
      email,
      "✅ Your Swimingly Class Booking is Confirmed!",
      htmlTemplate
    );

    // (Optional) Notify admin
    await sendEmail(
      "swiminglyschool@gmail.com", // replace with your admin email
      "📥 New Booking Received",
      `<p>${name} just booked a swimming class on <b>${slot.date}</b> at <b>${slot.time}</b>.</p>
       <p>Payment Reference: ${reference}</p>`
    );

    // ✅ Response
    return NextResponse.json({
      message: "✅ Booking confirmed & email sent successfully!",
      booking,
    });
  } catch (err: any) {
    console.error("Booking confirmation failed:", err);
    return NextResponse.json(
      { error: "Server error during booking confirmation" },
      { status: 500 }
    );
  }
}
