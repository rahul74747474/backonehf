
# 🚀 Humanity Founders Internal Management Backend

> Humanity Founders Portal is a full-fledged enterprise internal operations platform built for Humanity Founders to manage employees, projects, tasks, attendance, performance, announcements, reports, SLAs, tickets, and automated analytics — all powered by Node.js, Express, MongoDB, and intelligent cron jobs.

This backend is designed with scalability, auditability, and automation in mind.

---

## 📌 Table of Contents

* [Features Overview](#-features-overview)
* [Tech Stack](#-tech-stack)
* [System Architecture](#-system-architecture)
* [Authentication & Authorization](#-authentication--authorization)
* [Core Modules](#-core-modules)
* [API Routes](#-api-routes)
* [Cron Jobs & Automation](#-cron-jobs--automation)
* [Database Models](#-database-models)
* [Environment Variables](#-environment-variables)
* [Setup & Installation](#-setup--installation)
* [Deployment](#-deployment)
* [Security Highlights](#-security-highlights)
* [Future Enhancements](#-future-enhancements)

---

## ✨ Features Overview

### 👥 Employee Management

* Admin & Employee roles
* Secure JWT-based login
* Onboarding lifecycle
* Role & designation assignment
* Profile activity tracking

### 📋 Task & Project Management

* Assign tasks (with or without projects)
* Task history & comments
* Subtasks support
* File attachments (Cloudinary)
* Project activity timeline
* Risk & issue tracking

### 🕒 Attendance System

* Punch-in / Punch-out
* Real-time time tracking
* Daily attendance records
* Break tracking
* Active user calculation

### 📢 Announcements

* Target audience:

  * All employees
  * Specific teams (roles)
  * Individual users
* Channels:

  * Dashboard banner
  * Email notifications
* Acknowledgement tracking

### 🎫 Ticketing System

* Internal issue raising
* Assign tickets
* Status updates
* Comment threads

### 📊 Reports & Analytics

* Daily employee reports
* Auto-generated metrics
* SLA calculations
* Performance scoring
* Export reports (PDF / Excel)

### 🚨 Red Flag System (Auto)

* Inactive employees
* Missed reports
* Low performance
* Severity-based escalation

---

## 🧰 Tech Stack

| Layer               | Technology            |
| ------------------- | --------------------- |
| Backend             | Node.js, Express.js   |
| Database            | MongoDB, Mongoose     |
| Auth                | JWT, Cookies          |
| File Uploads        | Multer, Cloudinary    |
| Email               | Nodemailer            |
| Cron Jobs           | node-cron             |
| Date Handling       | Luxon                 |
| Hosting             | Heroku / VPS          |
| Frontend (Consumer) | React (separate repo) |

---

## 🏗️ System Architecture

```
Client (React)
     ↓
API Gateway (Express)
     ↓
Authentication Middleware (JWT)
     ↓
Controllers (Admin / Employee)
     ↓
Services & Utilities
     ↓
MongoDB (Mongoose Models)
     ↓
Cron Jobs (Automation Layer)
```

---

## 🔐 Authentication & Authorization

### Authentication

* JWT tokens stored in **HTTP-only cookies
* Token expiry configurable via `.env`

### Authorization

* Role-based access:

  * Administrator
  * Employee
  * Manager / HR (via roles)
* Middleware: `verifyjwt`

---

## 🧩 Core Modules

### 1️⃣ Admin Module

* Employee creation
* Project creation
* Task assignment
* Role management
* Announcements
* Reports export
* Metrics & SLA monitoring

### 2️⃣ Employee Module

* Task updates
* Attendance
* Reports submission
* Acknowledgements
* Subtasks & comments
* File uploads

---

## 🔗 API Routes

### 🔑 Admin Routes (`/api/v1/admin`)

| Method | Endpoint         | Description         |
| ------ | ---------------- | ------------------- |
| POST   | `/adminlogin`    | Admin login         |
| POST   | `/addemployee`   | Create employee     |
| POST   | `/addproject`    | Create project      |
| POST   | `/assigntask`    | Assign task         |
| PUT    | `/updateproject` | Update project      |
| GET    | `/getallproject` | Fetch projects      |
| GET    | `/getalltask`    | Fetch tasks         |
| POST   | `/announcement`  | Create announcement |
| POST   | `/export`        | Generate reports    |
| GET    | `/exports`       | Export history      |

---

### 👤 Employee Routes (`/api/v1/employee`)

| Method | Endpoint                  | Description          |
| ------ | ------------------------- | -------------------- |
| POST   | `/login`                  | Employee login       |
| POST   | `/start-attendance`       | Punch in             |
| POST   | `/save-time`              | Save work time       |
| POST   | `/punchout`               | Punch out            |
| POST   | `/complete-task`          | Complete task        |
| POST   | `/review-task`            | Send task for review |
| POST   | `/submitreport`           | Submit daily report  |
| POST   | `/task/upload-attachment` | Upload file          |

---

## ⏰ Cron Jobs & Automation

### 🔄 Daily Automation Jobs

| Cron              | Purpose                            |
| ----------------- | ---------------------------------- |
| Clear Activity    | Resets recent activity daily       |
| Inactive User     | Flags inactive employees           |
| Metrics           | Daily tasks, reports & attendance  |
| Missed Report     | Detects consecutive missed reports |
| Performance Score | Auto performance evaluation        |
| SLA               | Task deadline analysis             |

### 🚨 Red Flag Triggers

* 3+ missed reports
* 3+ inactive working days
* Low 3-day performance average

---

## 🗄️ Database Models

* `User`
* `Task`
* `Project`
* `Attendance`
* `Announcement`
* `Report`
* `Metrics`
* `SLA`
* `PerformanceScore`
* `RedFlag`
* `Ticket`
* `Role`
* `Subtask`
* `ReportExport`

Each model is:

* Timestamped
* Indexed where required
* Relationship-safe



## ⚙️ Setup & Installation

```bash
git clone https://prismbackend-27d920759150.herokuapp.com
cd prism-backend
npm install
npm run dev
```

---

## 🚀 Deployment

* Supports:

  * Heroku
  * VPS (PM2 recommended)
* CORS secured for:

  ```
  https://onehumanityportal.humanityfounders.com
  ```

---

## 🔒 Security Highlights

* HTTP-only cookies
* Password hashing (bcrypt)
* Role-based access control
* Secure file uploads
* Non-blocking background jobs

