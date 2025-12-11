cron.schedule("25 1 * * *", async () => {
  const users = await User.find();
  const today = new Date().toISOString().split("T")[0];

  for (const user of users) {

    if (!user.performanceScore) continue;

    if (user.performanceScore < 50) {
      await addOrUpdateRedFlag({
        userId: user._id,
        type: "Low Performance",
        severity: "medium",
        reason: `Performance dropped to ${user.performanceScore}`,
        date: today
      });
    }
  }

  console.log("Performance CRON completed");
});
