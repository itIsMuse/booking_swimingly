import { NextResponse } from "next/server";
import Booking from "@/lib/models/Booking";
import {connectToDB} from "@/lib/db";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const reference = searchParams.get("reference");

  if (!reference) {
    return NextResponse.json({ error: "Missing reference" }, { status: 400 });
  }

  try {
    // Connect to MongoDB
    await connectToDB();

    // Verify with Paystack
    const verifyRes = await fetch(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        },
      }
    );

    const data = await verifyRes.json();

    if (data.data.status === "success") {
      // Extract email or custom metadata to find booking
      const customerEmail = data.data.customer.email;

      // Update paymentStatus to 'paid' in your Booking model
      const booking = await Booking.findOneAndUpdate(
        { email: customerEmail, paymentStatus: "pending" },
        { paymentStatus: "paid" },
        { new: true }
      );

      if (!booking) {
        return NextResponse.json(
          { message: "Booking not found or already paid" },
          { status: 404 }
        );
      }

      return NextResponse.json({
        message: "Payment verified successfully",
        booking,
      });
    } else {
      return NextResponse.json(
        { message: "Payment verification failed", data },
        { status: 400 }
      );
    }
  } catch (error: any) {
    console.error(error);
    return NextResponse.json(
      { error: "An error occurred", details: error.message },
      { status: 500 }
    );
  }
}
