import cron from "node-cron";
import { User } from "../models/Employee.models.js";
import { Report } from "../models/Reports.models.js";
import { addOrUpdateRedFlag } from "./addRedFlags.js";

/* =========================
   IST HELPERS
========================= */
const getTodayIST = () => {
  const ist = new Date(
    new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" })
  );
  ist.setHours(0, 0, 0, 0);
  return ist;
};

const isWeekendIST = (date) => {
  const ist = new Date(
    date.toLocaleString("en-US", { timeZone: "Asia/Kolkata" })
  );
  const day = ist.getDay();
  return day === 0 || day === 6;
};

const getISTDayRangeUTC = (istDate) => {
  const startIST = new Date(istDate);
  startIST.setHours(0, 0, 0, 0);

  const endIST = new Date(istDate);
  endIST.setHours(23, 59, 59, 999);

  return {
    startUTC: new Date(startIST.getTime() - 5.5 * 60 * 60 * 1000),
    endUTC: new Date(endIST.getTime() - 5.5 * 60 * 60 * 1000)
  };
};

/* =========================
   CRON
========================= */
cron.schedule(
  "10 00 * * *",
  async () => {
    console.log("🚀 Missed Report CRON Started");

    try {
      const todayIST = getTodayIST();

      const users = await User.find(
        { "designation.name": { $ne: "Administrator" } },
        "_id"
      );

      for (const user of users) {
        let missedCount = 0;
        let cursorIST = new Date(todayIST);

        while (true) {
          cursorIST.setDate(cursorIST.getDate() - 1);

          // ✅ skip weekends
          if (isWeekendIST(cursorIST)) continue;

          const { startUTC, endUTC } =
            getISTDayRangeUTC(cursorIST);

          const reportExists = await Report.exists({
            user: user._id,
            date: { $gte: startUTC, $lte: endUTC }
          });

          // chain breaks if report found
          if (reportExists) break;

          missedCount++;

          // only care about 3+
          if (missedCount >= 3) break;
        }

        // 🔥 add red flag ONLY if 3+ consecutive
        if (missedCount >= 3) {
          await addOrUpdateRedFlag({
            userId: user._id,
            type: "Missed Report",
            severity: "medium",
            tags: ["Report"],
            reason: `Missed daily report for ${missedCount} consecutive working days`,
            date: new Date() // UTC now
          });
        }
      }

      console.log("✅ Missed Report CRON Completed");
    } catch (err) {
      console.error("❌ Missed Report CRON Failed", err);
    }
  },
  {
    timezone: "Asia/Kolkata"
  }
);
