import mongoose from "mongoose"

const MetricsSchema = mongoose.Schema({
     date: {
    type: Date, 
    required: true,
    unique: true
  },

  tasksCompleted: {
    type: Number,
    default: 0
  },

  reportsSubmitted: {
    type: Number,
    default: 0
  },

  activeUsers: {
    type: Number,
    default: 0
  },

  createdAt: {
    type: Date,
    default: Date.now
  }
},{timestamps:true})

export const Metrics = new mongoose.model("Metrics",MetricsSchema)

const RedFlagSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

  type: {
    type: [String],
    default: []
  },

  severity: {
    type: String,
    enum: ["low", "medium", "high"],
    default: "low"
  },

  reason: {
    type: [String], 
    default: []
  },

  date: Date,
});

export const RedFlag = mongoose.model("RedFlag", RedFlagSchema);

const SLASchema = new mongoose.Schema({
  date: Date,
  onTime: Number,
  overdue: Number,
  slaPercentage: Number,
  type:String
});
export const SLA = mongoose.model("SLA", SLASchema);

