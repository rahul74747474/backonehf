import cron from "node-cron";
import { User } from "../models/Employee.models.js";
import { Report } from "../models/Reports.models.js";
import { addOrUpdateRedFlag } from "./addRedFlags.js";


const isWeekend = (date) => {
  const d = date.getDay();
  return d === 0 || d === 6;
};


const getMissedWorkingDays = async (userId, today) => {
  let missed = 0;
  let cursor = new Date(today);

  while (missed < 5) {
    cursor.setDate(cursor.getDate() - 1);

    if (isWeekend(cursor)) continue;

    const start = new Date(cursor);
    start.setHours(0, 0, 0, 0);

    const end = new Date(cursor);
    end.setHours(23, 59, 59, 999);

    const report = await Report.findOne({
      user: userId,
      date: { $gte: start, $lte: end }
    });

    if (report) break; 

    missed++;
  }

  return missed;
};

cron.schedule("00 0 * * *", async () => {
  console.log(" Missed Report CRON Running...");

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const users = await User.find({}, "_id name");

  for (const user of users) {
    const missedDays = await getMissedWorkingDays(user._id, today);

    if (missedDays >= 2) {
      await addOrUpdateRedFlag({
        userId: user._id,
        type: "Missed Report",
        severity: missedDays >= 4 ? "high" : "medium",
        tags: ["Missed Report"],
        reason: `Missed daily report for ${missedDays} consecutive working days`,
        date: today
      });
    }
  }

  console.log(" Missed Report CRON Completed");
});
