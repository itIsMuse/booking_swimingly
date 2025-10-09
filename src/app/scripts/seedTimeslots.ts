// src/app/scripts/seedTimeslots.ts
import path from "path";
import dotenv from "dotenv";
import mongoose from "mongoose";
import Timeslot from "../../lib/models/Timeslot";
import { connectToDB } from "../../lib/db";

// ✅ Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

async function seed() {
  await connectToDB();

  // ✅ Correct structure that matches your Timeslot schema
  const sampleSlots = [
    {
      date: new Date("2025-10-09"),
      time: "09:00 - 10:00",
      location: "Novatel",
    },
    {
      date: new Date("2025-10-10"),
      time: "11:00 - 12:00",
      location: "Godaif Village",
    },
    {
      date: new Date("2025-10-12"),
      time: "15:00 - 16:00",
      location: "Lekki Grand View",
    },
  ];

  // ✅ Clear old slots (optional)
  await Timeslot.deleteMany({});
  await Timeslot.insertMany(sampleSlots);

  console.log("✅ Seeded test timeslots successfully!");
  mongoose.connection.close();
}

seed().catch((err) => {
  console.error("❌ Error seeding timeslots:", err);
  mongoose.connection.close();
});
