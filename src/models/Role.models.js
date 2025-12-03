import mongoose from "mongoose"

const RoleSchema = mongoose.Schema({
    rolename:{
        type:String,
        enum:["Manager","Employee","Admin","HR","Intern"]
    },
    permissions:[{
        type:{
            type:String,
            default:""
        },
        description:{
            type:String,
            default:"",
            trim:true
        },
        permissionname:{
            type:String,
            default:""
        }
    }]
},{timestamps:true})