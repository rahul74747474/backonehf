import mongoose from "mongoose"

const RoleSchema = mongoose.Schema({
    rolename:{
        type:String,
        trim:true,
    },
    details:{
            type:String,
            default:"",
            trim:true
    },
    permissions:[{
            type:String,
            default:""
    }],
    users:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"
    }],
    permissionupdation:[{
        updatedby:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"User"
        },
        updatedon:{
            type:Date,
            default:null
        }
    }]
},{timestamps:true})

export const Role = new mongoose.model("Role",RoleSchema)