import cron from "node-cron";
import { Task } from "../models/Task.models.js";
import { SLA } from "../models/MetricsSchema.models.js";

const getYesterdayRange = () => {
  const start = new Date();
  start.setDate(start.getDate() - 1);
  start.setHours(0, 0, 0, 0);

  const end = new Date(start);
  end.setHours(23, 59, 59, 999);

  return { start, end };
};

const getLocalDateString = (date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

cron.schedule("00 0 * * *", async () => {
  console.log("Daily SLA CRON Running...");

  const { start, end } = getYesterdayRange();
  const date = getLocalDateString(start); 

  const completedTasks = await Task.find({
    completedAt: { $gte: start, $lte: end }
  });

  if (completedTasks.length === 0) {
    await SLA.create({
      date,
      onTime: 0,
      overdue: 0,
      slaPercentage: 100,
      type: "Excellent"
    });

    console.log(` No tasks on ${date}, SLA marked Excellent`);
    return;
  }

  let onTime = 0;
  let overdue = 0;

  completedTasks.forEach(task => {
    task.completedAt <= task.dueAt ? onTime++ : overdue++;
  });

  const slaPercentage = Math.round(
    (onTime / completedTasks.length) * 100
  );

  let type = "Excellent";
  if (slaPercentage < 50) type = "Critical";
  else if (slaPercentage < 75) type = "Warning";
  else if (slaPercentage < 90) type = "Good";

  await SLA.create({
    date,
    onTime,
    overdue,
    slaPercentage,
    type
  });

  console.log(
    ` SLA saved for ${date} → ${slaPercentage}% (${type})`
  );
});
