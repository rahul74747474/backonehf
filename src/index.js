
import dotenv from "dotenv"
import { connectdb } from "./database/dbconnect.js"
import { app } from "./app.js"

dotenv.config({
    path:"./env"
})


const PORT = process.env.PORT || 5000
connectdb()
.then(()=>{
    app.listen(PORT ,()=>{
      console.log(`App is listening on PORT ${PORT}`)
    })
}).catch((error)=>{
    console.log("Something Went Wrong",error.message)
})

import "./cron/Metrics.cron.js";   // <--- Load cron
import "./cron/inactiveUserCron.js"
import "./cron/slaCron.js"
import "./cron/performanceScoreCron.js"
import "./cron/missedReportCron.js"
import "./cron/ActivityremoveCron.js"