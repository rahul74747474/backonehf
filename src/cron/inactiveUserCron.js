import cron from "node-cron";
import { RedFlag } from "../models/MetricsSchema.models.js";
import { User } from "../models/Employee.models.js";

cron.schedule("15 1 * * *", async () => {
  const users = await User.find();

  const today = new Date();
  const todayDateString = today.toISOString().split("T")[0];

  for (const user of users) {
    if (!user.lastActiveAt) continue;

    const lastActive = new Date(user.lastActiveAt);
    const diffDays = Math.floor((today - lastActive) / (1000 * 60 * 60 * 24));

    if (diffDays >= 3) {
      await RedFlag.create({
        userId: user._id,
        type: "Inactive User",
        severity: "low",
        date: todayDateString,
        reason: `Inactive for ${diffDays} days`
      });
    }
  }

  console.log("Inactive red-flag check completed.");
});
