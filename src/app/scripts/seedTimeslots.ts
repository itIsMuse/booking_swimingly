import path from "path";
import dotenv from "dotenv";
import mongoose from "mongoose";
import Timeslot from "../../lib/models/Timeslot";
import { connectToDB } from "../../lib/db";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

const LOCATIONS = ["Novatel", "Godaif Village", "Lekki Grand View"] as const;

async function seed() {
  await connectToDB();

  const startHour = 9;
  const endHour = 18;

  const today = new Date();
  const daysToSeed = 14; // 2 weeks

  let created = 0;

  for (let d = 0; d < daysToSeed; d++) {
    const date = new Date(today);
    date.setDate(today.getDate() + d);
    date.setHours(0, 0, 0, 0);

    for (let hour = startHour; hour < endHour; hour++) {
      const time = `${hour}:00 - ${hour + 1}:00`;

      for (const location of LOCATIONS) {
        const exists = await Timeslot.findOne({
          date,
          time,
          location,
        });

        if (!exists) {
          await Timeslot.create({
            date,
            time,
            location,
            isBooked: false,
          });
          created++;
        }
      }
    }
  }

  console.log(`✅ Seed complete. ${created} slots created.`);
  await mongoose.connection.close();
}

seed().catch((err) => {
  console.error(err);
  mongoose.connection.close();
});
