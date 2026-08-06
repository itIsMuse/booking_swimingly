import mongoose, { Schema, models } from "mongoose";

const StudentSchema = new Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    phone: {
      type: String,
      required: true,
      trim: true,
    },

    package: {
      type: Number,
      default: 8,
    },

    lessonsCompleted: {
      type: Number,
      default: 0,
    },

    lessonsRemaining: {
      type: Number,
      default: 8,
    },

    paymentStatus: {
      type: String,
      enum: ["pending", "paid"],
      default: "pending",
    },

    scheduleType: {
      type: String,
      enum: ["fixed", "flexible", null],
      default: null,
    },

    preferredLocation: {
    type: String,
    default: "",
},

    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
  },
  {
    timestamps: true,
  }
);

export default models.Student || mongoose.model("Student", StudentSchema);