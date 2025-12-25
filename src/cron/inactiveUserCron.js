import cron from "node-cron";
import { Attendance } from "../models/Attendance.models.js";
import { User } from "../models/Employee.models.js";
import { addOrUpdateRedFlag } from "./addRedFlags.js";


const isWeekend = (date) => {
  const day = date.getDay(); 
  return day === 0 || day === 6;
};


const getWorkingDaysBetween = (fromDate, toDate) => {
  let count = 0;
  const d = new Date(fromDate);

  while (d < toDate) {
    d.setDate(d.getDate() + 1);
    if (!isWeekend(d)) count++;
  }

  return count;
};

cron.schedule("00 0 * * *", async () => {
  console.log("🚀 Running Inactive User Attendance CRON...");

  const today = new Date();
  today.setHours(0, 0, 0, 0); 

  const users = await User.find({}, "_id name");

  for (const user of users) {
    
    const lastAttendance = await Attendance.findOne(
      { user: user._id },
      { date: 1 }
    ).sort({ date: -1 });

    
    if (!lastAttendance) {
      await addOrUpdateRedFlag({
        userId: user._id,
        type: "Inactive User",
        severity: "low",
        tags: ["Inactive User"],
        reason: "No attendance record found",
        date: today
      });
      continue;
    }

    const lastDate = new Date(lastAttendance.date);
    lastDate.setHours(0, 0, 0, 0);

  
    const inactiveDays = getWorkingDaysBetween(lastDate, today);

    
    if (inactiveDays >= 3) {
      await addOrUpdateRedFlag({
        userId: user._id,
        type: "Inactive User",
        severity: inactiveDays >= 7 ? "high" : inactiveDays >= 5 ? "medium" : "low",
        tags: ["Inactive User"],
        reason: `Inactive for ${inactiveDays} working days (last attendance: ${lastDate.toDateString()})`,
        date: today
      });
    }
  }

  console.log("✅ Inactive User Attendance CRON completed");
});
