import cron from "node-cron";
import { Attendance } from "../models/Attendance.models.js";
import { User } from "../models/Employee.models.js";
import { addOrUpdateRedFlag } from "./addRedFlags.js";

const EXCLUDED_DESIGNATIONS = ["Administrator"];

const isWeekend = (date) => {
  const day = date.getDay();
  return day === 0 || day === 6;
};

const getWorkingDaysBetween = (fromDate, toDate) => {
  let count = 0;
  const d = new Date(fromDate);

  while (d < toDate) {
    d.setDate(d.getDate() + 1);
    if (!isWeekend(d)) count++;
  }
  return count;
};

cron.schedule("30 4 * * *", async () => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const users = await User.find({}, "_id designation");

    for (const user of users) {
      if (EXCLUDED_DESIGNATIONS.includes(user?.designation?.name)) continue;

      const lastAttendance = await Attendance.findOne(
        { user: user._id },
        { date: 1 }
      ).sort({ date: -1 });

      if (!lastAttendance) continue;

      const lastDate = new Date(lastAttendance.date);
      lastDate.setHours(0, 0, 0, 0);

      const inactiveDays = getWorkingDaysBetween(lastDate, today);

      if (inactiveDays >= 3) {
        await addOrUpdateRedFlag({
          userId: user._id,
          type: "Inactive User",
          severity:
            inactiveDays >= 7 ? "high" :
            inactiveDays >= 5 ? "medium" : "low",
          tags: ["Attendance"],
          reason: `Inactive for ${inactiveDays} working days`,
          date: today
        });
      }
    }
  } catch (err) {
    console.error("Inactive User CRON Failed", err);
  }
});
