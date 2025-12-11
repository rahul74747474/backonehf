import { RedFlag } from "../models/MetricsSchema.models.js";

export const addOrUpdateRedFlag = async ({
  userId,
  type,
  severity = "low",
  reason,
  date
}) => {
  let flag = await RedFlag.findOne({ userId, date });

  if (flag) {
    if (!flag.type.includes(type)) {
      flag.type.push(type);
    }

    if (!flag.reason.includes(reason)) {
      flag.reason.push(reason);
    }

  
    const priority = { low: 1, medium: 2, high: 3 };
    if (priority[severity] > priority[flag.severity]) {
      flag.severity = severity;
    }

    await flag.save();
    return flag;
  }

  const newFlag = await RedFlag.create({
    userId,
    type: [type],
    severity,
    reason: [reason],
    date
  });

  return newFlag;
};
