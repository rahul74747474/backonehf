import cron from "node-cron";
import { User } from "../models/Employee.models.js";
import { Report } from "../models/Reports.models.js";
import { addOrUpdateRedFlag } from "./addRedFlags.js";

cron.schedule("05 3 * * *", async () => {
  console.log("Missed Report CRON Running...");

  const users = await User.find();
  const today = new Date();
  const todayStr = today.toISOString().split("T")[0];

  for (const user of users) {
    let missed = 0;

    // Check previous 3 days
    for (let i = 1; i <= 3; i++) {
      const checkDate = new Date(today);
      checkDate.setDate(today.getDate() - i);

      const start = new Date(checkDate);
      start.setHours(0, 0, 0, 0);

      const end = new Date(checkDate);
      end.setHours(23, 59, 59, 999);

      const report = await Report.findOne({
        user: user._id,
        date: { $gte: start, $lte: end }
      });

      if (!report) missed++;
    }

    // If user missed last 3 days → red flag
    if (missed === 3) {
      await addOrUpdateRedFlag({
        userId: user._id,
        type: "Missed Report",
        severity: "high",
        reason: "Missed 3 consecutive daily reports",
        date: todayStr
      });
    }
  }

  console.log("Missed Report CRON Completed");
});
