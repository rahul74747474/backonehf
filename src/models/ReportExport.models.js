import mongoose from "mongoose";

const reportExportSchema = new mongoose.Schema(
  {
    // kis type ka report
    type: {
      type: String,
      enum: [
        "tasks",
        "metrics",
        "performance",
        "employees",
        "redflags"
      ],
      required: true
    },

    // date range
    from: {
      type: Date,
      required: true
    },
    to: {
      type: Date,
      required: true
    },

    // export format
    format: {
      type: String,
      enum: ["excel", "pdf"],
      required: true
    },

    // optional toggles (UI se aane wale)
    options: {
      includeRawTasks: { type: Boolean, default: false },
      summaryOnly: { type: Boolean, default: false },
      employeeBreakdown: { type: Boolean, default: false },
      includeCharts: { type: Boolean, default: false }
    },

    // processing state
    status: {
      type: String,
      enum: ["processing", "ready", "failed"],
      default: "processing"
    },

    // generated file url
    fileUrl: {
      type: String
    },

    // error info (agar fail ho)
    error: {
      type: String
    },

    // kisne export kiya
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default:null,
    }
  },
  {
    timestamps: true
  }
);

export const ReportExport = mongoose.model(
  "ReportExport",
  reportExportSchema
);
