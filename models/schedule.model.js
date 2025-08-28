import mongoose from "mongoose";

const scheduleSchema = new mongoose.Schema(
  {
    school: { type: mongoose.Schema.ObjectId, ref: "School" },
    teacher: { type: mongoose.Schema.ObjectId, ref: "Teacher" },
    subject: { type: mongoose.Schema.ObjectId, ref: "Subject" },
    class: { type: mongoose.Schema.ObjectId, ref: "Class" },
    start_time: { type: Date, required: true },
    end_time: { type: Date, required: true },
    createdAt: { type: Date, default: new Date() },
  },
  { timestamps: true }
);
export default mongoose.model("Schedule", scheduleSchema);
