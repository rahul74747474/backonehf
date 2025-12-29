import cron from "node-cron";
import { Attendance } from "../models/Attendance.models.js";
import { User } from "../models/Employee.models.js";
import { addOrUpdateRedFlag } from "./addRedFlags.js";

const EXCLUDED_DESIGNATIONS = ["Administrator"];

cron.schedule(
  "10 00 * * *",
  async () => {
    try {
      const { istToday, utcToday } = getTodayIST_UTC();

      console.log(
        "📅 Inactive check date (IST):",
        istToday.toLocaleDateString("en-IN")
      );

      const users = await User.find({}, "_id designation");

      for (const user of users) {
        if (
          EXCLUDED_DESIGNATIONS.includes(user?.designation?.name)
        )
          continue;

        const lastAttendance = await Attendance.findOne(
          { user: user._id },
          { date: 1 }
        ).sort({ date: -1 });

        if (!lastAttendance) continue;

        const lastDateUTC = new Date(lastAttendance.date);
        lastDateUTC.setHours(0, 0, 0, 0);

        const inactiveDays = getWorkingDaysBetween(
          lastDateUTC,
          utcToday
        );

        if (inactiveDays >= 3) {
          await addOrUpdateRedFlag({
            userId: user._id,
            type: "Inactive User",
            severity:
              inactiveDays >= 7
                ? "high"
                : inactiveDays >= 5
                ? "medium"
                : "low",
            tags: ["Attendance"],
            reason: `Inactive for ${inactiveDays} working days`,
            date: new Date() // store UTC now
          });
        }
      }

      console.log("✅ Inactive User CRON completed");
    } catch (err) {
      console.error("❌ Inactive User CRON Failed", err);
    }
  },
  {
    timezone: "Asia/Kolkata"
  }
);
