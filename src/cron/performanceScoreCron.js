import { User } from "../models/Employee.models.js";

import { PerformanceScore } from "../models/PerformanceScore.models.js";
import cron from "node-cron";
import { Task } from "../models/Task.models.js";
import { Report } from "../models/Reports.models.js";
import { addOrUpdateRedFlag } from "./addRedFlags.js";
import { Attendance } from "../models/Attendance.models.js";
// import { Feedback } from "../models/Feedback.models.js";
// import { Review } from "../models/Review.models.js";

cron.schedule("05 3 * * *", async () => {
  console.log("Calculating daily performance...");

  const users = await User.find();

  for (let user of users) {

    const today = new Date().toISOString().split("T")[0];

    const totalTasks = await Task.countDocuments({ assignedto: user._id });
    const completedToday = await Task.countDocuments({
      assignedto: user._id,
      status: "Completed",
      completedAt: { $gte: new Date(today) }
    });

    const taskScore = totalTasks === 0 ? 0 : (completedToday / totalTasks) * 50;


    const submittedReport = await Report.findOne({
      user: user._id,
      date: today
    });

    const reportScore = submittedReport ? 20 : 0;

    const present = await Attendance.findOne({
      user: user._id,
      date: today,
      status: "Present"
    });

    const attendanceScore = present ? 20 : 0;


    // const peerFeedback = await Feedback.findOne({ user: user._id });
    // const peerScore = peerFeedback ? peerFeedback.peerRating : 0; // 0-10

    // const managerReview = await Review.findOne({ user: user._id });
    // const managerScore = managerReview ? managerReview.managerRating : 0; // 0-15

    // const hrReview = managerReview ? managerReview.hrRating : 0; // 0–5


    const totalScore =
      taskScore +
      reportScore +
      attendanceScore ;
      // peerScore +
      // managerScore +
      // hrReview;

   if (totalScore < 50) {
      await addOrUpdateRedFlag({
        userId: user._id,
        type: "Low Performance",
        severity: "medium",
        reason: `Performance dropped to ${user.performanceScore}`,
        date: today
      });
    }


    await PerformanceScore.create({
      userId: user._id,
      period: "daily",
      scores: {
        tasks: taskScore,
        reports: reportScore,
        attendance: attendanceScore,
        peer: 0,
        manager: 0,
        hr: 0,
      },
      totalScore,
    });

    console.log(`Saved performance for ${user.name}`);
  }

});
