import mongoose from "mongoose"

const ScoreSchema = mongoose.Schema({
    userId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "User", 
        required: true 
    },
    period: { 
        type: String, 
        enum: ["daily", "weekly", "monthly"], 
        required: true 
    },

    scores: {
    tasks: { 
        type: Number, 
        default: 0 
    },     
    reports: { 
        type: Number, 
        default: 0 
    },       
    attendance: { 
        type: Number, 
        default: 0 
    },    
    peer: { 
        type: Number, 
        default: 0 
    },       
    manager: { 
        type: Number, 
        default: 0 
    },  
    hr: { 
        type: Number, 
        default: 0 
    },            
  },

  totalScore: { 
    type: Number, 
    default: 0 
},
date:{
  type:Date,
},

  createdAt: { 
    type: Date, 
    default: Date.now 
}
},{timestamps:true})

export const PerformanceScore = new mongoose.model("PerformanceScore",ScoreSchema)