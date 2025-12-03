import mongoose from "mongoose"
import { User } from "../models/Employee.models.js"
import nodemailer from "nodemailer"
import { Project } from "../models/Project.models.js"
import { asynchandler } from "../utils/Asynchandler.utils.js"
import { Apierror } from "../utils/Apierror.utils.js"
import { Apiresponse } from "../utils/Apiresponse.utils.js"
import { Task } from "../models/Task.models.js"


const generateTeamID = () => {
  const random = Math.floor(100 + Math.random() * 900);
  return `P00${random}`;
};


const addemployee = asynchandler(async(req,res)=>{
    try {
        const {email,name,password,designation,status,role} = req.body
        
        
        if(!email || !name || !password ||!designation ||!status ||!role){
            throw new Apierror(400,"Please Enter all the Requires Fields")
        }
         
        
        const existinguser = await User.findOne({
            $or:[{email}]
        })
    
        if(existinguser){
            throw new Apierror(409,"Employee with this crdentials already exists")
        }
        
        
        const user = await User.create({
          name,
          email,
          password,
          designation,
          status,
          role,
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

Employee ID: ${user._id}
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
    team
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
    }
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




export {addproject,addemployee,assigntask , allprojects,allemployees}

