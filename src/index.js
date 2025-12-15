
import dotenv from "dotenv"
import { connectdb } from "./database/dbconnect.js"
import { app } from "./app.js"

dotenv.config({
    path:"./env"
})

connectdb()
.then(()=>{
    app.listen(PORT ,()=>{
      console.log(`App is listening on PORT ${process.env.PORT}`)
    })
}).catch((error)=>{
    console.log("Something Went Wrong",error.message)
})

import "./cron/Metrics.cron.js";   // <--- Load cron
import "./cron/inactiveUserCron.js"
import "./cron/slaCron.js"
import "./cron/performanceScoreCron.js"
import "./cron/missedReportCron.js"