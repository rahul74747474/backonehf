import mongoose from "mongoose"

const TicketSchema = mongoose.Schema({
   status:{
    type:String,
    enum:["Open","In Progress","Resolved & Closed"]
   },
   category:{
    type:String,
    enum:["Access","Payrole","Hardware","Software","Bug"]
    },
   priority:{
    type:String,
    enum:["High","Low","Medium","Urgent"]
   },
   title:{
     type:String,
    trim:true,
   },
   details:{
    type:String,
    trim:true,
   },
   raisedby:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"User"
   },
   raisedon:{
    type:Date,
    default:null,
   },
   updatedon:{
    type:Date,
    default:null,
   },

   resolvedon:{
    type:Date,
    default:null
   },
   assignedto:{
      type:mongoose.Schema.Types.ObjectId,
      ref:"User"
   },
   comments:[
    {
        text:{
            type:String,
            trim:true,
        },
        by:{
            type:String,
            trim:true,
        },
        date:{
            type:Date,
            default:null
        }
    }
   ],
   attachments:[{
    type:String,
    trim:true,
   }]
},{timestamps:true})

export const Token = new mongoose.model("Token",TicketSchema)