import mongoose, { Schema, models } from "mongoose";

const PaymentSchema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },

    // amount in kobo (Paystack uses kobo)
    amount: { type: Number, required: true },

    reference: { type: String, required: true, unique: true }, // Paystack reference
    status: {
      type: String,
      enum: ["pending", "success", "failed"],
      default: "pending",
    },

    // optional link to booking once confirmed
    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
    },

    // Paystack transaction data (raw)
    gatewayResponse: { type: Object },

  },
  { timestamps: true }
);

const Payment = models.Payment || mongoose.model("Payment", PaymentSchema);

export default Payment;
