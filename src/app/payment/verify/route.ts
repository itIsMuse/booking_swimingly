import { NextResponse } from "next/server";
import axios from "axios";
import { connectToDB } from "@/lib/db";
import Payment from "@/lib/models/Payment";
import Booking from "@/lib/models/Booking";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const reference = searchParams.get("reference");

  if (!reference) {
    return NextResponse.json({ error: "Missing reference parameter" }, { status: 400 });
  }

  const secret = process.env.PAYSTACK_SECRET_KEY;
  if (!secret) {
    console.error("Missing PAYSTACK_SECRET_KEY");
    return NextResponse.json({ error: "Server misconfigured" }, { status: 500 });
  }

  await connectToDB();

  try {
    // Verify transaction on Paystack
    const response = await axios.get(`https://api.paystack.co/transaction/verify/${reference}`, {
      headers: { Authorization: `Bearer ${secret}` },
    });

    const data = response.data?.data;
    if (!data) {
      return NextResponse.json({ error: "Could not verify payment" }, { status: 500 });
    }

    // Find payment in DB
    const payment = await Payment.findOne({ reference });
    if (!payment) {
      return NextResponse.json({ error: "Payment not found in DB" }, { status: 404 });
    }

    if (data.status === "success") {
      payment.status = "PAID";
      await payment.save();

      // Update booking if bookingId exists in metadata
      const bookingId = payment.meta?.bookingId;
      let booking = null;
      if (bookingId) {
        booking = await Booking.findByIdAndUpdate(
          bookingId,
          { paymentStatus: "paid" },
          { new: true }
        );
      }

      return NextResponse.json({
        success: true,
        message: "Payment verified successfully",
        booking,
      });
    } else {
      return NextResponse.json({
        success: false,
        message: "Payment not completed",
        status: data.status,
      });
    }
  } catch (err: any) {
    console.error("Paystack verify error", err.response?.data || err.message);
    return NextResponse.json({ error: "Verification failed" }, { status: 500 });
  }
}
