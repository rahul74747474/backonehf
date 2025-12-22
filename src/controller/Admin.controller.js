import mongoose from "mongoose"
import { User } from "../models/Employee.models.js"
import nodemailer from "nodemailer"
import { Project } from "../models/Project.models.js"
import { asynchandler } from "../utils/Asynchandler.utils.js"
import { Apierror } from "../utils/Apierror.utils.js"
import { Apiresponse } from "../utils/Apiresponse.utils.js"
import { Task } from "../models/Task.models.js"
import { Metrics, RedFlag, SLA } from "../models/MetricsSchema.models.js"
import { Role } from "../models/Role.models.js"
import {  Token } from "../models/Tickets.models.js"
import { Announcement } from "../models/Announcement.models.js"
import { Attendance } from "../models/Attendance.models.js"
import { Report } from "../models/Reports.models.js"
import { PerformanceScore } from "../models/PerformanceScore.models.js"
import { ReportExport } from "../models/ReportExport.models.js"
import { generateExcel, generatePDF } from "../utils/reportExporter.js"


const generateTeamID = () => {
  const random = Math.floor(100 + Math.random() * 900);
  return `P00${random}`;
};

const transporter = nodemailer.createTransport({
  host: "gvam1102.siteground.biz",
  port: 465,
  secure: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});


const sendAnnouncementEmails = async ({ users, title, message, type }) => {
  for (const emp of users) {
    if (!emp?.email) continue;

    const mailOptions = {
      from: process.env.SMTP_USER,
      to: emp.email,
      subject: handlesubject({type}),
      html: announcementMailTemplate({
        name: emp.name,
        title,
        message,
        type,
      }),
    };

    await transporter.sendMail(mailOptions);
  }
};

const handlesubject = ({type}) =>{
  if(type==="General Announcement"){
    return `
      PRISM Announcement | Company Update
    `
  }
  else if(type === "Warning/Inquiry"){
    return `
      PRISM Notice | Action Required
    `
  }
  else{
    return`
      PRISM Recognition | Appreciating Your Contribution
    `
  }
}

const announcementMailTemplate = ({ name, title, message, type }) => {

  if(type === "General Announcement"){
    return`
     <!DOCTYPE html>
  <html>
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
    <title>PRISM Announcement | Company Update</title>
  </head>

  <body style="margin:0;padding:0;background:#F6F7FF;font-family:Segoe UI,Roboto,Arial;">
    <table width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td align="center" style="padding:32px 16px;">
          <table width="100%" style="max-width:560px;background:#ffffff;border-radius:14px;box-shadow:0 16px 32px rgba(0,0,0,0.06);">

            <!-- Header -->
            <tr>
              <td style="padding:26px 28px;text-align:center;background:#EFEAFF;border-radius:14px 14px 0 0;">
                <img src="https://prismbackend-27d920759150.herokuapp.com/public/companylogo.png" alt="PRISM" width="42" style="display:block;margin:0 auto 10px;" />
                <h2 style="margin:0;color:#2E2A55;">General Announcement</h2>
                <p style="margin:6px 0 0;font-size:13px;color:#6B65A8;">
                  PRISM · Humanity Founders
                </p>
              </td>
            </tr>

            <!-- Content -->
            <tr>
              <td style="padding:30px;color:#2B2B2B;font-size:15px;line-height:1.75;">
                <p>Hello Team,</p>

                <p>
                  We would like to share an important update as part of our continued effort to
                  maintain transparency and alignment across the organization.
                </p>

                <p>
                  This announcement is intended to keep everyone informed of key developments
                  and ongoing initiatives within the company.
                </p>

                <p>
                  Should you require any additional information or clarification, please reach
                  out through the appropriate internal channels.
                </p>

                <p style="margin-top:26px;">
                  Regards,<br/>
                  <strong>Humanity Founders</strong><br/>
                  PRISM Administration
                </p>
              </td>
            </tr>

          </table>
        </td>
      </tr>
    </table>
  </body>
  </html>
    `
  }
    else if(type === "Warning/Inquiry"){
      return `
        <!DOCTYPE html>
  <html>
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
    <title>PRISM Notice | Action Required</title>
  </head>
  <body style="margin:0;padding:0;background:#FFF5F5;font-family:Segoe UI,Roboto,Arial;">
    <table width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td align="center" style="padding:32px 16px;">
          <table width="100%" style="max-width:560px;background:#ffffff;border-radius:14px;box-shadow:0 18px 36px rgba(0,0,0,0.08);">

            <!-- Header -->
            <tr>
              <td style="padding:24px 28px;background:#FFE5E5;border-radius:14px 14px 0 0;text-align:center;">
                <img src="https://prismbackend-27d920759150.herokuapp.com/public/companylogo.png" alt="PRISM" width="42" style="display:block;margin:0 auto 10px;" />
                <h2 style="margin:0;color:#8B1E1E;">Official Notice</h2>
                <p style="margin:6px 0 0;font-size:13px;color:#9B4A4A;">
                  PRISM · Compliance & Review
                </p>
              </td>
            </tr>

            <!-- Content -->
            <tr>
              <td style="padding:30px;color:#2B2B2B;font-size:15px;line-height:1.75;">
                <p>Hello,</p>

                <p>
                  This communication is issued to formally notify you of a matter that requires
                  your immediate attention and review.
                </p>

                <p>
                  Please ensure that the required action or response is provided within the
                  stipulated timeframe, in accordance with organizational policies.
                </p>

                <p>
                  Failure to address this matter in a timely manner may result in further review
                  or escalation, as deemed appropriate.
                </p>

                <p style="margin-top:26px;">
                  <strong>Humanity Founders</strong><br/>
                  PRISM Administration
                </p>
              </td>
            </tr>

          </table>
        </td>
      </tr>
    </table>
  </body>
  </html>
      `
    }
    else{
      return `
        <!DOCTYPE html>
  <html>
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
    <title>PRISM Recognition | Appreciating Your Contribution</title>
  </head>
  <body style="margin:0;padding:0;background:#F3FFF8;font-family:Segoe UI,Roboto,Arial;">
    <table width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td align="center" style="padding:32px 16px;">
          <table width="100%" style="max-width:560px;background:#ffffff;border-radius:14px;box-shadow:0 18px 36px rgba(0,0,0,0.06);">

            <!-- Header -->
            <tr>
              <td style="padding:26px 28px;text-align:center;background:#E8FFF1;border-radius:14px 14px 0 0;">
                <img src="https://prismbackend-27d920759150.herokuapp.com/public/companylogo.png" alt="PRISM" width="42" style="display:block;margin:0 auto 10px;" />
                <h2 style="margin:0;color:#1F7A4D;">Recognition & Appreciation</h2>
                <p style="margin:6px 0 0;font-size:13px;color:#3E8F6B;">
                  PRISM · Humanity Founders
                </p>
              </td>
            </tr>

            <!-- Content -->
            <tr>
              <td style="padding:30px;color:#2B2B2B;font-size:15px;line-height:1.75;">
                <p>Hello,</p>

                <p>
                  We would like to take a moment to acknowledge and appreciate your recent
                  efforts and contributions.
                </p>

                <p>
                  Your commitment and consistency play a meaningful role in advancing our
                  goals and strengthening our organizational culture.
                </p>

                <p>
                  Thank you for the value you bring to the team. We look forward to continued
                  success together.
                </p>

                <p style="margin-top:26px;">
                  With appreciation,<br/>
                  <strong>Humanity Founders Leadership</strong>
                </p>
              </td>
            </tr>

          </table>
        </td>
      </tr>
    </table>
  </body>
  <html>
      `
    }
  
 
};



const addemployee = asynchandler(async(req,res)=>{
    try {
        const {email,name,password,dob,gender} = req.body
        
        
        if(!email || !name || !password ||!dob ||!gender){
            throw new Apierror(400,"Please Enter all the Requires Fields")
        }

        const empid = email.split("@")[0]
         
        
        const existinguser = await User.findOne({
            $or:[{email ,empid}]
        })
    
        if(existinguser){
            throw new Apierror(409,"Employee with this credentials already exist")
        }
        
        
        const user = await User.create({
          empid,
          name,
          email,
          password,
          status:"Onboarding",
          dob,
          gender,
        })
        

        const transporter = nodemailer.createTransport({
            host: "gvam1102.siteground.biz", 
            port: 465, 
            secure: true, 
            auth: {
                user:process.env.SMTP_USER, 
                pass:process.env.SMTP_PASS || "55k=2`e$1m|1",
                  },
            })


 const mailOptions = {
  to: email,
  from: process.env.SMTP_USER,
  subject: "PRISM Portal Access | Your Secure Login Credentials",
  html: `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
    <title>PRISM Portal Access</title>
  </head>

  <body style="
    margin:0;
    padding:0;
    background: linear-gradient(
      180deg,
      rgba(215,204,255,0.16) 0%,
      rgba(224,215,255,0.16) 30%,
      rgba(241,236,255,0.16) 60%,
      rgba(255,255,255,1) 100%
    );
    font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
  ">

    <table width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td align="center" style="padding:40px 16px;">

          <!-- Main Card -->
          <table width="100%" cellpadding="0" cellspacing="0"
            style="
              max-width:560px;
              background:#ffffff;
              border-radius:16px;
              box-shadow:0 20px 40px rgba(0,0,0,0.06);
              overflow:hidden;
            "
          >

            <!-- Header -->
            <tr>
              <td style="
                padding:28px 32px;
                background: linear-gradient(135deg, #D7CCFF, #E0D7FF);
                text-align:center;
              ">

                <!-- PRISM Logo -->
                <img
                  src="https://prismbackend-27d920759150.herokuapp.com/public/companylogo.png"
                  alt="PRISM"
                  width="48"
                  style="display:block; margin:0 auto 12px;"
                />

                <h1 style="
                  margin:0;
                  font-size:22px;
                  color:#2E2A55;
                  letter-spacing:0.4px;
                ">
                  Welcome to PRISM
                </h1>

                <p style="
                  margin:6px 0 0;
                  font-size:13px;
                  color:#4A4680;
                ">
                  Humanity Founders · Internal Access Credentials
                </p>

              </td>
            </tr>

            <!-- Content -->
            <tr>
              <td style="padding:32px; color:#2B2B2B;">

                <p style="margin:0 0 16px; font-size:15px;">
                  Hello <strong>${name.split(" ")[0]}</strong>, 
                </p>

                <p style="
                  margin:0 0 20px;
                  font-size:15px;
                  line-height:1.7;
                ">
                  Your account has been successfully provisioned on <strong>PRISM</strong>, 
                  Humanity Founders’ internal platform for operational visibility, collaboration, 
                  and performance tracking.
                </p>

                <p style="
                  margin:0 0 20px;
                  font-size:15px;
                  line-height:1.7;
                ">
                  Below are your secure login credentials. Please keep this information confidential.
                </p>

                <!-- Credentials Box -->
                <table width="100%" cellpadding="0" cellspacing="0"
                  style="
                    background:#F7F5FF;
                    border-radius:12px;
                    padding:20px;
                  "
                >
                  <tr>
                    <td>

                      <p style="margin:0 0 6px; font-size:12px; color:#6B65A8;">
                        Employee Identifier
                      </p>
                      <p style="
                        margin:0 0 16px;
                        font-size:16px;
                        font-weight:600;
                        color:#2E2A55;
                      ">
                        ${empid}
                      </p>
                      <p style="margin:0 0 6px; font-size:12px; color:#6B65A8;">
                        Temporary Access Password
                      </p>
                      <p style="
                        margin:0;
                        font-size:16px;
                        font-weight:600;
                        color:#2E2A55;
                      ">
                        ${password}
                      </p>

                    </td>
                  </tr>
                </table>

                <p style="
                  margin:20px 0 0;
                  font-size:14px;
                  line-height:1.7;
                ">
                  For security compliance, you will be prompted to update your password upon first login.
                  We recommend completing your profile details immediately after accessing the platform.
                </p>

                <!-- CTA -->
                <div style="margin-top:30px; text-align:center;">
                  <a href="#"
                    style="
                      display:inline-block;
                      background:#5A4BFF;
                      color:#ffffff;
                      text-decoration:none;
                      padding:12px 26px;
                      border-radius:10px;
                      font-size:14px;
                      font-weight:600;
                    "
                  >
                    Access PRISM Portal
                  </a>
                </div>

              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td style="
                padding:24px 32px;
                background:#FAFAFF;
                border-top:1px solid #EEE;
                text-align:center;
              ">
                <p style="
                  margin:0;
                  font-size:12px;
                  color:#7A7A9D;
                  line-height:1.6;
                ">
                  Should you require assistance, please reach out to the HR team.<br/>
                  <strong>Humanity Founders</strong> · PRISM Platform
                </p>
              </td>
            </tr>

          </table>

          <p style="
            margin-top:20px;
            font-size:11px;
            color:#9A9AB5;
            text-align:center;
          ">
            This communication contains confidential information and is intended solely for the recipient.
          </p>

        </td>
      </tr>
    </table>

  </body>
  </html>
  `
};

        await transporter.sendMail(mailOptions)
    
        res.status(200)
        .json(new Apiresponse(201,"User Created Successfully",user))
    } catch (error) {
        console.log("Error",error.message)
    }

})

const adminlogin = asynchandler(async(req,res)=>{
  const{userid,password} = req.body

  if(!userid || !password){
    throw new Apierror(400,"Please fill all the required Details")
  }

  const user = await User.findOne({empid:userid})

  if(!user){
    throw new Apierror(404,"User not found")
  }

  if(user.designation.name !== "Administrator"){
    throw new Apierror(404,"User not Authorized to Access the portal")
  }

  const passwordcorrect = await user.isPasswordCorrect(password)
  if(!passwordcorrect){
    throw new Apierror(400,"Incorrect Password")
  }

  const token = await user.Token()
  if(!token){
    throw new Apierror(400,"No Token Generated")
  }

  const options = {
    httpOnly:true,
    secure:true,
    sameSite:"None",
    maxAge:9*60*60*1000
  }

  res.status(200)
  .cookie("token",token,options)
  .json(new Apiresponse(201,"Login Successfull",user))
  
})

const getuser = asynchandler(async(req,res)=>{
  const user = req.user

  if(!user){
    throw new Apierror(404,"Unauthorized User")
  }

  const employee = await User.findById(user._id)

  if(!employee){
    throw new Apierror(400,"Employee Not Found")
  }

  res.status(200)
  .json(new Apiresponse(201,"User Fetched Successfully",employee))
})
const updateemployee = asynchandler(async(req,res)=>{
  const {id} = req.body
  const {manager,onboardingstatus,role,status}=req.body
  if(!id){
    throw new Apierror(400,"Please provide the user id")
  }

  const user = await User.findById(id)
  if(!user){
    throw new Apierror(404,"User not found ")
  }

  if(status)user.status = status
  if(onboardingstatus) user.onboarding.status = onboardingstatus
  if(manager)user.managerAssigned = manager
  if(role)user.role=role

  const empl = await user.save({validateBeforeSave:false})

  res.status(200)
  .json(new Apiresponse(201,"User Updated Successgfully",empl))
})

const logout = asynchandler(async(req,res)=>{
    const options = {
  httpOnly: true,
  secure: true,    
  sameSite:"None" ,
  maxAge:9*60*60*1000,
}
   return  res.status(200)
    .clearCookie("token",options)
    .json(new Apiresponse(200,"User loggedout successfully",{}))
 
})

const assigntask = asynchandler(async (req, res) => {
  const { employeeid, title, description, dueAt, linkedproject, status, priority } = req.body;
  const user = req.user

  if (!employeeid || !title || !description || !dueAt || !linkedproject || !status || !priority) {
    throw new Apierror(400, "Please fill all required fields");
  }

  const employee = await User.findById(employeeid);

  if (!employee) {
    throw new Apierror(404, "Employee not found");
  }

  const task = await Task.create({
    title,
    description,
    dueAt,
    projectId: linkedproject,
    assignedto: employeeid,
    priority,
    status,
    history:[{
      actionby : user.name,
      title:"Created Task",
      timeat:Date.now
    }]
  });


  employee.Tasks.push(task._id);
  await employee.save();

  const project = await Project.findById(linkedproject)

  if(!project){
    throw new Apierror(400,"Projects not found in database")
  }

 project.tasks = task
 await project.save(
  {validateBeforeSave:false}
 )

  res.status(200).json(
    new Apiresponse(200, "Task assigned successfully", task)
  );
});

const updatetask = asynchandler(async (req, res) => {
  const { id } = req.params;
  const user = req.user;
  const { status, priority, employeeid, dueAt } = req.body;

  if (!id) {
    throw new Apierror(400, "Task id is required");
  }

  const task = await Task.findById(id);
  if (!task) {
    throw new Apierror(404, "No task found with this id");
  }


  if (status && status !== task.status) {
    task.status = status;
    task.history.push({
      actionby: user.name,
      title: `Status updated to ${status}`,
      timeat: Date.now()
    });
  }

  if (priority && priority !== task.priority) {
    task.priority = priority;
    task.history.push({
      actionby: user.name,
      title: `Priority updated to ${priority}`,
      timeat: Date.now()
    });
  }

  if (employeeid && String(task.assignedto) !== String(employeeid)) {
    const employee = await User.findById(employeeid);
    if (!employee) {
      throw new Apierror(404, "Assigned employee not found");
    }

    task.assignedto = employeeid;
    task.history.push({
      actionby: user.name,
      title: `Allotted to ${employee.name}`,
      timeat: Date.now()
    });
  }

  const toDateOnly = (d) => {
  if (!d) return null;
  const date = new Date(d);
  date.setHours(0, 0, 0, 0);
  return date.getTime();
};

  if (
  dueAt &&
  toDateOnly(dueAt) !== toDateOnly(task.dueAt)
) {
  task.dueAt = dueAt;
  task.history.push({
    actionby: user.name,
    title: "Deadline updated",
    timeat: Date.now()
  });
}


  const updatedtask = await task.save({ validateBeforeSave: false });

  res
    .status(200)
    .json(new Apiresponse(200, "Task updated successfully", updatedtask));
});


const addproject = asynchandler(async (req, res) => {

  const {
    projectname,
    description,
    manager,
    startdate,
    enddate,
    team,
    progress,risks
  } = req.body;

  if (!projectname || !description || !manager || !startdate || !enddate || !team) {
    throw new Apierror(400, "Please fill all required fields");
  }

  if (!Array.isArray(team) || team.length === 0) {
    throw new Apierror(400, "Team members array is required");
  }

  const project = await Project.create({
    projectname,
    description,
    manager,
    team: {
      teamId:generateTeamID(),
      teamScore:0,
      assignedMembers: team
    },
    timeline: {
      startDate: startdate,
      endDate: enddate
    },
    progress: { percent: 0, status: "Pending" },
    risks: [],

  });

  
  for (const member of team) {
    await User.findByIdAndUpdate(member.userId, {
      $push: { Projects: project._id }
    });
  }

  res.status(201).json(
    new Apiresponse(201, "Project created successfully", project)
  );
});

const createissue = asynchandler(async(req,res)=>{
  const {id,title,details,category,severity}=req.body
  const user = req.user;

  if(!id||!title||!details||!category||!severity){
    throw new Apierror(400,"Please fill all the required fields")
  }

  const project = await Project.findById(id)
  if(!project){
    throw new Apierror(404,"Project not found")
  }

  const employee = await User.findById(user._id)

  if(!employee){
    throw new Apierror(400,"Employee Not Found")
  }



  project.risks.push({
    title:title,
    details:details,
    category:category,
    severity:severity,
    status:"Raised",
    raisedon:Date.now(),
    raisedby:employee._id
})
const newproject = await project.save({validateBeforeSave:false})
res.status(200)
.json(new Apiresponse(201,"Risks Added Successfully".newproject))
   
})

const allprojects = asynchandler(async(req,res)=>{
  const projects =await Project.find();
  if(!projects){
    throw new Apierror(400,"No Projects Found in Database")
  }
  res.status(200)
  .json(new Apiresponse(201,"Projects Fetched Successfully",projects))
})

const allemployees = asynchandler(async(req,res)=>{
  const employees = await User.find();
  if(!employees){
    throw new Apierror(400,"User not found")
  }
  res.status(200)
  .json(new Apiresponse(200,"User Fetched Successfully",employees))
})

const redflags = asynchandler(async(req,res)=>{
  const redflags = await RedFlag.find()
  if(!redflags){
    throw new Apierror(400,"Something Went Wrong")
  }

  res.status(200)
  .json(new Apiresponse(201,"Redflags Fetched Successfully",redflags))
})

const alltasks = asynchandler(async(req,res)=>{
  const tasks = await Task.find()

  if(!tasks){
    throw new Apierror(400,"Something went wrong in getting tasks")
  }

  res.status(200)
  .json(new Apiresponse(201,"Tasks fetched Successfully",tasks))
})

const projectdetails = asynchandler(async (req, res) => {
  const { id } = req.params;

  if (!id) {
    throw new Apierror(400, "Please enter all Credentials");
  }

  console.log("Incoming ID:", id);

  const project = await Project.find()

  const pr = await project.find(p=>p._id.toString() === id)

  if (!pr) {
    console.log("Project NOT FOUND for:", id);
    throw new Apierror(404, "Project not found");
  }

  res.status(200).json(new Apiresponse(
    200,
    "Project details fetched successfully",
    pr
  ));
});



const updateProject = asynchandler(async (req, res) => {
  const {
    projectId,
    projectname,
    description,
    manager,
    startdate,
    enddate,
    team,
  } = req.body;

 
  if (!projectId) {
    throw new Apierror(400, "Project ID is required");
  }

  if (!projectname || !description || !manager || !startdate || !enddate) {
    throw new Apierror(400, "Please fill all required fields");
  }

  if (!Array.isArray(team) || team.length === 0) {
    throw new Apierror(400, "Team members array is required");
  }

 
  const existingProject = await Project.findById(projectId);
  if (!existingProject) {
    throw new Apierror(404, "Project not found");
  }


  const oldTeam = existingProject.team.assignedMembers.map((m) =>
    m.userId.toString()
  );


  const newTeam = team.map((m) => m.userId.toString());

  
  for (const userId of oldTeam) {
    if (!newTeam.includes(userId)) {
      await User.findByIdAndUpdate(userId, {
        $pull: { Projects: projectId },
      });
    }
  }

 
  for (const member of team) {
    if (!oldTeam.includes(member.userId)) {
      await User.findByIdAndUpdate(member.userId, {
        $addToSet: { Projects: projectId },
      });
    }
  }


  existingProject.projectname = projectname;
  existingProject.description = description;
  existingProject.manager = manager;

  existingProject.timeline = {
    startDate: startdate,
    endDate: enddate,
  };

  existingProject.team.assignedMembers = team;

  const updated = await existingProject.save();

  res.status(200).json(
    new Apiresponse(200, "Project updated successfully", updated)
  );
});

const deleteTask = asynchandler(async (req, res) => {
  const { id } = req.params;

  if (!id) throw new Apierror(400, "Task ID required");

  const deleted = await Task.findByIdAndDelete(id);

  if (!deleted) {
    throw new Apierror(404, "Task not found");
  }

  return res
    .status(200)
    .json(new Apiresponse(200, "Task permanently deleted"));
});

const createrole = asynchandler(async(req,res)=>{
  const {rolename,details} = req.body;

  if(!rolename || !details){
    throw new Apierror(400,"Please fill all the fields")
  }

  const role = await Role.create({
    rolename,
    details
  })

  res.status(200)
  .json(new Apiresponse(201,"Role Created Successfully",role))
})

const getroles = asynchandler(async(req,res)=>{
  const roles = await Role.find()

  if(!roles){
    throw new Apierror(400,"No roles Found")
  }

  res.status(200)
  .json(new Apiresponse(201,"Roles Fetched Successfully",roles))
})

const updaterole = asynchandler(async (req, res) => {
  const { roleid, rolename, details, users } = req.body;

  const role = await Role.findById(roleid);
  if (!role) {
    throw new Apierror(404, "Role not found");
  }

  if (rolename) role.rolename = rolename;
  if (details) role.details = details;


  const currentUsers = await User.find({ roleid });

  const selectedUserIds = users || [];
  for (let user of currentUsers) {
    if (!selectedUserIds.includes(user._id.toString())) {
      user.roleid = null;
      user.designation.name = "";
      await user.save({ validateBeforeSave: false });
    }
  }

  for (let userId of selectedUserIds) {
    const user = await User.findById(userId);
    if (user) {
      user.roleid = roleid;
      user.designation.name = rolename;
      await user.save({ validateBeforeSave: false });
    }
  }
  role.users = selectedUserIds

  const updatedRole = await role.save({ validateBeforeSave: false });

  res.status(200).json(
    new Apiresponse(200, "Role Updated Successfully", updatedRole)
  );
});


const assignbulkrole = asynchandler(async(req,res)=>{
  const {role,users} = req.body
  if(!role || !users){
    throw new Apierror(400,"Please fill all the required Details")
  }

  const roles = await Role.findById(role)

  if(!roles){
    throw new Apierror(400,"Role not Found")
  }

  roles.users = users
  await roles.save({validateBeforeSave:false})

  const employees = await User.find()

  for(let id of users){
    const user = employees.find(e => e._id.toString() === id)

    if(!user){
      throw new Apierror(404,"User not found")
    }
      user.roleid = role
      user.designation.name = roles.rolename
    

    await user.save({validateBeforeSave:false})
  }

  res.status(200)
  .json(new Apiresponse(201,"Role Assigned Successfully",roles))
})

const alltickets = asynchandler(async (req, res) => {
  const tickets = await Token.find();

  if (!tickets) {
    throw new Apierror(404, "Ticket not found");
  }

  res.status(200).json(
    new Apiresponse(
      200,
      tickets,                         
      "Tickets Fetched Successfully"   
    )
  );
});
const ticketdetail = asynchandler(async(req,res)=>{
  const {id} = req.body

  if(!id){
    throw new Apierror(400,"Please fill all the required details")
  }

  const ticket = await Token.findById(id)
  if(!ticket){
    throw new Apierror(404,"Ticket not found")
  }

  res.status(200)
  .json(new Apiresponse(201,"Ticket details fetched successfully",ticket))
})

const deleterole= asynchandler(async(req,res)=>{
  const {id} = req.params

  if(!id){
    throw new Apierror("Please fill all the required Fields")
  }
  const deleted = await Role.findByIdAndDelete(id)

  res.status(200)
  .json(new Apiresponse(201,"Role deleted Successfully",deleted))
})

const updatestatus = asynchandler(async(req,res)=>{
  const {id , status} = req.body

  if(!id || !status){
    throw new Apierror(400,"Please fill all the required fields")
  }

  const ticket = await Token.findById(id)
  if(!ticket){
    throw new Apierror(404,"Ticket not found")
  }

  ticket.status = status
  ticket.updatedon = Date.now()
  await ticket.save({validateBeforeSave:false})

  res.status(200)
  .json(new Apiresponse(201,"Status Updated Successfully",ticket))
})

const addcomment = asynchandler(async(req,res)=>{
  const {id,comment} = req.body

  if(!id || !comment){
    throw new Apierror(400,"Please fill all the required fields")
  }

  const ticket = await Token.findById(id)
  if(!ticket){
    throw new Apierror(404,"Ticket not found")
  }

 ticket.comments.push({
  text:comment,
  by:"Aishwarya G",
  date:Date.now()

 })
 if(ticket.status === "Open"){
  ticket.status = "In Progress"
 }

 await ticket.save({validateBeforeSave:false})

 res.status(200)
 .json(new Apiresponse(201,"Comment Added Successfully",ticket))

})

const assignticket = asynchandler(async(req,res)=>{
    const {id,assignedto} = req.body

  if(!id || !assignedto){
    throw new Apierror(400,"Please fill all the required fields")
  }
  const ticket = await Token.findById(id)
  if(!ticket){
    throw new Apierror(404,"Ticket not found")
  }

  ticket.assignedto = assignedto
  await ticket.save({validateBeforeSave:false})

  res.status(200)
 .json(new Apiresponse(201,"Ticket Assigned Successfully",ticket))

})

const createticket = asynchandler(async(req,res)=>{
  const{title , category , priority , details} = req.body
  const user = req.user
  if(!user){
    throw new Apierror(404,"Unauthorized Access")
  }

  if(!title || !category ||!priority ||!details){
    throw new Apierror(400,"Please fill all the required Details")
  }

 const ticket = await Token.create({
    title,
    category,
    priority,
    details,
    status : "Open",
    raisedby:user._id,
    raisedon:Date.now()
  })

  res.status(200)
  .json(new Apiresponse(201,"Ticket Created Successfully",ticket))
})

const normalizeChannels = (channelsObj) => {
  if (!channelsObj || typeof channelsObj !== "object") return [];

  const out = [];
  if (channelsObj.banner) out.push("Dashboard Banner");
  if (channelsObj.email) out.push("Email Notification");
  if (channelsObj.push) out.push("In-App Push Notification");

  return out;
};



const createAnnouncement = asynchandler(async (req, res) => {
  const {
    title,
    message,
    priority,
    channels,
    audience, 
    type,
    selectedPeople = [], 
    selectedTeams = [], 
    scheduleAt = null, 
  } = req.body;
  const employee = req.user

const user = await User.findById(employee._id)

  if(!user){
    throw new Apierror(400,"User not Authorized")
  }

  
  if (!title || !message || !priority || !channels || !audience || !type) {
    throw new Apierror(400, "Please fill all the required details");
  }

  const channelsNormalized = normalizeChannels(channels);

  const audienceObj = {
    name: audience,
    includeUsers: [],
    includeTeams: [],
  };

  let finalUsers = [];

// 👤 Individual Users
if (audience === "Individual Recipients") {
  finalUsers = await User.find({ _id: { $in: selectedPeople } });
  audienceObj.includeUsers = finalUsers.map(u => u._id);
}

// 👥 Teams
else if (audience === "Specific Teams") {
  audienceObj.includeTeams = selectedTeams;

  finalUsers = await User.find({
    roleid: { $in: selectedTeams }
  });

  audienceObj.includeUsers = finalUsers.map(u => u._id);
}

// 🏢 All Employees
else if (audience === "All Employees") {
  finalUsers = await User.find({});
  audienceObj.includeUsers = finalUsers.map(u => u._id);
}

  if (channelsNormalized.includes("Email Notification")) {
    await sendAnnouncementEmails({
      users: finalUsers,
      title,
      message,
      type,
    });
  }
  const announcement = await Announcement.create({
    type,
    title,
    details: message,
    audience: audienceObj,
    priority,
    channels: channelsNormalized,
    scheduledby: user.name || "system",
    scheduledon: scheduleAt ? new Date(scheduleAt) : null,
    createdon: new Date(),
    readby: 0,
  });

  res.status(201)
  .json(new Apiresponse(201, "Announcement created successfully", announcement));
});

const getannouncements = asynchandler(async(req,res)=>{
  const announcement = await Announcement.find()

  if(!announcement){
    throw new Apierror(400,"Announcement not found")
  }

  res.status(200)
  .json(new Apiresponse(201,"Announcements Fetched Successfully",announcement))
})

const getmetricsdata = asynchandler(async(req,res)=>{
  const metrics = await Metrics.find()

  if(!metrics){
    throw new Apierror(400,"Metrics not found")
  }

  res.status(200)
  .json(new Apiresponse(201,"Metrics fetched Successfully",metrics))
})

const attendance = asynchandler(async(req,res)=>{
  const attendance = await Attendance.find()

  if(!attendance){
    throw new Apiresponse(400,"Attendance not found")
  }

  res.status(200)
  .json(new Apiresponse(201,"Attendance fetched Successfully",attendance))
})

const reports = asynchandler(async(req,res)=>{
  const report = await Report.find()

  if(!report){
    throw new Apierror(400,"Reports not Found")
  }

  res.status(200)
  .json(new Apiresponse(201,"Report Fetched Successfully",report))


})

const sla = asynchandler(async(req,res)=>{
  const sla = await SLA.find()

  if(!sla){
    throw new Apierror(404,"SLA not found")
  }
 
  res.status(200)
  .json( new Apiresponse(201,"SLA Fetched Successfully",sla))
})

const scores = asynchandler(async(req,res)=>{
  const scores = await PerformanceScore.find()

  if(!scores){
    throw new Apierror(404,"Scores not Found")
  }

  res.status(200)
  .json(new Apiresponse(201,"Scores fetched Successfully",scores))
})

export const generateReport = async (req, res) => {
  try {
    const { type, from, to, format, options } = req.body;

    if (!type || !from || !to || !format) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const exportRecord = await ReportExport.create({
      type,
      from,
      to,
      format,
      options,
      status: "processing",
      createdBy: req.user?._id
    ? { createdBy: req.user._id }
    : null 

    });

    // 🔥 BACKGROUND EXECUTION (NON-BLOCKING)
    setImmediate(async () => {
      try {
        let data;

        switch (type) {
          case "tasks":
            data = await Task.find({
              createdAt: { $gte: from, $lte: to }
            }).populate("assignedto projectId");
            break;

          case "metrics":
            data = {
              metrics: await Metrics.find({ date: { $gte: from, $lte: to } }),
              sla: await SLA.find({ date: { $gte: from, $lte: to } })
            };
            break;

          case "performance":
            data = await PerformanceScore.find({
              createdAt: { $gte: from, $lte: to }
            }).populate("userId");
            break;

          case "employees":
            data = await User.find({
              createdAt: { $gte: from, $lte: to }
            });
            break;

          case "redflags":
            data = await RedFlag.find({
              date: { $gte: from, $lte: to }
            }).populate("userId");
            break;
        }

        let fileUrl;
        if (format === "excel") {
          fileUrl = await generateExcel(type, data, exportRecord._id);
        } else {
          fileUrl = await generatePDF(type, data, exportRecord._id, options);
        }

        await ReportExport.findByIdAndUpdate(exportRecord._id, {
          status: "ready",
          fileUrl
        });

      } catch (err) {
        await ReportExport.findByIdAndUpdate(exportRecord._id, {
          status: "failed",
          error: err.message
        });
      }
    });

    // ✅ INSTANT RESPONSE
    res.status(202).json({
      message: "Report generation started",
      reportId: exportRecord._id
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Report generation failed" });
  }
};


export const getReportExports = async (req, res) => {
  const filter = req.user?._id
    ? { createdBy: req.user._id }
    : {}; // 🔥 show all exports if no auth

  const exports = await ReportExport.find(filter).sort({ createdAt: -1 });
  res.json(exports);
};







export {addproject,createissue,createticket,logout,getuser,adminlogin,addemployee,updateemployee,scores,reports,sla,deleterole,attendance,getmetricsdata,getannouncements,assignticket,createAnnouncement,alltickets,addcomment,updatestatus,ticketdetail,getroles,updaterole,assignbulkrole,createrole,deleteTask,assigntask,updatetask,updateProject ,projectdetails,alltasks, allprojects,allemployees,redflags}

 