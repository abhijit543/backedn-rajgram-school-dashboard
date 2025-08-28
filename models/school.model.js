import mongoose from "mongoose";

const schoolSchema = new mongoose.Schema({
  school_name: { type: String, required: true },
  email: { type: String, required: true },
  owner_name: { type: String, required: true },
  school_image: { type: String, required: true }, // image URL
  school_image_id: { type: String }, // Cloudinary public_id
  password: { type: String, required: true },
  createAt: { type: Date, default: () => new Date() },
});

const School = mongoose.model("School", schoolSchema);
export default School;
