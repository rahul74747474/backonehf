import cron from "node-cron";
import { Task } from "../models/Task.models.js";
import { Report } from "../models/Reports.models.js";
import { User } from "../models/Employee.models.js";
import { Metrics } from "../models/MetricsSchema.models.js";
import { Attendance } from "../models/Attendance.models.js";

cron.schedule("20 0 * * *", async () => {
  console.log("Running Daily Metrics Job...");

 
  const startOfYesterday = new Date();
  startOfYesterday.setDate(startOfYesterday.getDate() - 1);
  startOfYesterday.setHours(0, 0, 0, 0);

  const endOfYesterday = new Date();
  endOfYesterday.setDate(endOfYesterday.getDate() - 1);
  endOfYesterday.setHours(23, 59, 59, 999);

 
  const tasksCompleted = await Task.countDocuments({
    status: "Completed",
    completedAt: {
      $gte: startOfYesterday,
      $lte: endOfYesterday
    }
  });

 
  const reportsSubmitted = await Report.countDocuments({
    createdAt: {
      $gte: startOfYesterday,
      $lte: endOfYesterday
    }
  });

  
  const activeUsers = await Attendance.countDocuments({
    date: {
      $gte: startOfYesterday,
      $lte: endOfYesterday
    }
  });

  await Metrics.create({
    date: endOfYesterday, 
    tasksCompleted,
    reportsSubmitted,
    activeUsers
  });

  console.log("Metrics recorded for:", endOfYesterday.toDateString());
});
