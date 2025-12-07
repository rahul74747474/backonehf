import mongoose from "mongoose"

const RoleSchema = mongoose.Schema({
    rolename:{
        type:String,
        enum:["Manager","Employee","Admin","HR","Intern"]
    },
    description:{
            type:String,
            default:"",
            trim:true
    },
    permissions:[{
            type:String,
            default:""
    }],
    users:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"
    }
},{timestamps:true})