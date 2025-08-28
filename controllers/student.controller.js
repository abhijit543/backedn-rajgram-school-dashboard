import "dotenv/config";
import formidable from "formidable";
import bcrypt from "bcrypt";

import jwt from "jsonwebtoken";
import Student from "../models/student.model.js";
import cloudinary from "../utils/cloudinary.js";

export const registerStudent = async (req, res) => {
  try {
    const form = formidable({
      multiples: true,
      keepExtensions: true,
    });

    form.parse(req, async (err, fields, files) => {
      if (err) {
        console.error("❌ Form parse error:", err);
        return res.status(400).json({ error: "Form parsing failed." });
      }

      if (!fields.name || !fields.email || !fields.guardian || !fields.password) {
        return res.status(400).json({ error: "Missing required fields." });
      }

      const email = fields.email[0];
      const existingStudent = await Student.findOne({ email });
      if (existingStudent) {
        return res.status(409).json({ error: "Email is already registered" });
      }

      let studentImageUrl = null;
      let studentImageId = null;

      if (files.student_image) {
        const photo = Array.isArray(files.student_image) ? files.student_image[0] : files.student_image;

        try {
          const result = await cloudinary.uploader.upload(photo.filepath, {
            folder: "students",
            public_id: photo.originalFilename.replace(/\s+/g, "_"),
          });
          studentImageUrl = result.secure_url;
          studentImageId = result.public_id;
        } catch (err) {
          console.error("❌ Cloudinary upload error:", err);
          return res.status(500).json({ error: "Failed to upload image." });
        }
      } else {
        return res.status(400).json({ error: "Student image is required" });
      }

      const salt = await bcrypt.genSalt(10);
      const hashPassword = await bcrypt.hash(fields.password[0], salt);

      const newStudent = new Student({
        school: req.user.schoolId,
        email,
        name: fields.name[0],
        student_class: fields.student_class?.[0] || "",
        age: fields.age?.[0] || "",
        gender: fields.gender?.[0] || "",
        guardian: fields.guardian[0],
        guardian_phone: fields.guardian_phone?.[0] || "",
        student_image: studentImageUrl,
        student_image_id: studentImageId,
        password: hashPassword,
      });

      const savedStudent = await newStudent.save();

      res.status(201).json({
        message: "Student registered successfully.",
        data: savedStudent,
        success: true,
      });
    });
  } catch (e) {
    console.error("❌ Server error:", e);
    res.status(500).json({ error: "Server error." });
  }
};

export const loginStudent = async (req, res) => {
  try {
    const student = await Student.findOne({ email: req.body.email });
    if (!student) return res.status(401).json({ success: false, message: "Email is not registered" });

    const isAuth = await bcrypt.compare(req.body.password, student.password);
    if (!isAuth) return res.status(401).json({ success: false, message: "Password is incorrect" });

    const token = jwt.sign(
      {
        id: student._id,
        SchoolId: student.school,
        Student_name: student.name,
        image_url: student.student_image,
        role: "STUDENT",
      },
      process.env.JWT_SECRET
    );

    res
      .header("Authorization", token)
      .status(200)
      .json({
        success: true,
        message: "Logged in Successfully",
        user: {
          id: student._id,
          SchoolId: student.school,
          Student_name: student.name,
          image_url: student.student_image,
          role: "STUDENT",
        },
      });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal Server Error [Student Login]" });
  }
};

export const getStudentsWithQuery = async (req, res) => {
  try {
    const filterQuery = { school: req.user.schoolId };

    if (req.query.search) filterQuery.name = { $regex: req.query.search, $options: "i" };
    if (req.query.student_class) filterQuery.student_class = req.query.student_class;

    const students = await Student.find(filterQuery).select("-password");
    res.status(200).json({
      success: true,
      message: "Success in fetching all the students",
      students,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal Server Error [All Student Data]" });
  }
};

export const getStudentOwnData = async (req, res) => {
  try {
    const student = await Student.findOne({ _id: req.user.id, school: req.user.SchoolId }).select("-password");
    if (!student) return res.status(404).json({ success: false, message: "Student not found" });

    res.status(200).json({ success: true, student });
  } catch (err) {
    res.status(500).json({ success: false, message: "Internal Server Error [Own Student Data]" });
  }
};

export const fetchStudentWithId = async (req, res) => {
  try {
    const student = await Student.findOne({ _id: req.params.id, school: req.user.schoolId }).select("-password");
    if (!student) return res.status(404).json({ success: false, message: "Student not found" });

    res.status(200).json({ success: true, student });
  } catch (err) {
    res.status(500).json({ success: false, message: "Internal Server Error [Fetch by ID]" });
  }
};

export const updateStudent = async (req, res) => {
  try {
    const { id } = req.params;

    let student = await Student.findById(id);
    if (!student) {
      return res.status(404).json({ success: false, message: "Student not found" });
    }

    // ✅ Only update text fields (ignore image updates)
    const { name, email, student_class, age, gender, guardian, guardian_phone } = req.body;

    student.name = name || student.name;
    student.email = email || student.email;
    student.student_class = student_class || student.student_class;
    student.age = age || student.age;
    student.gender = gender || student.gender;
    student.guardian = guardian || student.guardian;
    student.guardian_phone = guardian_phone || student.guardian_phone;

    await student.save();

    return res.status(200).json({
      success: true,
      message: "Student updated successfully",
      student,
    });
  } catch (error) {
    console.error("Update error:", error);
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

export const deleteStudentWithID = async (req, res) => {
  try {
    const { id } = req.params;
    const schoolId = req.user.schoolId;

    const student = await Student.findOne({ _id: id, school: schoolId });
    if (!student) return res.status(404).json({ success: false, message: "Student not found." });

    if (student.student_image_id) {
      try {
        await cloudinary.uploader.destroy(student.student_image_id);
      } catch (_) {
        console.warn("Failed to delete Cloudinary image:", student.student_image_id);
      }
    }

    await Student.deleteOne({ _id: id });
    res.status(200).json({ success: true, message: "Student deleted successfully." });
  } catch (e) {
    res.status(500).json({ success: false, message: "Internal server error." });
  }
};
