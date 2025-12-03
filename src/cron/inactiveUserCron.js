import cron from "node-cron";
import { RedFlag } from "../models/MetricsSchema.models.js";
import { User } from "../models/Employee.models.js";


cron.schedule("20 0 * * *", async () => {
  const threeDaysAgo = new Date(Date.now() - 3 * 24*60*60*1000);

  const inactiveUsers = await User.find({
    lastActiveAt: { $lt: threeDaysAgo }
  });

  const today = new Date().toISOString().split("T")[0];

  for (const user of inactiveUsers) {
    await RedFlag.create({
      userId: user._id,
      type: "Inactive Account",
      severity: "low",
      date: today
    });
  }

  console.log("Inactive users flagged");
});
