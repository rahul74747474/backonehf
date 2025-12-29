import cron from "node-cron";
import { DateTime } from "luxon";

import { Task } from "../models/Task.models.js";
import { SLA } from "../models/MetricsSchema.models.js";



const COMPANY_TIMEZONE = "Asia/Kolkata";



const getYesterdayRangeUTC = () => {
  const start = DateTime.now()
    .setZone(COMPANY_TIMEZONE)
    .startOf("day")
    .minus({ days: 1 });

  const end = start.endOf("day");

  return {
    startUTC: start.toUTC().toJSDate(),
    endUTC: end.toUTC().toJSDate(),
    dateString: start.toISODate() 
  };
};



cron.schedule(
  "50 00 * * *",
  async () => {
    console.log(" Daily SLA CRON Running...");

    try {
      const { startUTC, endUTC, dateString } =
        getYesterdayRangeUTC();

      const completedTasks = await Task.find({
        completedAt: { $gte: startUTC, $lte: endUTC }
      });

      if (completedTasks.length === 0) {
        await SLA.create({
          date: dateString,
          onTime: 0,
          overdue: 0,
          slaPercentage: 100,
          type: "Excellent"
        });

        console.log(` No tasks on ${dateString}, SLA marked Excellent`);
        return;
      }

      let onTime = 0;
      let overdue = 0;

      completedTasks.forEach((task) => {
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
        date: dateString,
        onTime,
        overdue,
        slaPercentage,
        type
      });

      console.log(
        ` SLA saved for ${dateString} → ${slaPercentage}% (${type})`
      );
    } catch (err) {
      console.error(" Daily SLA CRON Failed", err);
    }
  },
  {
    timezone: COMPANY_TIMEZONE 
  }
);
