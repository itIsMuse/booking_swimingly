import mongoose, { Schema, models, model, Model } from "mongoose";

export interface ITimeslot {
  date: Date;
  time: string;
  location: "Novatel" | "Godaif Village" | "Lekki Grand View";
  isBooked: boolean;
}

const TimeslotSchema = new Schema<ITimeslot>(
  {
    date: { type: Date, required: true },
    time: { type: String, required: true },
    location: {
      type: String,
      enum: ["Novatel", "Godaif Village", "Lekki Grand View"],
      required: true,
    },
    isBooked: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// ✅ UNIQUE INDEX (VERY IMPORTANT)
TimeslotSchema.index(
  { date: 1, time: 1, location: 1 },
  { unique: true }
);

const Timeslot: Model<ITimeslot> =
  models.Timeslot || model<ITimeslot>("Timeslot", TimeslotSchema);

export default Timeslot;
