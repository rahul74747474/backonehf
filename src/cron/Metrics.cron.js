import cron from "node-cron";
import { Task } from "../models/Task.models.js";
import { Report } from "../models/Reports.models.js";
import { Metrics } from "../models/MetricsSchema.models.js";
import { Attendance } from "../models/Attendance.models.js";

const getISTDayRangeUTC = (date) => {
  const startIST = new Date(date);
  startIST.setHours(0, 0, 0, 0);

  const endIST = new Date(date);
  endIST.setHours(23, 59, 59, 999);

  const offsetMs = 5.5 * 60 * 60 * 1000;

  return {
    startUTC: new Date(startIST.getTime() - offsetMs),
    endUTC: new Date(endIST.getTime() - offsetMs)
  };
};

cron.schedule(
  "30 03 * * *",
  async () => {
    console.log("🚀 Running Daily Metrics Job (IST Safe)");

    try {
      // 👉 Yesterday (IST)
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      const { startUTC, endUTC } = getISTDayRangeUTC(yesterday);

      // ✅ Tasks completed yesterday
      const tasksCompleted = await Task.countDocuments({
        status: "Completed",
        completedAt: { $gte: startUTC, $lte: endUTC }
      });

      // ✅ Reports submitted yesterday
      const reportsSubmitted = await Report.countDocuments({
        createdAt: { $gte: startUTC, $lte: endUTC }
      });

      // ✅ Active users (attendance)
      const activeUsers = await Attendance.countDocuments({
        $or: [
          { date: { $gte: startUTC, $lte: endUTC } },      // preferred
          { createdAt: { $gte: startUTC, $lte: endUTC } }  // fallback
        ]
      });

      // ✅ Metrics date = business day (IST start)
      await Metrics.create({
        date: startUTC,
        tasksCompleted,
        reportsSubmitted,
        activeUsers
      });

      console.log(
        "✅ Metrics saved for:",
        startUTC.toISOString(),
        { tasksCompleted, reportsSubmitted, activeUsers }
      );
    } catch (err) {
      console.error("❌ Metrics CRON Failed", err);
    }
  },
  {
    timezone: "Asia/Kolkata"
  }
);
