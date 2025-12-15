import cron from "node-cron";
import { RedFlag } from "../models/MetricsSchema.models.js";
import { User } from "../models/Employee.models.js";
import { addOrUpdateRedFlag } from "./addRedFlags.js";

cron.schedule("25 1 * * *", async () => {
  const users = await User.find();
  const today = new Date().toISOString().split("T")[0];

  for (const user of users) {
    if (!user.lastActiveAt) continue;

    const diff = Math.floor((Date.now() - new Date(user.lastActiveAt)) / 86400000);

    if (diff >= 3) {
      await addOrUpdateRedFlag({
        userId: user._id,
        type: "Inactive User",
        severity: "low",
        reason: `Inactive for ${diff} days`,
        date: today
      });
    }
  }

  console.log("Inactive user CRON completed");
});
