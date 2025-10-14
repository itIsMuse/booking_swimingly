import { NextResponse } from "next/server";
import crypto from "crypto";
import { connectToDB } from "@/lib/db";
import  Payment  from "@/lib/models/Payment";
import Booking from "@/lib/models/Booking";

export async function POST(req: Request) {
  const secret = process.env.PAYSTACK_SECRET_KEY;
  if (!secret) {
    console.error("Missing PAYSTACK_SECRET_KEY");
    return NextResponse.json({ error: "Server misconfigured" }, { status: 500 });
  }

  const rawBody = await req.text();
  const signature = req.headers.get("x-paystack-signature");

  // Verify Paystack signature
  const hash = crypto.createHmac("sha512", secret).update(rawBody).digest("hex");
  if (hash !== signature) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  const event = JSON.parse(rawBody);

  await connectToDB();

  if (event.event === "charge.success") {
    const reference = event.data.reference;
    const payment = await Payment.findOne({ reference });

    if (!payment) {
      console.error("Payment not found for reference:", reference);
      return NextResponse.json({ message: "Payment not found" });
    }

    // Update payment status to 'paid'
    payment.status = "PAID";
    await payment.save();

    // Link to booking
    const bookingId = payment.meta?.bookingId;
    if (bookingId) {
      await Booking.findByIdAndUpdate(bookingId, { paymentStatus: "paid" });
    }

    console.log(`✅ Payment confirmed for ${reference}`);
  }

  return NextResponse.json({ received: true });
}

