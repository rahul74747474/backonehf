import cron from "node-cron";
import { User } from "../models/Employee.models.js";

cron.schedule("20 0 * * *", async () => {
  try {
    const users = await User.find({ recentActivity: { $exists: true, $ne: [] } });

    if (!users.length) {
      console.log("No recent activity to clear");
      return;
    }

    for (const user of users) {
      user.recentActivity = [];
      await user.save();
    }

    console.log("✅ Recent activities cleared for all users");
  } catch (error) {
    console.error("❌ Cron error while clearing recentActivity:", error.message);
  }
},
 {
    timezone: "Asia/Kolkata"
  });
