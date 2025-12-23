import mongoose from "mongoose"

const AnnouncementSchema = mongoose.Schema({
    type:{
        type:String,
        enum:["General Announcement","Warning/Inquiry","Motivational"]
    },
    title:{
        type:String,
        trim:true,
        default:""
    },
    details:{
        type:String,
        trim:true,
        default:""
    },
    audience: {
  name: {
    type: String,
    enum: ["All Employees", "Specific Teams", "Individual Recipients"],
    required: true,
  },

  includeUsers: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    }
  ],

  includeTeams: [
    {
       type: mongoose.Schema.Types.ObjectId,
      ref: "Role",
    }
  ]
},
priority:{
    type:String,
    enum:["Low","Medium","High"],
    default:""
},
channels:[{
    type:String,
    enum:["Dashboard Banner","Email Notification"],
    default:""
}],
scheduledby:{
    type:String,
    trim:true,
    default:""
},
scheduledon:{
    type:Date,
    default:null
},
createdon:{
     type:Date,
    default:null
},
readby:{
    type:Number,
    default:0
},
acknowledged:[{
  userid:{
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  status:{
    type:Boolean,
    default:false,
  }
}]

},{timestamps:true})

export const Announcement = new mongoose.model("Announcement",AnnouncementSchema)