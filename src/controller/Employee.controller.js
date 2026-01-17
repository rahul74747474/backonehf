
import { User } from "../models/Employee.models.js";
import { uploadToCloudinary } from "../utils/cloudinary.utils.js";
import { Task } from "../models/Task.models.js";
import { Apierror } from "../utils/Apierror.utils.js";
import { Apiresponse } from "../utils/Apiresponse.utils.js";
import { asynchandler } from "../utils/Asynchandler.utils.js";
import { Attendance } from "../models/Attendance.models.js";
import { Report } from "../models/Reports.models.js";
import { Announcement } from "../models/Announcement.models.js";
import { Project } from "../models/Project.models.js";
import { Subtask } from "../models/SubTasks.models.js";



const employeelogin = asynchandler(async(req,res)=>{
    const{userid,password} = req.body

  if(!userid || !password){
    throw new Apierror(400,"Please fill all the required Details")
  }

  const user = await User.findOne({empid:userid})

  if(!user){
    throw new Apierror(404,"User not found")
  }

  if(user.designation.name !== "Employee" ){
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
    secure:false,
    sameSite:"lax",
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

const taskcompleted = asynchandler(async(req,res)=>{
  const {taskid} = req.body;
  const user = req.user

  if(!taskid){
    throw new Apierror(404,"Please fill all the required fields")
  }

  const task = await Task.findById(taskid)
  if(project){
    
  }
  if(task.projectId){
     const project = await Project.findById(task.projectId)
    if(!project){
      throw new Apierror(404,"No Project Found")
    }

    project.recentActivity.push({
    title:"Completed the task",
    refs:taskid,
    user:user.name,
    time:Date.now()
  })

  await project.save({validateBeforeSave:false})
  
  }
  

  if(!task){
    throw new Apierror(404,"Task not Found")
  }

  task.status = "Completed"
  task.completedAt = Date.now()

  await task.save({validateBeforeSave:false})

  

  const employee = await User.findById(user._id)
  if(!employee){
    throw new Apierror(404,"User not found")
  }
  
  if(!employee.recentActivity){
    
  }
  employee.recentActivity.push({
    name:"Task Completed",
    refs:taskid,
    time:Date.now(),
  })
  await employee.save({validateBeforeSave:false})

  res.status(200)
  .json(new Apiresponse(201,"Task Completed Successfullt",task))


})

export const getTodayRange = () => {
  const start = new Date();
  start.setHours(0, 0, 0, 0);

  const end = new Date();
  end.setHours(23, 59, 59, 999);

  return { start, end };
};


 const startAttendance = async (req, res) => {
  try {
    const {userId} = req.body;
    const { start, end } = getTodayRange();


    const user = await User.findById(userId)

    if(!user){
      throw new Apierror(404,"User not found")
    }

    user.recentActivity.push({
      name:"Timer Started - Online",
      time:Date.now()
    })
    await user.save({validateBeforeSave:false})

    const existing = await Attendance.findOne({
      user: userId,
      date: { $gte: start, $lte: end }
    });

    if (existing) {
      return res.status(200).json({
        success: true,
        message: "Attendance already marked for today",
        attendance: existing
      });
    }
    const attendance = await Attendance.create({
      user: userId,
      status: "Present",
      date: Date.now(),
      punchin:Date.now(),
      timespent: 0
    });

    res.status(201).json({
      success: true,
      message: "Attendance marked (Present)",
      attendance
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error marking attendance",
      error: error.message
    });
  }
};

export const saveTime = async (req, res) => {
  try {
    const { seconds ,userId} = req.body;

    if (!seconds || seconds <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid time"
      });
    }

    const { start, end } = getTodayRange();

    const attendance = await Attendance.findOne({
      user: userId,
      date: { $gte: start, $lte: end }
    });

    if (!attendance) {
      return res.status(404).json({
        success: false,
        message: "Attendance not found for today"
      });
    }

    attendance.timespent += seconds;
    // attendance.punchout = new Date();

    await attendance.save();

    res.status(200).json({
      success: true,
      message: "Work time saved",
      attendance
    });

     const employee = await User.findById(userId)

    if(!employee){
      throw new Apierror(404,"User not Found")
    }

    employee.recentActivity.push({
      name:"Break Time Started",
      refs:"",
      time:Date.now()
    })
    await employee.save({validateBeforeSave:false})

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error saving time",
      error: error.message
    });
  }
};

export const uploadTaskAttachment = asynchandler(async (req, res) => {
  const { taskId  } = req.body;
  const user = req.user

  const employee = await User.findById(user._id)

  if (!employee ) {
    throw new Apierror(404, "Employee not found");
  }

  if (!req.file || !taskId) {
    throw new Apierror(400, "File is required");
  }

  const task = await Task.findById(taskId);
  if (!task ) {
    throw new Apierror(404, "Task not found");
  }

  if(task.projectId){
     const project = await Project.findById(task.projectId)
    if(!project){
      throw new Apierror(404,"No Project Found")
    }
     project.recentActivity.push({
    title:`Added Attachment ${req.file.originalname}`,
    refs:task._id,
    user:user.name,
    time:Date.now()
  })

  await project.save({validateBeforeSave:false})

  }
 
  // Upload to Cloudinary
  const uploaded = await uploadToCloudinary(
    req.file.buffer,
    "prism/tasks",
    `${task.title}-${Date.now()}`
  );

  // Save file URL in schema (dependencies.files)
  task.dependencies.files.push(uploaded.secure_url);

  // History entry
  task.history.push({
    actionby:user.name,
    title: `Attachment added: ${req.file.originalname}`,
    timeat: Date.now()
  });

  await task.save({ validateBeforeSave: false });

  employee.recentActivity.push({
    name:"Attachment added",
    refs:task._id,
    time:Date.now()
  })

  await employee.save({ validateBeforeSave: false });

 


  res.status(201).json(
    new Apiresponse(201, "Attachment uploaded successfully", {
      fileUrl: uploaded.secure_url,
      fileName: req.file.originalname
    })
  );
});

const sendcomment = asynchandler(async(req,res)=>{
  const {comment,taskid,userid} = req.body

  if(!comment || !taskid ||!userid){
    throw new Apierror(404,"Please fill all the required fields")
  }

  const task = await Task.findById(taskid)
  const user = await User.findById(userid)
  if(task.projectId){
    const project = await Project.findById(task.projectId)
    if(!project){
      throw new Apierror(404,"No Project Found")
    }
     project.recentActivity.push({
    title:"Commented on",
    refs:task._id,
    user:user.name,
    time:Date.now()
  })

  await project.save({validateBeforeSave:false})
  }
  

  if(!task || !user){
    throw new Apierror(400,"Task or User not found")
  }

  task.comments.push({
    commentby:user.name,
    text:comment,
    timeat:Date.now()
  })

  task.history.push({
    actionby:user.name,
    title: `Comment By ${user.name}`,
    timeat: Date.now()
  });
  await task.save({validateBeforeSave:false})

  user.recentActivity.push({
    name:`${user.name} Commented`,
    refs:task._id,
    time:Date.now()
  })

  await user.save({ validateBeforeSave: false });
 


  res.status(200)
  .json(new Apiresponse(201,"Comment done Successfully",task.comments))

})

const completetask = asynchandler(async(req,res)=>{
  const {taskid,userid} = req.body

  if(!taskid ||!userid){
    throw new Apierror(404,"Please fill all the required fields")
  }

  const task = await Task.findById(taskid)
  const user = await User.findById(userid)
  if(task.projectId){
     const project = await Project.findById(task.projectId)
    if(!project){
      throw new Apierror(404,"No Project Found")
    }
    project.recentActivity.push({
    title:"Completed Task",
    refs:task._id,
    user:user.name,
    time:Date.now()
  })

  await project.save({validateBeforeSave:false})
  }
 

  if(!task || !user){
    throw new Apierror(400,"Task or User not found")
  }

  task.status = "Completed"
  task.completedAt=Date.now()
  task.history.push({
    actionby:user.name,
    title: `Task Completed`,
    timeat: Date.now()
  });
  await task.save({validateBeforeSave:false})

  user.recentActivity.push({
    name:`Task Completed`,
    refs:task._id,
    time:Date.now()
  })

  await user.save({ validateBeforeSave: false });
  

  res.status(200)
  .json(new Apiresponse(201,"Task Completed Successfully",task))

})

const reviewtask = asynchandler(async(req,res)=>{
  const {taskid,userid} = req.body

  if(!taskid ||!userid){
    throw new Apierror(404,"Please fill all the required fields")
  }

  const task = await Task.findById(taskid)
  const user = await User.findById(userid)
  if(task.projectId){
    const project = await Project.findById(task.projectId)
    if(!project){
      throw new Apierror(404,"No Project Found")
    }
     project.recentActivity.push({
    title:"Pushed the Task for Review",
    refs:task._id,
    user:user.name,
    time:Date.now()
  })

  await project.save({validateBeforeSave:false})
  }
  

  if(!task || !user){
    throw new Apierror(400,"Task or User not found")
  }

  task.status = "Pending"
  task.history.push({
    actionby:user.name,
    title: `Task set to Review`,
    timeat: Date.now()
  });
  await task.save({validateBeforeSave:false})

  user.recentActivity.push({
    name:`Task Set for Review`,
    refs:task._id,
    time:Date.now()
  })

  await user.save({ validateBeforeSave: false });

 


  res.status(200)
  .json(new Apiresponse(201,"Task set to Review Successfully",task))

})

const submitreport =asynchandler(async(req,res)=>{
  const {user,relatedtasks,summary}=req.body
  
  if(!user || !relatedtasks || !summary ){
    throw new Apierror(400,"Please fill all the required details")
  }

  const employee = await User.findById(user)
  if(!employee){
    throw new Apierror(404,"User with this id do not exists")
  }

  const report = await Report.create({
    user:user,
    date:Date.now(),
    summary:summary,
    relatedtasks:relatedtasks,
  })

  if(!report){
    throw new Apierror(400,"Something Went Wrong in Creating Report ")
  }

  employee.recentActivity.push({
    name:"Report Submitted Today",
    ref:"",
    time:Date.now()
  })
  await employee.save({validateBeforeSave:false})

  res.status(201)
  .json(201,"Report Submitted Successfully",report)
})

const acknowledge = asynchandler(async(req,res)=>{
  const {id,user}=req.body
  if(!id || !user){
    throw new Apierror(400,"Please fill all the requires fields")
  }

  const announce = await Announcement.findById(id)
  if(!announce){
    throw new Apierror(404,"Announcement noy found")
  }

  const employee = await User.findById(user)
  if(!employee){
    throw new Apierror(404,"Employee not found")
  }

  announce.readby =announce.readby + 1
  if(!announce.acknowledged)announce.acknowledged = []

  announce.acknowledged.push({
    userid:user,
    status:true
  })
  await announce.save({validateBeforeSave:false})

  employee.recentActivity.push({
    name:"Announcement Acknowledged",
    ref:"",
    time:Date.now()
  })
  await employee.save({validateBeforeSave:false})

  res.status(201)
  .json(201,"Report Submitted Successfully",announce)


})

const punchout = asynchandler(async(req,res)=>{
  try {
    const { seconds ,userId} = req.body;

    if (!seconds || seconds <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid time"
      });
    }

    const { start, end } = getTodayRange();

    const attendance = await Attendance.findOne({
      user: userId,
      date: { $gte: start, $lte: end }
    });

    if (!attendance) {
      return res.status(404).json({
        success: false,
        message: "Attendance not found for today"
      });
    }

    attendance.timespent += seconds;
    attendance.punchout = Date.now();

    await attendance.save();

    const employee = await User.findById(userId)

    if(!employee){
      throw new Apierror(404,"User not Found")
    }

    employee.recentActivity.push({
      name:"Punched Out Successfully",
      refs:"",
      time:Date.now()
    })
    await employee.save({validateBeforeSave:false})

    res.status(200).json({
      success: true,
      message: "Punched Out Safely",
      attendance
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error saving time",
      error: error.message
    });
  }
})

const updatetask = asynchandler(async (req, res) => {
  const { id } = req.params;
  const userid = req.user._id;
  const { status } = req.body;

  if (!id) {
    throw new Apierror(400, "Task id is required");
  }
  const updatedby = await User.findById(userid)

  if(!updatedby){
    throw new Apierror(404,"User not authorized")
  }
 const task = await Task.findById(id);

  if (!task) {
    throw new Apierror(404, "No task found with this id");
  }
  if(task.projectId){
   const project = await Project.findById(task.projectId)
    if(!project){
      throw new Apierror(404,"No Project Found")
    }
     project.recentActivity.push({
    title:`Task Status Updated to ${status}`,
    refs:task._id,
    user:updatedby.name,
    time:Date.now()
  })

  await project.save({validateBeforeSave:false})

  }
  
  if(task.status === "Completed" && status !== "Completed" && status){
      task.status = status;
      task.completedAt = null
    if (!Array.isArray(task.history)) {
  task.history = [];
}
    task.history.push({
      actionby: updatedby.name,
      title: `Status updated to ${status}`,
      timeat: Date.now()
    });

  }
  else if(task.status !== "Completed" && status === "Completed" && status){
      task.status = status;
      task.completedAt = Date.now()
    if (!Array.isArray(task.history)) {
  task.history = [];
}
    task.history.push({
      actionby: updatedby.name,
      title: `Status updated to ${status}`,
      timeat: Date.now()
    });

  }
  else if(status && status !== task.status) {
    task.status = status;
    if (!Array.isArray(task.history)) {
  task.history = [];
}
    task.history.push({
      actionby: updatedby.name,
      title: `Status updated to ${status}`,
      timeat: Date.now()
    });
  }
   updatedby.recentActivity.push({
         name :`Task Status Updated to ${status}`,
         refs:id,
         time:Date.now()
      })

    
  const updatedtask = await task.save({ validateBeforeSave: false });
  await updatedby.save({validateBeforeSave:false})

  res
    .status(200)
    .json(new Apiresponse(200, "Task updated successfully", updatedtask));
});
const addsubtask = asynchandler(async(req,res)=>{
   const {title,description,relatedtask} = req.body
   const user = req.user

   if(!title || !description || !relatedtask||!user){
    throw new Apierror(404,"Please fill all the required fields")
   }

   const task = await Task.findById(relatedtask)
   const employee = await User.findById(user._id)
   if(task.projectId){
     const project = await Project.findById(task.projectId)
        project.recentActivity.push({
    title:`Subtask Added for Task`,
    refs:task._id,
    user:employee.name,
    time:Date.now()
  })

  await project.save({validateBeforeSave:false})


   }
   

   if(!task || !employee ){
    throw new Apierror("Not found in database")
   }

   const subtask =await Subtask.create({
     title:title,
     description:description,
     relatedtasks:relatedtask,
     createdby:user._id,
     createdAt:Date.now()
   })


   if(!task.subtasks) task.subtasks = []

   task.subtasks.push(subtask._id)
     task.history.push({
      actionby: employee.name,
      title: `Sub Task Added for task ${task.title}`,
      timeat: Date.now()
    });

    await task.save({validateBeforeSave:false})

    
   employee.recentActivity.push({
         name :`Added Subtask for Task`,
         refs:task._id,
         time:Date.now()
      })

await employee.save({validateBeforeSave:false})

  res
    .status(200)
    .json(new Apiresponse(200, "Sub-Task Added successfully", subtask));



})

const getsubtask =asynchandler(async(req,res)=>{
  const subtask =await Subtask.find()

  if(!subtask){
    throw new Apierror(404,"Subtask not found")
  }

  res.status(200)
  .json(new Apiresponse(201,"Subtask fetched successfully",subtask))
})


export {employeelogin,getuser,addsubtask,getsubtask,taskcompleted,acknowledge,updatetask,punchout,startAttendance,reviewtask,sendcomment,completetask,submitreport}