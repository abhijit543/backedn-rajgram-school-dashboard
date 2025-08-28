import mongoose from "mongoose";

const studentSchema = new mongoose.Schema({
  school: { type: mongoose.Schema.ObjectId, ref: "School" }, // model name should match exactly
  email: { type: String, required: true },
  name: { type: String, required: true },
  student_class: { type: String, required: true },
  age: { type: String, required: true },
  gender: { type: String, required: true },
  guardian: { type: String, required: true },
  guardian_phone: { type: String, required: true },
  student_image: { type: String, required: true }, // secure_url
  student_image_id: { type: String, required: true }, // 🔹 store Cloudinary public_id
  password: { type: String, required: true },
  createdAt: { type: Date, default: () => new Date() },
});

export default mongoose.model("Student", studentSchema);
