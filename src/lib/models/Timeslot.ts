// models/Timeslot.ts
import "dotenv/config";
import mongoose, { Schema, models } from "mongoose";

const TimeslotSchema = new Schema(
  {
    date: {
      type: Date,
      required: true,
    },
    time: {
      type: String,
      required: true,
    },
    location: {
      type: String,
      enum: ["Novatel", "Godaif Village", "Lekki Grand View"],
      required: true,
    },
    isBooked: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// ✅ COMPOUND UNIQUE INDEX
TimeslotSchema.index(
  { date: 1, time: 1, location: 1 },
  { unique: true }
);

const Timeslot =
  models.Timeslot || mongoose.model("Timeslot", TimeslotSchema);

export default Timeslot;
