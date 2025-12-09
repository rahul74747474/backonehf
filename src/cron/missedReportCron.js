import cron from "node-cron";
import { RedFlag } from "../models/MetricsSchema.models.js";
import { User } from "../models/Employee.models.js";
import { Report } from "../models/Reports.models.js";

cron.schedule("15 1 * * *", async () => {

  const users = await User.find();

  const today = new Date();

  for (const user of users) {

    let missedCount = 0;

    // Check last 3 days: day -1, day -2, day -3
    for (let i = 1; i <= 3; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);

      const dateString = date.toISOString().split("T")[0];

      const report = await Report.findOne({
        user: user._id,
        date: {
          $gte: new Date(`${dateString}T00:00:00.000Z`),
          $lte: new Date(`${dateString}T23:59:59.999Z`)
        }
      });

      if (!report) missedCount++;
    }

    // If missed 3 consecutive days
    if (missedCount === 3) {
      await RedFlag.create({
        userId: user._id,
        type: "Missed Report",
        severity: "high",
        date: today.toISOString().split("T")[0],
        reason: "Missed 3 consecutive daily reports"
      });
    }

  }

  console.log("Missed-report check completed.");
});
