import cron from "node-cron";
import { RedFlag } from "../models/MetricsSchema.models.js";
import { User } from "../models/Employee.models.js";
import { Report } from "../models/Reports.models.js";

cron.schedule("10 0 * * *", async () => {
  const users = await User.find();

  const today = new Date().toISOString().split("T")[0];

  for (const user of users) {
    const report = await Report.findOne({
      user: user._id,
      date: { $gte: new Date(today + "T00:00:00.000Z") }
    });

    if (!report) {
      await RedFlag.create({
        userId: user._id,
        type: "Missed Report",
        severity: "high",
        date: today
      });
    }
  }
});
