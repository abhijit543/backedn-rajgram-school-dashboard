import mongoose from "mongoose";

const subjectSchema = new mongoose.Schema({
  school: { type: mongoose.Schema.ObjectId, ref: "school" },
  subject_name: { type: String, required: true },
  subject_codename: { type: String, required: true },
  createdAt: { type: Date, default: new Date() },
});
export default mongoose.models.Subject || mongoose.model("Subject", subjectSchema);
