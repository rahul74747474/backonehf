import mongoose from "mongoose"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"

const UserSchema = new mongoose.Schema({
    name:{
        type:String,
        trim:true,
        required:true,
    },
    empid:{
      type:String,
      unique:true,
    },
    roleid:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Role",
        default:null
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
    dob:{
        type:Date,
        default:""
    },
    gender:{
        type:String,
        default:""
    },

    phone:{
        type:String,
        unique:true,
        sparse:true
    },
    salary:{
        amount:{
           type:Number,
        default:0,
        },
        paymentstatus:{
            type:String,
            enum:["Completed","Pending","In Progess"]
        }
       
    },
    designation:{
        name:{ 
        type:String,
        enum:["Manager","HR","Intern","Admin","Employee"],
        default:"Employee"
        },
        Managerid:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"Manager",

        },
        Hrid:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"HR",
            
        }
    },
    role:{
        type:String,
        enum:["Frontend Developer","Backend Developer","Full Stack Developer","QA","UI/UX Designer","Devops"],
        default:null
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
scores:{
   type: mongoose.Schema.Types.ObjectId,
   ref:"PerformanceScore",
},
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
        trim:true,
        sparse:true
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
        sparse:true   // FIXED
    },
    snapshot:{
        type:String,
        default:""
    }
},
ticketsraised:[{
    type:mongoose.Schema.Types.ObjectId,
    ref:"Ticket"
}],
documents:{
    aadhar:{
        type:String,
        default:""
    },
    pan:{
         type:String,
         default:""
    }
},
bankdetails:{
    accountno:{
        type:Number,
        default:""
    },
    ifsc:{
        type:String,
        default:""
    },
},
notifications:[{
    title:{
        type:String,
        default:""
    },
    details:{
        type:String,
        default:""
    },
    createdAt:{
        type:Date,
        default:null
    },
    activities:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Recent",
    }
}],
recentActivity:[{
  name:{
      type:String,
      default:"",
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
    time:{
        type:Date,
        default:""
    }
}],

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
      _id:this._id,
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