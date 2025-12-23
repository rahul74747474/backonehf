import {Router} from "express"
import { acknowledge, completetask, employeelogin, reviewtask, saveTime, sendcomment, startAttendance, submitreport, taskcompleted, uploadTaskAttachment } from "../controller/Employee.controller.js"
import { verifyjwt } from "../middleware/auth.middleware.js"
import { getuser } from "../controller/Admin.controller.js"
import { upload } from "../middleware/multer.middleware.js"

const employeerouter = Router()
//post api
employeerouter.route("/login").post(employeelogin)
employeerouter.route("/completedtask").post(verifyjwt,taskcompleted)
employeerouter.route("/start-attendance").post(startAttendance)
employeerouter.route("/save-time").post(saveTime)
employeerouter.route("/complete-task").post(completetask)
employeerouter.route("/review-task").post(reviewtask)
employeerouter.route("/acknowledged").post(acknowledge)
employeerouter.route("/task/upload-attachment").post(verifyjwt,
  upload.single("file"),
  uploadTaskAttachment
);
employeerouter.route("/commentsend").post(sendcomment)
employeerouter.route("/submitreport").post(submitreport)




//get api
employeerouter.route("/getuser").get(verifyjwt,getuser)



export {employeerouter}