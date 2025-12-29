import cron from "node-cron";
import { User } from "../models/Employee.models.js";
import { Task } from "../models/Task.models.js";
import { Report } from "../models/Reports.models.js";
import { Attendance } from "../models/Attendance.models.js";
import { PerformanceScore } from "../models/PerformanceScore.models.js";
import { addOrUpdateRedFlag } from "./addRedFlags.js";

/* =========================
   IST DATE HELPERS
========================= */
const getYesterdayISTRange = () => {
  const nowIST = new Date(
    new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" })
  );

  const yesterday = new Date(nowIST);
  yesterday.setDate(yesterday.getDate() - 1);
  yesterday.setHours(0, 0, 0, 0);

  const dayStart = new Date(yesterday);
  const dayEnd = new Date(yesterday);
  dayEnd.setHours(23, 59, 59, 999);

  return { yesterday, dayStart, dayEnd };
};

/* =========================
   CRON
========================= */
cron.schedule(
  "10 00 * * *",
  async () => {
    try {
      const { yesterday, dayStart, dayEnd } = getYesterdayISTRange();

      console.log(
        "📅 Scoring date (IST):",
        yesterday.toLocaleDateString("en-IN")
      );

      const users = await User.find(
        { "designation.name": { $ne: "Administrator" } },
        "_id"
      );

      for (const user of users) {
        /* =========================
           TASK SCORE
        ========================= */
        const tasks = await Task.find({
          assignedto: user._id,
          dueAt: { $gte: dayStart, $lte: dayEnd }
        });

        const completed = tasks.filter(
          (t) => t.status === "Completed"
        ).length;

        let taskScore = 0;
        if (tasks.length) {
          const ratio = completed / tasks.length;
          taskScore =
            ratio === 1
              ? 40
              : ratio >= 0.75
              ? 30
              : ratio >= 0.5
              ? 20
              : ratio > 0
              ? 10
              : 0;
        }

        /* =========================
           REPORT SCORE
        ========================= */
        const reportScore = (await Report.exists({
          user: user._id,
          date: { $gte: dayStart, $lte: dayEnd }
        }))
          ? 20
          : 0;

        /* =========================
           ATTENDANCE SCORE
        ========================= */
        const attendanceScore = (await Attendance.exists({
          user: user._id,
          date: { $gte: dayStart, $lte: dayEnd }
        }))
          ? 25
          : 0;

        const totalScore =
          taskScore + reportScore + attendanceScore;

        /* =========================
           UPSERT PERFORMANCE SCORE
        ========================= */
        await PerformanceScore.findOneAndUpdate(
          {
            userId: user._id,
            date: yesterday,
            period: "daily"
          },
          {
            $set: {
              scores: {
                tasks: taskScore,
                reports: reportScore,
                attendance: attendanceScore
              },
              totalScore
            }
          },
          { upsert: true }
        );

        /* =========================
           LAST 3 DAYS AVG CHECK
        ========================= */
        const fromDate = new Date(yesterday);
        fromDate.setDate(fromDate.getDate() - 2);

        const last3 = await PerformanceScore.find({
          userId: user._id,
          period: "daily",
          date: { $gte: fromDate, $lte: yesterday }
        });

        if (last3.length === 3) {
          const avg =
            last3.reduce((s, d) => s + d.totalScore, 0) / 3;

          if (avg < 50) {
            await addOrUpdateRedFlag({
              userId: user._id,
              type: "Low Performance",
              severity: avg < 30 ? "high" : "medium",
              tags: ["Performance"],
              reason: `3-day average performance dropped to ${Math.round(
                avg
              )}/100`,
              date: new Date() // today IST
            });
          }
        }
      }

      console.log("✅ Performance CRON completed successfully");
    } catch (err) {
      console.error("❌ Performance CRON Failed", err);
    }
  },
  {
    timezone: "Asia/Kolkata"
  }
);
