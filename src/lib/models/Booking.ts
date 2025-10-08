import mongoose, { Schema, models } from "mongoose";

const BookingSchema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    date: { type: String, required: true },
    time: { type: String, required: true },
    package: { type: String, required: true },
    paymentStatus: { type: String, default: "pending" }, // pending | paid
  },
  { timestamps: true }
);

const Booking = models.Booking || mongoose.model("Booking", BookingSchema);

export default Booking;
