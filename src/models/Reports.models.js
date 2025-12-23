import mongoose from "mongoose"

const ReportSchema = mongoose.Schema({
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"
    },
    date:{
        type:Date,
        default:null
    },
    summary:{
        type:String,
        required:true,
        trim:true,
    },
    relatedtasks:[{
      type:mongoose.Schema.Types.ObjectId,
      ref:"Task"
    }],
    subtasks:[{
           title:{
            type:String,
            default:""
           },
        }],
    // attachements:{
    //     files:[{
    //         type:String,
    //         default:"",
    //     }],
    //     links:[
    //         {
    //             type:String,
    //             default:""
    //         }
    //     ]
    // },
    deleted:{
        type:Boolean,
        default:false
    }
},{timestamps:true})

export const Report = new mongoose.model("Report",ReportSchema)