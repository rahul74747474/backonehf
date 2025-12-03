import mongoose from "mongoose"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"

const UserSchema = new mongoose.Schema({
    name:{
        type:String,
        trim:true,
        required:true,
    },
    email:{
        type:String,
        required:true,
        lowercase:true,
        unique:true,
        trim:true
    },
    password:{
        type:String,
        required:true,
    },
    phone:{
        type:String,
        default:"",
        unique:true,
    },
    stipend:{
        type:Number,
        default:0,
    },
    designation:{
        type:String,
        enum:["Manager","HR","Intern","Admin","Employee"],
        default:"Employee"
    },
    role:{
        type:String,
        required:true,
    },
    status:{
        type:String,
        enum:["Onboarding","Active & Paid" , "Active & Unpaid" ,"Inactive"],
        default:"Onboarding"
    },
    Projects:[
        {
        type:mongoose.Schema.Types.ObjectId,
        ref:"Project",
        }
    ],
    Tasks:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Tasks"
    }],
    dailyreports:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Report"
    }],

    managerAssigned:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"
    },
    onboarding: {
    status: {
        type: String,
        enum: ["Completed", "Incomplete", "In Progress"],
        default: "Incomplete"
    },
    startedAt: {
        type: Date,
        default: null
    },
    completedAt: {
        type: Date,
        default: null
    }
},
// scores:{
//    type: mongoose.Schema.Types.ObjectId,
//    ref:"PerformanceScore",
// },
lastActiveAt:{
    type:Date,
    default:null
},
profilepicture:{
    type:String,
    default:"",
},
Telegram:{
    id:{
    type:String,
    unique:true,
    trim:true
    },
    snapshot:{
        type:String,
        default:""
    }
},
topTracker:{
    id:{
    type:String,
    unique:true,
    trim:true,
    default:""
    },
    snapshot:{
        type:String,
        default:""
    }
},
deleted:{
  type:Boolean,
  default:false
}

},{timestamps:true})

UserSchema.pre("save",async function(){
    if(!this.isModified("password"))return null;
    this.password = await bcrypt.hash(this.password,10)
})

UserSchema.methods.isPasswordCorrect = async function(password){
    if(!password)return null
    return bcrypt.compare(password,this.password)
}

UserSchema.methods.Token = function(){
    return jwt.sign({
      id:this._id,
      name:this.name,
      email:this.email
    },
    process.env.JWT_TOKEN ,
    {
        expiresIn:process.env.JWT_TOKEN_EXPIRY
    }
)
}
export const User = mongoose.model("User",UserSchema)