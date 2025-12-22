
import { User } from "../models/Employee.models.js";

import { Task } from "../models/Task.models.js";
import { Apierror } from "../utils/Apierror.utils.js";
import { Apiresponse } from "../utils/Apiresponse.utils.js";
import { asynchandler } from "../utils/Asynchandler.utils.js";
import { Attendance } from "../models/Attendance.models.js";



const employeelogin = asynchandler(async(req,res)=>{
    const{userid,password} = req.body

  if(!userid || !password){
    throw new Apierror(400,"Please fill all the required Details")
  }

  const user = await User.findOne({empid:userid})

  if(!user){
    throw new Apierror(404,"User not found")
  }

  // if(user.designation.name !== "Employee" || user.designation.name !== "Intern"){
  //   throw new Apierror(404,"User not Authorized to Access the portal")
  // }

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

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error saving time",
      error: error.message
    });
  }
};


export {employeelogin,getuser,taskcompleted,startAttendance}