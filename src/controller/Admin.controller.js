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
      subject: `📢 ${type} Announcement: ${title}`,
      text: announcementMailTemplate({
        name: emp.name,
        title,
        message,
        type,
      }),
    };

    await transporter.sendMail(mailOptions);
  }
};

const announcementMailTemplate = ({ name, title, message, type }) => {
  return `
Hello ${name || "Team"},

📢 New Announcement (${type})

Title:
${title}

Message:
${message}

Please check the portal for more details.

Regards,
Humanity Founders
`;
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
            throw new Apierror(409,"Employee with this credentials already exists")
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

        const mailoptions = {
            to:email,
            from:process.env.SMTP_USER,
            subject: "Your Job Portal Account Has Been Successfully Created",
            text: `Hello,

Your account on the Job Portal has been created successfully. 
Below are your login credentials:

Employee ID: ${empid}
Password: ${password}

Please log in and update your details as soon as possible.
If you have any questions, feel free to contact the HR team.

Regards,
Humanity Founders | HR Team
`
         }

        await transporter.sendMail(mailoptions)
    
        res.status(200)
        .json(new Apiresponse(201,"User Created Successfully",user))
    } catch (error) {
        console.log("Error",error.message)
    }

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

const assigntask = asynchandler(async (req, res) => {
  const { employeeid, title, description, dueAt, linkedproject, status, priority } = req.body;

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
    status
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

  if(!id||!title||!details||!category||!severity){
    throw new Apierror(400,"Please fill all the required fields")
  }

  const project = await Project.findById(id)
  if(!project){
    throw new Apierror(404,"Project not found")
  }

  project.risks.push({
    title:title,
    details:details,
    category:category,
    severity:severity,
    status:"Raised",
    raisedon:Date.now(),
    raisedby: project.team.assignedMembers[0]._id
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

  if(!title || !category ||!priority ||!details){
    throw new Apierror(400,"Please fill all the required Details")
  }

 const ticket = await Token.create({
    title,
    category,
    priority,
    details,
    status : "Open",
    raisedbY:"Aishwarya G",
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
    scheduledby: req.user?.name || "system",
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






export {addproject,createissue,createticket,addemployee,updateemployee,scores,reports,sla,deleterole,attendance,getmetricsdata,getannouncements,assignticket,createAnnouncement,alltickets,addcomment,updatestatus,ticketdetail,getroles,updaterole,assignbulkrole,createrole,deleteTask,assigntask,updateProject ,projectdetails,alltasks, allprojects,allemployees,redflags}

 