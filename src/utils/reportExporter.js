import ExcelJS from "exceljs";
import fs from "fs";
import path from "path";
import PDFDocument from "pdfkit";

export const generateExcel = async (type, data, reportId) => {
  const uploadsDir = path.join(process.cwd(), "uploads");

  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir);
  }

  const workbook = new ExcelJS.Workbook();

  /* ---------------- TASKS ---------------- */
  if (type === "tasks") {
    const sheet = workbook.addWorksheet("Tasks");

    sheet.columns = [
      { header: "Task", key: "title" },
      { header: "Employee", key: "employee" },
      { header: "Project", key: "project" },
      { header: "Status", key: "status" },
      { header: "Priority", key: "priority" },
      { header: "Due Date", key: "dueAt" }
    ];

    data.forEach(t => {
      sheet.addRow({
        title: t.title,
        employee: t.assignedto?.name,
        project: t.projectId?.projectname,
        status: t.status,
        priority: t.priority,
        dueAt: t.dueAt
      });
    });
  }

  /* ---------------- METRICS ---------------- */
  if (type === "metrics") {
    const metricsSheet = workbook.addWorksheet("Metrics");
    metricsSheet.columns = [
      { header: "Date", key: "date" },
      { header: "Completed Tasks", key: "tasksCompleted" },
      { header: "Report Submitted", key: "reportsSubmitted" },
      { header: "Active Users", key: "activeUsers" }
    ];

    data.metrics.forEach(m => {
      metricsSheet.addRow({
        date: m.date,
        tasksCompleted: m.tasksCompleted,
        reportsSubmitted: m.reportsSubmitted,
        activeUsers:m.activeUsers,
      });
    });

    const slaSheet = workbook.addWorksheet("SLA");
    slaSheet.columns = [
      { header: "Date", key: "date" },
      { header: "On Time", key: "onTime" },
      { header: "Overdue", key: "overdue" },
      { header: "SLA %", key: "slaPercentage" },
      { header: "Type", key: "type" }
    ];

    data.sla.forEach(s => {
      slaSheet.addRow({
        date: s.date,
        onTime: s.onTime,
        overdue: s.overdue,
        slaPercentage: s.slaPercentage,
        type: s.type
      });
    });
  }

  if (type === "employees") {
    const sheet = workbook.addWorksheet("Employees");

    sheet.columns = [
      { header: "Name", key: "name" },
      { header: "Email", key: "email" },
      { header: "Role", key: "role" },
      { header: "Designation", key: "designation" },
      { header: "Status", key: "status" },
      { header: "Joined On", key: "createdAt" }
    ];

    data.forEach(u => {
      sheet.addRow({
        name: u.name,
        email: u.email,
        role: u.role,
        designation: u.designation,
        status: u.status,
        createdAt: u.createdAt
      });
    });
  }

  /* ================= PERFORMANCE ================= */
  if (type === "performance") {
    const sheet = workbook.addWorksheet("Employee Performance");

    sheet.columns = [
      { header: "Employee", key: "employee" },
      { header: "Total Score", key: "score" },
    ];

    data.forEach(p => {
      sheet.addRow({
        employee: p.userId?.name,
        score: p.totalScore,
      });
    });
  }

  /* ================= RED FLAGS ================= */
  if (type === "redflags") {
    const sheet = workbook.addWorksheet("Red Flags");

    sheet.columns = [
      { header: "Employee", key: "employee" },
      { header: "Type", key: "type" },
      { header: "Severity", key: "severity" },
      { header: "Date", key: "date" }
    ];

    data.forEach(r => {
      sheet.addRow({
        employee: r.userId?.name,
        type: r.type,
        severity: r.severity,
        date: r.date
      });
    });
  }

  const filePath = path.join(uploadsDir, `${reportId}.xlsx`);
  await workbook.xlsx.writeFile(filePath);

  return `/uploads/${reportId}.xlsx`;
};




export const generatePDF = async (type, data, reportId) => {
  const doc = new PDFDocument({ margin: 40 });
  const filePath = `uploads/${reportId}.pdf`;

  doc.pipe(fs.createWriteStream(filePath));

  doc.fontSize(18).text("Company Report", { align: "center" });
  doc.moveDown();

  if (type === "performance") {
    data.forEach(p => {
      doc
        .fontSize(12)
        .text(`Employee: ${p.userId.name}`)
        .text(`Total Score: ${p.totalScore}`)
        .text("-------------");
    });
  }
   if (type === "employees") {
    doc.fontSize(14).text("Employees Report");
    doc.moveDown();

    data.forEach(u => {
      doc
        .fontSize(11)
        .text(`Name: ${u.name}`)
        .text(`Email: ${u.email}`)
        .text(`Role: ${u.role}`)
        .text(`Designation: ${u.designation}`)
        .text(`Status: ${u.status}`)
        .text("---------------------------");
    });
  }

  /* ================= RED FLAGS ================= */
  if (type === "redflags") {
    doc.fontSize(14).text("Red Flags Report");
    doc.moveDown();

    data.forEach(r => {
      doc
        .fontSize(11)
        .text(`Employee: ${r.userId?.name}`)
        .text(`Type: ${r.type}`)
        .text(`Severity: ${r.severity}`)
        .text(`Date: ${r.date}`)
        .text("---------------------------");
    });
  }


  doc.end();
  return `/uploads/${reportId}.pdf`;
};
