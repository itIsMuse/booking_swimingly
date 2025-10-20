import mongoose, { Schema, models } from "mongoose";

const PaymentSchema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },

    // amount in naira (we divide before saving)
    amount: { type: Number, required: true },

    reference: { type: String, required: true, unique: true },

    status: {
      type: String,
      enum: ["PENDING", "SUCCESS", "FAILED"],
      default: "PENDING", // ✅ fixed case
    },

    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
    },

    gatewayResponse: { type: Object },
  },
  { timestamps: true }
);

const Payment = models.Payment || mongoose.model("Payment", PaymentSchema);

export default Payment;
