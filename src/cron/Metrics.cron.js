import cron from "node-cron";
import { Task } from "../models/Task.models.js";
import { Report } from "../models/Reports.models.js";
import { User } from "../models/Employee.models.js";
import { Metrics } from "../models/MetricsSchema.models.js";

cron.schedule("00 0 * * *", async () => {
  console.log("Running Daily Metrics Job...");

  const now = new Date();
  const last24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000); // 24 hours ago

  const tasksCompleted = await Task.countDocuments({
    status: "Completed",
    completedAt: { $gte: last24Hours, $lte: now }
  });

  const reportsSubmitted = await Report.countDocuments({
    date: { $gte: last24Hours, $lte: now }
  });

  const activeUsers = await User.countDocuments({
    lastActiveAt: { $gte: last24Hours }
  });

  await Metrics.create({
    date: now, 
    tasksCompleted,
    reportsSubmitted,
    activeUsers
  });

  console.log("Metrics recorded for last 24 hours");
});
