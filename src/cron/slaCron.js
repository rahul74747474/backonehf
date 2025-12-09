import cron from "node-cron";
import { Task } from "../models/Task.models.js";
import { SLA } from "../models/MetricsSchema.models.js";



cron.schedule("15 1 * * *", async () => {
  const today = new Date().toISOString().split("T")[0];

  const tasks = await Task.find();

  const onTime = tasks.filter(t => t.completedAt && t.completedAt <= t.dueAt).length;
  const overdue = tasks.filter(t => t.completedAt && t.completedAt > t.dueAt).length;

  const slaPercentage = Math.round((onTime / (onTime + overdue)) * 100);

  await SLA.create({
    date: today,
    onTime,
    overdue,
    slaPercentage
  });
});
