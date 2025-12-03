import mongoose from "mongoose"

const ScoreSchema = mongoose.Schema({},{timestamps:true})

export const PerformanceScore = new mongoose.model("PerformanceScore",ScoreSchema)