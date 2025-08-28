import mongoose from "mongoose";

const teacherSchema = new mongoose.Schema(
  {
    school: { type: mongoose.Schema.ObjectId, ref: "School" }, // linked with school
    email: { type: String, required: true },
    name: { type: String, required: true },
    qualification: { type: String, required: true },
    age: { type: Number, required: true },
    gender: { type: String, required: true },
    teacher_image: { type: String, required: true }, // image URL (Cloudinary, etc.)
    teacher_image_id: { type: String },
    password: { type: String, required: true }, // ⚠️ store hashed passwords only
    createAt: { type: Date, default: () => new Date() },
  },
  { collection: "manageteacher" }
);

const Teacher = mongoose.models.Teacher || mongoose.model("Teacher", teacherSchema);

export default Teacher;
