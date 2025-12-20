import { User } from "../models/Employee.models.js";
import { Apierror } from "../utils/Apierror.utils.js";
import { Apiresponse } from "../utils/Apiresponse.utils.js";
import { asynchandler } from "../utils/Asynchandler.utils.js";



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
    secure:true,
    sameSite:"None",
    maxAge:777600
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

export {employeelogin,getuser}