import mongoose from "mongoose";
import { faker } from "@faker-js/faker";

const DAYS_BACK = 30;

const today = new Date();
today.setHours(0, 0, 0, 0);

const getLastWorkingDays = (count = DAYS_BACK) => {
  const days = [];
  let d = new Date(today);

  while (days.length < count) {
    d.setDate(d.getDate() - 1);
    if (d.getDay() !== 0) { // skip Sundays
      days.push(new Date(d));
    }
  }
  return days.reverse();
};

const workingDays = getLastWorkingDays();

const randomFrom = (arr) => arr[Math.floor(Math.random() * arr.length)];

const randomBool = (prob = 0.7) => Math.random() < prob;

const safeDateBetween = (start, end) => {
  if (start >= end) return new Date(start);
  return faker.date.between({ from: start, to: end });
};

const profilePic = (gender = "male") =>
  `https://randomuser.me/api/portraits/${gender === "female" ? "women" : "men"}/${faker.number.int({ min: 1, max: 90 })}.jpg`;

import { User } from "./models/Employee.models.js";

const createUsers = async () => {
  await User.deleteMany();

  const users = [];

  const makeUser = ({
    name,
    email,
    roleType,
    designationName,
    managerId = null,
    hrId = null,
    gender = "male"
  }) => {
    const startDate = randomFrom(workingDays.slice(0, 10));
    const completeDate = randomFrom(workingDays.slice(10));

    return {
      name,
      email,
      password: "password123",
      phone: faker.phone.number("9#########"),
      salary: faker.number.int({ min: 20000, max: 120000 }),

      role: roleType,

      roleid: new mongoose.Types.ObjectId(),

      designation: {
        name: designationName,
        Managerid: managerId,
        Hrid: hrId
      },

      status: "Active & Paid",

      Projects: [],
      Tasks: [],
      dailyreports: [],

      managerAssigned: managerId,

      onboarding: {
        status: "Completed",
        startedAt: startDate,
        completedAt: completeDate
      },

      scores: null,

      lastActiveAt: randomFrom(workingDays),

      profilepicture: profilePic(gender),

      Telegram: {
        id: faker.string.uuid(),
        snapshot: ""
      },

      topTracker: {
        id: faker.string.uuid(),
        snapshot: ""
      },

      ticketsraised: [],

      documents: {
        aadhar: faker.string.numeric(12),
        pan: faker.string.alphanumeric(10).toUpperCase()
      },

      bankdetails: {
        accountno: faker.number.int({ min: 1000000000, max: 9999999999 }),
        ifsc: "HDFC0001234"
      },

      deleted: false
    };
  };

  // ADMIN (NO PARTICIPATION IN PROJECTS)
  const admin = makeUser({
    name: "Aarav Mehta",
    email: "admin@company.com",
    roleType: "Admin",
    designationName: "Admin"
  });
  users.push(admin);

  // MANAGERS
  const managers = [
    makeUser({
      name: "Rohit Sharma",
      email: "rohit@company.com",
      roleType: "Manager",
      designationName: "Manager",
      gender: "male"
    }),
    makeUser({
      name: "Neha Verma",
      email: "neha@company.com",
      roleType: "Manager",
      designationName: "Manager",
      gender: "female"
    }),
    makeUser({
      name: "Kunal Singh",
      email: "kunal@company.com",
      roleType: "Manager",
      designationName: "Manager",
      gender: "male"
    }),
    makeUser({
      name: "Pooja Iyer",
      email: "pooja@company.com",
      roleType: "Manager",
      designationName: "Manager",
      gender: "female"
    })
  ];
  users.push(...managers);

  // HR
  const hrs = [
    makeUser({
      name: "Ananya Kapoor",
      email: "ananya@company.com",
      roleType: "HR",
      designationName: "HR",
      gender: "female"
    }),
    makeUser({
      name: "Vikram Joshi",
      email: "vikram@company.com",
      roleType: "HR",
      designationName: "HR",
      gender: "male"
    })
  ];
  users.push(...hrs);

  // EMPLOYEES
  for (let i = 1; i <= 20; i++) {
    const manager = randomFrom(managers);
    const hr = randomFrom(hrs);

    users.push(
      makeUser({
        name: faker.person.fullName(),
        email: `employee${i}@company.com`,
        roleType: randomFrom([
          "Frontend",
          "Backend",
          "UI/UX Designer",
          "QA"
        ]),
        designationName: "Employee",
        managerId: manager._id,
        hrId: hr._id,
        gender: randomBool() ? "male" : "female"
      })
    );
  }

  const insertedUsers = await User.insertMany(users);
  console.log(`👥 Users Created: ${insertedUsers.length}`);

  return {
    admin: insertedUsers.find(u => u.role === "Admin"),
    managers: insertedUsers.filter(u => u.role === "Manager"),
    hrs: insertedUsers.filter(u => u.role === "HR"),
    employees: insertedUsers.filter(u =>
      ["Frontend", "Backend", "UI/UX Designer", "QA"].includes(u.role)
    )
  };
};
import { Project } from "./models/Project.models.js";

const createProjects = async ({ managers, employees }) => {
  await Project.deleteMany();

  const projects = [];

  const riskCategories = [
    "Frontend",
    "Backend",
    "Deployement",
    "Access",
    "Others"
  ];

  for (let i = 1; i <= 6; i++) {
    const manager = randomFrom(managers);

    const teamMembers = faker.helpers.arrayElements(
      employees,
      faker.number.int({ min: 3, max: 6 })
    );

    const team = teamMembers.map(emp => ({
      userId: emp._id,
      role: emp.role,
      assignedAt: randomFrom(workingDays.slice(0, 15))
    }));

    const startDate = randomFrom(workingDays.slice(0, 20));
    const endDate = randomBool(0.6)
      ? randomFrom(workingDays.slice(20))
      : null;

    const risksCount = faker.number.int({ min: 1, max: 3 });

    const risks = Array.from({ length: risksCount }).map(() => ({
      title: faker.company.catchPhrase(),
      severity: randomFrom(["Low", "Medium", "High", "Critical"]),
      status: randomFrom(["Raised", "Resolved"]),
      category: randomFrom(riskCategories),
      raisedby: manager._id,
      raisedon: randomFrom(workingDays.slice(0, 20)),
      resolvedon: randomBool(0.5) ? randomFrom(workingDays.slice(20)) : null
    }));

    projects.push({
      projectname: `Project ${faker.word.noun()} ${i}`,
      description: faker.lorem.sentences(2),
      projectCode: `PRJ-${100 + i}`,
      manager: manager._id,

      team: {
        teamScore: faker.number.int({ min: 60, max: 95 }),
        teamId: faker.string.uuid(),
        assignedMembers: team
      },

      progress: {
        percent: faker.number.int({ min: 30, max: 100 }),
        status: randomFrom(["Ongoing", "Pending", "Completed"])
      },

      timeline: {
        startDate,
        endDate
      },

      tasks: [],
      risks,
      budget: faker.number.int({ min: 500000, max: 3000000 }),
      deleted: false
    });
  }

  const insertedProjects = await Project.insertMany(projects);
  console.log(`📁 Projects Created: ${insertedProjects.length}`);

  return insertedProjects;
};

const syncUserProjects = async (projects) => {
  for (const project of projects) {
    const userIds = [
      project.manager,
      ...project.team.assignedMembers.map(m => m.userId)
    ];

    await User.updateMany(
      { _id: { $in: userIds } },
      { $addToSet: { Projects: project._id } }
    );
  }

  console.log("🔗 User ↔ Projects synced");
};


import { Task } from "./models/Task.models.js";

const createTasks = async ({ projects, employees }) => {
  await Task.deleteMany();

  const tasks = [];

  const statuses = ["Pending", "In Progress", "Completed"];
  const priorities = ["Low", "Medium", "High", "Urgent"];

  for (const project of projects) {
    const projectEmployees = project.team.assignedMembers.map(m => m.userId);

    const taskCount = faker.number.int({ min: 6, max: 12 });

    for (let i = 0; i < taskCount; i++) {
      const assignedUser = randomFrom(
        employees.filter(e => projectEmployees.includes(e._id))
      );

      const createdAt = randomFrom(workingDays.slice(0, 20));
      const dueAt = randomFrom(workingDays.slice(20));

      const status = randomFrom(statuses);

      let completedAt = null;
      if (status === "Completed") {
        completedAt = safeDateBetween(createdAt, dueAt);
      }

      tasks.push({
        projectId: project._id,
        title: faker.hacker.phrase(),
        description: faker.lorem.sentences(2),
        assignedto: assignedUser._id,
        priority: randomFrom(priorities),
        status,
        dueAt,

        tags: faker.helpers.arrayElements(
          ["frontend", "backend", "api", "bug", "ui", "testing"],
          faker.number.int({ min: 1, max: 3 })
        ),

        dependencies: {
          files: [
            `https://docs.company.com/${faker.string.uuid()}.pdf`
          ],
          links: [
            `https://jira.company.com/browse/${faker.string.alpha(5).toUpperCase()}-${faker.number.int({ min: 10, max: 500 })}`,
            `https://github.com/company/${faker.word.noun()}`
          ]
        },

        weightage: faker.number.int({ min: 5, max: 20 }),
        deleted: false,
        completedAt,

        createdAt,
        updatedAt: completedAt || createdAt
      });
    }
  }

  const syncUserTasks = async (tasks) => {
  const bulk = tasks.map(t => ({
    updateOne: {
      filter: { _id: t.assignedto },
      update: { $addToSet: { Tasks: t._id } }
    }
  }));

  if (bulk.length) {
    await User.bulkWrite(bulk);
  }

  console.log("🔗 User ↔ Tasks synced");
};


  const insertedTasks = await Task.insertMany(tasks);
  console.log(`📝 Tasks Created: ${insertedTasks.length}`);

  return insertedTasks;
};

const syncUserTasks = async (tasks) => {
  const bulkOps = [];

  for (const task of tasks) {
    if (!task.assignedto) continue;

    bulkOps.push({
      updateOne: {
        filter: { _id: task.assignedto },
        update: { $addToSet: { Tasks: task._id } }
      }
    });
  }

  if (bulkOps.length > 0) {
    await User.bulkWrite(bulkOps);
  }

  console.log("🔗 User ↔ Tasks synced");
};

import { Report } from "./models/Reports.models.js";
import { Attendance } from "./models/Attendance.models.js";

const createReportsAndAttendance = async ({ employees, tasks }) => {
  await Report.deleteMany();
  await Attendance.deleteMany();

  const reports = [];
  const attendanceRecords = [];

  for (const day of workingDays) {
    for (const emp of employees) {
      const isPresent = randomBool(0.85);
      let punchIn = null;
      let punchOut = null;
      let timeSpent = 0;

      if (isPresent) {
        const start = new Date(day);
        start.setHours(9, 0, 0, 0);

        const mid = new Date(day);
        mid.setHours(11, 0, 0, 0);

        const end = new Date(day);
        end.setHours(18, 0, 0, 0);

        punchIn = safeDateBetween(start, mid);
        punchOut = safeDateBetween(
          new Date(punchIn.getTime() + 6 * 60 * 60 * 1000),
          end
        );

        timeSpent = Math.round((punchOut - punchIn) / (1000 * 60));
      }

      attendanceRecords.push({
        user: emp._id,
        status: isPresent ? "Present" : "Absent",
        date: day,
        punchin: punchIn,
        punchout: punchOut,
        timespent: timeSpent,
        createdAt: day,
        updatedAt: day
      });

      if (isPresent && randomBool(0.75)) {
        const empTasks = tasks.filter(
          t =>
            String(t.assignedto) === String(emp._id) &&
            t.projectId
        );

        let relatedTasks = [];

if (empTasks.length > 0) {
  relatedTasks = faker.helpers.arrayElements(
    empTasks,
    faker.number.int({
      min: 1,
      max: Math.min(3, empTasks.length)
    })
  );
}


        reports.push({
          user: emp._id,
          date: day,
          summary: faker.lorem.sentences(2),
          relatedtasks: relatedTasks.map(t => t._id),
          attachements: {
            files: [
              `https://storage.company.com/reports/${faker.string.uuid()}.png`
            ],
            links: [
              `https://docs.company.com/${faker.string.uuid()}`
            ]
          },
          deleted: false,
          createdAt: day,
          updatedAt: day
        });
      }
    }
  }

  const insertedAttendance = await Attendance.insertMany(attendanceRecords);
  const insertedReports = await Report.insertMany(reports);

  console.log(`📅 Attendance Records Created: ${insertedAttendance.length}`);
  console.log(`📄 Reports Created: ${insertedReports.length}`);

  return { attendance: insertedAttendance, reports: insertedReports };
};

const syncUserReports = async (reports) => {
  const bulk = reports.map(r => ({
    updateOne: {
      filter: { _id: r.user },
      update: { $addToSet: { dailyreports: r._id } }
    }
  }));

  if (bulk.length) {
    await User.bulkWrite(bulk);
  }

  console.log("🔗 User ↔ Reports synced");
};


import { Metrics, SLA } from "./models/MetricsSchema.models.js";
import { PerformanceScore } from "./models/PerformanceScore.models.js";

const createMetricsAndPerformance = async ({
  employees,
  tasks,
  attendance,
  reports
}) => {
  await Metrics.deleteMany();
  await SLA.deleteMany();
  await PerformanceScore.deleteMany();

  const metricsDocs = [];
  const slaDocs = [];
  const scoreDocs = [];

  for (const day of workingDays) {
    const dayStart = new Date(day);
    dayStart.setHours(0, 0, 0, 0);

    const dayEnd = new Date(day);
    dayEnd.setHours(23, 59, 59, 999);

    const completedTasks = tasks.filter(
      t =>
        t.completedAt &&
        t.completedAt >= dayStart &&
        t.completedAt <= dayEnd
    );

    const dayReports = reports.filter(
      r => r.date >= dayStart && r.date <= dayEnd
    );

    const activeUsers = attendance.filter(
      a =>
        a.date >= dayStart &&
        a.date <= dayEnd &&
        a.status === "Present"
    );

    metricsDocs.push({
      date: day.toISOString().split("T")[0],
      tasksCompleted: completedTasks.length,
      reportsSubmitted: dayReports.length,
      activeUsers: new Set(activeUsers.map(a => String(a.user))).size,
      createdAt: day
    });

    const onTime = completedTasks.filter(
      t => t.completedAt && t.dueAt && t.completedAt <= t.dueAt
    ).length;

    const overdue = completedTasks.filter(
      t => t.completedAt && t.dueAt && t.completedAt > t.dueAt
    ).length;

    const total = onTime + overdue || 1;
    const slaPercentage = Math.round((onTime / total) * 100);

    const slaType =
      slaPercentage <= 30
        ? "Critical"
        : slaPercentage <= 60
        ? "Medium"
        : "Low";

    slaDocs.push({
      date: day.toISOString().split("T")[0],
      onTime,
      overdue,
      slaPercentage,
      type: slaType
    });
  }

  for (const emp of employees) {
    const empTasks = tasks.filter(
      t => String(t.assignedto) === String(emp._id)
    );

    const completed = empTasks.filter(t => t.status === "Completed");

    const taskScore = empTasks.length
      ? Math.round((completed.length / empTasks.length) * 40)
      : 0;

    const empReports = reports.filter(
      r => String(r.user) === String(emp._id)
    );

    const reportScore = Math.min(empReports.length, 20);

    const empAttendance = attendance.filter(
      a => String(a.user) === String(emp._id) && a.status === "Present"
    );

    const attendanceScore = Math.min(empAttendance.length, 20);

    const peerScore = faker.number.int({ min: 5, max: 10 });
    const managerScore = faker.number.int({ min: 8, max: 15 });
    const hrScore = faker.number.int({ min: 3, max: 5 });

    const totalScore =
      taskScore +
      reportScore +
      attendanceScore +
      peerScore +
      managerScore +
      hrScore;

    scoreDocs.push({
      userId: emp._id,
      period: "monthly",
      scores: {
        tasks: taskScore,
        reports: reportScore,
        attendance: attendanceScore,
        peer: peerScore,
        manager: managerScore,
        hr: hrScore
      },
      totalScore,
      createdAt: randomFrom(workingDays)
    });
  }

  await Metrics.insertMany(metricsDocs);
  await SLA.insertMany(slaDocs);
  await PerformanceScore.insertMany(scoreDocs);

  console.log(`📊 Metrics Created: ${metricsDocs.length}`);
  console.log(`⏱ SLA Records Created: ${slaDocs.length}`);
  console.log(`⭐ Performance Scores Created: ${scoreDocs.length}`);
};

const syncUserScores = async () => {
  const scores = await PerformanceScore.find();

  const bulk = scores.map(s => ({
    updateOne: {
      filter: { _id: s.userId },
      update: { scores: s._id }
    }
  }));

  if (bulk.length) {
    await User.bulkWrite(bulk);
  }

  console.log("🔗 User ↔ PerformanceScore synced");
};

import { RedFlag } from "./models/MetricsSchema.models.js";

const createRedFlags = async ({ employees, attendance, reports, scores }) => {
  await RedFlag.deleteMany();

  const redFlags = [];

  for (const day of workingDays) {
    const dayStr = day.toISOString().split("T")[0];

    for (const emp of employees) {
      const types = [];
      const reasons = [];
      let severity = "low";

      // 1️⃣ Inactive User (no attendance in last 3 days)
      const last3Attendance = attendance.filter(a =>
        String(a.user) === String(emp._id) &&
        a.date >= new Date(day.getTime() - 3 * 86400000) &&
        a.date <= day &&
        a.status === "Present"
      );

      if (last3Attendance.length === 0) {
        types.push("Inactive User");
        reasons.push("No activity for last 3 working days");
        severity = "medium";
      }

      // 2️⃣ Missed Report (3 consecutive days)
      const last3Reports = reports.filter(r =>
        String(r.user) === String(emp._id) &&
        r.date >= new Date(day.getTime() - 3 * 86400000) &&
        r.date <= day
      );

      if (last3Reports.length === 0) {
        types.push("Missed Report");
        reasons.push("Missed daily reports for 3 days");
        severity = "high";
      }

      // 3️⃣ Low Performance
      const score = scores.find(
        s => String(s.userId) === String(emp._id)
      );

      if (score && score.totalScore < 50) {
        types.push("Low Performance");
        reasons.push(`Performance dropped to ${score.totalScore}`);
        severity = severity === "high" ? "high" : "medium";
      }

      if (types.length > 0) {
        redFlags.push({
          userId: emp._id,
          type: types,
          reason: reasons,
          severity,
          date: dayStr
        });
      }
    }
  }

  const inserted = await RedFlag.insertMany(redFlags);
  console.log(`🚩 RedFlags Created: ${inserted.length}`);
};


const cleanDatabase = async () => {
  console.log("🧹 Cleaning old data...");

  await Promise.all([
    User.deleteMany({}),
    Project.deleteMany({}),
    Task.deleteMany({}),
    Report.deleteMany({}),
    Attendance.deleteMany({}),
    Metrics.deleteMany({}),
    SLA.deleteMany({}),
    PerformanceScore.deleteMany({})
  ]);

  console.log("🧼 Database cleaned");
};


const seedFullCompany = async () => {
  try {
    await mongoose.connect(
      "mongodb+srv://humanity:founders@cluster0.pmkgakt.mongodb.net/mohammadziya"
    );
    console.log("🔥 Connected to DB");

     await cleanDatabase();

    const usersData = await createUsers();

    const projects = await createProjects(usersData);
    await syncUserProjects(projects);

    const tasks = await createTasks({
      projects,
      employees: usersData.employees
    });
    await syncUserTasks(tasks);

    const { attendance, reports } = await createReportsAndAttendance({
      employees: usersData.employees,
      tasks
    });
    await syncUserReports(reports);

    await createMetricsAndPerformance({
      employees: usersData.employees,
      tasks,
      attendance,
      reports
    });
    await syncUserScores();

    const scores = await PerformanceScore.find();

await createRedFlags({
  employees: usersData.employees,
  attendance,
  reports,
  scores
});


    console.log("✅ FULL COMPANY DATABASE SEEDED (100% LINKED)");
    process.exit(0);
  } catch (err) {
    console.error("❌ ERROR in Seed Script:", err);
    process.exit(1);
  }
};


seedFullCompany();
