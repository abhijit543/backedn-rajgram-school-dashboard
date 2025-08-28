import mongoose from "mongoose";

const noticeSchema = new mongoose.Schema({
  school: { type: mongoose.Schema.ObjectId, ref: "School" },
  title: { type: String, required: true },
  message: { type: String, required: true },
  date: { type: Date, required: true }, // user-selected date
  createdAt: { type: Date, default: Date.now }, // system-generated
  audience: {
    type: [String],
    enum: ["Website", "Teacher", "Student"],
    required: true,
  },
  url: { type: String, default: null },
});

const Notice = mongoose.models.Notice || mongoose.model("Notice", noticeSchema);

export default Notice;
