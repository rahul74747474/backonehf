import cron from "node-cron";
import { User } from "../models/Employee.models.js";
import { PerformanceScore } from "../models/PerformanceScore.models.js";


cron.schedule("0 1 * * *", async () => {
  const users = await User.find();

  for (const user of users) {
    const score = {
      productivity: Math.floor(Math.random() * 30),
      reports: Math.floor(Math.random() * 20),
      attendance: Math.floor(Math.random() * 15),
      managerReview: Math.floor(Math.random() * 15),
      behavior: Math.floor(Math.random() * 10),
      peerFeedback: Math.floor(Math.random() * 10)
    };

    const totalScore = Object.values(score).reduce((a,b) => a+b, 0);

    await PerformanceScore.create({
      userId: user._id,
      date: new Date().toISOString().split("T")[0],
      breakdown: score,
      totalScore
    });
  }

  console.log("Performance score updated");
});
