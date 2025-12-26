import mongoose from "mongoose"
import { Counter } from "./counter.models.js";


const ProjectSchema = new mongoose.Schema({

  projectname: {
    type: String,
    required: true,
    trim: true,
  },

  description: {
    type: String,
    required: true,
    trim: true
  },

  projectCode: {
    type: String,
   default:""
  },

  manager: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  team: {
    teamScore: {
      type: Number,
      default:0
    },
    teamId:{
      type:String,
      default:"",
    },
    assignedMembers: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true
        },
        role: {
          type: String,
          required: true
        },
        assignedAt: {
          type: Date,
          default: Date.now
        }
      }
    ]
  },

  // Project progress
  progress: {
    percent: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ["Ongoing", "Pending", "Completed"],
      default: "Pending"
    }
  },

  // Timeline
  timeline: {
    startDate: { type: Date, default: Date.now },
    endDate: { type: Date, default: null }
  },

  tasks: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Task"
    }
  ],

  risks: [
    {
      title: { type: String, default: "" },
      details: { type: String, default: "" },
      severity: { type: String, enum: ["Low", "Medium", "High","Critical"] },
      status: { type: String, enum: ["Raised", "Resolved"] },
      category: { type: String, enum: ["Frontend","Backend","Deployement","Access","Others"] },
      raisedby:{type:mongoose.Schema.Types.ObjectId,ref:"User"},
      raisedon:{type:Date,default:null},
      resolvedon:{type:Date,default:null}
    }
  ],
  budget:{
    type:Number,
    default:0
  },
  recentActivity:[{
    title:{
      type:String,
      default:""
    },
    refModel: {
          type: String,
          enum: ["Task", "Report", "Token", "Project"],
          default: null,  
        },
    
       
        refs: {
          type: mongoose.Schema.Types.ObjectId,
          refPath: "recentActivity.refModel",
          default: null, 
        },
    user:{
      type:String,
      default:""
    },
    time:{
      type:Date,
      default:null
    }
  }],

  deleted: {
    type: Boolean,
    default: false
  }

}, { timestamps: true });

// ProjectSchema.pre("save", async function (next) {
//   if (this.projectCode) return next();

//   const counter = await Counter.findByIdAndUpdate(
//     { _id: "projectId" },
//     { $inc: { seq: 1 } },
//     { new: true, upsert: true }
//   );

//   const number = counter.seq.toString().padStart(3, "0"); 
//   this.projectCode = `P${number}`;

//   next();
// });

export const Project  = new mongoose.model("Project",ProjectSchema)