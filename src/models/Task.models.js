import mongoose from "mongoose"

const TaskSchema = mongoose.Schema({
    projectId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Project"
    },
    title:{
        type:String,
        required:true,
        trim:true,
    },
    description:{
        type:String,
        required:true,
        trim:true,
    },
    assignedto:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"
    },
    priority:{
        type:String,
        enum:["Urgent","Low","Medium","High"]
    },
    status:{
        type:String,
        enum:["Completed","Pending","In Progress"]
    },
    dueAt:{
        type:Date,
        default:null
    },
    tags:[{
        type:String,
        default:""
    }],
    dependencies:{
        files:[{
            type:String,
            default:"",
        }],
        links:[
            {
                type:String,
                default:""
            }
        ]
    },
    weightage:{
        type:Number,
        default:0,
    },
    deleted:{
        type:Boolean,
        default:false
    },
    completedAt:{
        type:Date,
        default:null
    }
},{timestamps:true})

export const Task = new mongoose.model("Task",TaskSchema)