import cron from "node-cron";
import { User } from "../models/Employee.models.js";
import { Task } from "../models/Task.models.js";
import { Report } from "../models/Reports.models.js";
import { Attendance } from "../models/Attendance.models.js";
import { PerformanceScore } from "../models/PerformanceScore.models.js";
import { addOrUpdateRedFlag } from "./addRedFlags.js";


const isWeekend = d => d.getDay() === 0 || d.getDay() === 6;

const getWorkingDate = () => {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  while (isWeekend(d)) d.setDate(d.getDate() - 1);
  d.setHours(0, 0, 0, 0);
  return d;
};

cron.schedule("00 0 * * *", async () => {
  console.log("Daily Performance CRON Running...");

  const date = getWorkingDate();
  const start = new Date(date);
  const end = new Date(date);
  end.setHours(23, 59, 59, 999);

  const users = await User.find({}, "_id name");

  for (const user of users) {

    const todaysTasks = await Task.find({
      assignedto: user._id,
      dueAt: { $gte: start, $lte: end }
    });

    const completedTasks = todaysTasks.filter(
      t => t.status === "Completed"
    ).length;

    let taskScore = 0;
    if (todaysTasks.length) {
      const ratio = completedTasks / todaysTasks.length;
      taskScore =
        ratio === 1 ? 40 :
        ratio >= 0.75 ? 30 :
        ratio >= 0.5 ? 20 :
        ratio > 0 ? 10 : 0;
    }

    
    const report = await Report.findOne({
      user: user._id,
      date: { $gte: start, $lte: end }
    });
    const reportScore = report ? 20 : 0;

    
    const attendance = await Attendance.findOne({
      user: user._id,
      date: { $gte: start, $lte: end }
    });
    const attendanceScore = attendance ? 25 : 0;

    
    let consistency = 0;
    let daysChecked = 0;
    let cursor = new Date(start);

    while (daysChecked < 5) {
      cursor.setDate(cursor.getDate() - 1);
      if (isWeekend(cursor)) continue;

      const hasCompletedTask = await Task.exists({
        assignedto: user._id,
        completedAt: {
          $gte: new Date(cursor.setHours(0,0,0,0)),
          $lte: new Date(cursor.setHours(23,59,59,999))
        }
      });

      if (hasCompletedTask) consistency++;
      daysChecked++;
    }

    const consistencyScore =
      consistency === 5 ? 15 :
      consistency === 4 ? 12 :
      consistency === 3 ? 8 : 0;

    
    const totalScore =
      taskScore +
      reportScore +
      attendanceScore +
      consistencyScore;

 
    if (totalScore < 60) {
      await addOrUpdateRedFlag({
        userId: user._id,
        type: "Low Performance",
        severity: totalScore < 40 ? "high" : "medium",
        tags: ["Performance"],
        reason: `Daily performance dropped to ${totalScore}/100`,
        date: start
      });
    }

    await PerformanceScore.create({
      userId: user._id,
      period: "daily",
      date: start,
      scores: {
        tasks: taskScore,
        reports: reportScore,
        attendance: attendanceScore,
        consistency: consistencyScore
      },
      totalScore
    });

    console.log(`Performance saved for ${user.name}`);
  }

  console.log("Daily Performance CRON Completed");
});
