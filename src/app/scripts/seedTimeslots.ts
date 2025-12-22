import path from "path";
import dotenv from "dotenv";
import mongoose from "mongoose";
import Timeslot from "../../lib/models/Timeslot";
import { connectToDB } from "../../lib/db";
import { addDays, format } from "date-fns";

// ✅ Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

// CONFIG
const START_HOUR = 9;
const END_HOUR = 18; // up to 6pm
const DAYS_AHEAD = 30; // seed 4 weeks

const LOCATIONS = [
  "Novatel",
  "Godaif Village",
  "Lekki Grand View",
];

async function seed() {
  await connectToDB();

  let createdCount = 0;

  for (let dayOffset = 0; dayOffset < DAYS_AHEAD; dayOffset++) {
    const dateObj = addDays(new Date(), dayOffset);
    const dateStr = format(dateObj, "yyyy-MM-dd");

    for (const location of LOCATIONS) {
      for (let hour = START_HOUR; hour < END_HOUR; hour++) {
        const startTime = `${hour.toString().padStart(2, "0")}:00`;
        const endTime = `${(hour + 1).toString().padStart(2, "0")}:00`;
        const time = `${startTime} - ${endTime}`;

        // ✅ Check if slot already exists
        const exists = await Timeslot.findOne({
          date: new Date(dateStr),
          time,
          location,
        });

        if (!exists) {
          await Timeslot.create({
            date: new Date(dateStr),
            time,
            location,
            isBooked: false,
          });
          createdCount++;
        }
      }
    }
  }

  console.log(`✅ Seed complete. ${createdCount} new slots created.`);
  mongoose.connection.close();
}

seed().catch((err) => {
  console.error("❌ Error seeding timeslots:", err);
  mongoose.connection.close();
});
