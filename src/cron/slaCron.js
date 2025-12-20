import cron from "node-cron";
import { Task } from "../models/Task.models.js";
import { SLA } from "../models/MetricsSchema.models.js";



cron.schedule("00 0 * * *", async () => {
  const today = new Date().toISOString().split("T")[0];

  const tasks = await Task.find();

  const onTime = tasks.filter(t => t.completedAt && t.completedAt <= t.dueAt).length;
  const overdue = tasks.filter(t => t.completedAt && t.completedAt > t.dueAt).length;

  const slaPercentage = Math.round((onTime / (onTime + overdue)) * 100);
  let type ="Low"
  if(slaPercentage<=30){
    type = "Critical"
  }
  else if(slaPercentage>30 && slaPercentage<=60){
    type = "Medium"
  }
  else{
    type = "Low"
  }

  await SLA.create({
    date: today,
    onTime,
    overdue,
    slaPercentage,
    type
  });

  console.log("Sla Cron Completed")
});
