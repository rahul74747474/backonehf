import cron from "node-cron";
import { Task } from "../models/Task.models.js";
import { Report } from "../models/Reports.models.js";
import { User } from "../models/Employee.models.js";
import { Metrics } from "../models/MetricsSchema.models.js";


cron.schedule("0 0 * * *", async () => {
  console.log("Running Daily Metrics Job...");

  const today = new Date().toISOString().split("T")[0];

  const tasksCompleted = await Task.countDocuments({
    status: "Completed",
    completedAt: {
      $gte: new Date(today + "T00:00:00.000Z"),
      $lte: new Date(today + "T23:59:59.999Z")
    }
  });

  const reportsSubmitted = await Report.countDocuments({
    date: {
      $gte: new Date(today + "T00:00:00.000Z"),
      $lte: new Date(today + "T23:59:59.999Z")
    }
  });

  const activeUsers = await User.countDocuments({
    lastActiveAt: { $gte: new Date(today + "T00:00:00.000Z") }
  });

  await Metrics.create({
    date: today,
    tasksCompleted,
    reportsSubmitted,
    activeUsers
  });

  console.log(`Metrics recorded for ${today}`);
});
