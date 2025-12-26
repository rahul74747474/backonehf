import cron from "node-cron";
import { User } from "../models/Employee.models.js";
import { Report } from "../models/Reports.models.js";
import { addOrUpdateRedFlag } from "./addRedFlags.js";

const EXCLUDED_DESIGNATIONS = ["Administrator"];

const getToday = () => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
};

const isWeekend = (date) => {
  const day = date.getDay();
  return day === 0 || day === 6;
};

cron.schedule("43 4 * * *", async () => {
  console.log("🚀 Missed Report CRON Started");

  try {
    const today = getToday();

    const users = await User.find(
      {
        "designation.name": { $ne: "Administrator" },
        "onboarding.completedAt": { $exists: true } // 🔥 onboarding completed only
      },
      "_id onboarding"
    );

    for (const user of users) {
      let missedCount = 0;
      let cursor = new Date(today);

      while (missedCount < 3) {
        cursor.setDate(cursor.getDate() - 1);

        if (isWeekend(cursor)) continue;

        // 🔥 onboarding guard
        if (
          user.onboarding?.completedAt &&
          cursor < new Date(user.onboarding.completedAt)
        ) {
          break;
        }

        const dayStart = new Date(cursor);
        dayStart.setHours(0, 0, 0, 0);

        const dayEnd = new Date(cursor);
        dayEnd.setHours(23, 59, 59, 999);

        const reportExists = await Report.exists({
          user: user._id,
          date: { $gte: dayStart, $lte: dayEnd }
        });

        if (reportExists) break;

        missedCount++;
      }

      if (missedCount >= 3) {
        await addOrUpdateRedFlag({
          userId: user._id,
          type: "Missed Report",
          severity: "medium",
          tags: ["Report"],
          reason: `Missed daily report for ${missedCount} consecutive working days`,
          date: today
        });
      }
    }

    console.log("✅ Missed Report CRON Completed");
  } catch (err) {
    console.error("❌ Missed Report CRON Failed", err);
  }
});
