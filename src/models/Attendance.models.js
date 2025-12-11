import mongoose from "mongoose"

const AttendanceSchema = mongoose.Schema({
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"
    },
    status:{
        type:String,
        enum:["Present","Absent","On Leave"],
    },
    timespent:{
        type:Number,
        default:0,
    },
    date:{
        type:Date,
        default:null,
    },
    punchin:{
        type:Date,
        default:null
    },
    punchout:{
        type:Date,
        default:null
    }
},{timestamps:true})

export const Attendance = new mongoose.model("Attendance",AttendanceSchema)