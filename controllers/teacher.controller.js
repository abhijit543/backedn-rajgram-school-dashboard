import "dotenv/config.js";
import formidable from "formidable";
import bcrypt from "bcrypt";

import jwt from "jsonwebtoken";
import Teacher from "../models/teacher.model.js";
import cloudinary from "../utils/cloudinary.js";

export const registerTeacher = async (req, res) => {
  try {
    const form = formidable({ multiples: true, keepExtensions: true });

    form.parse(req, async (err, fields, files) => {
      if (err) return res.status(400).json({ error: "Form parsing failed." });

      if (!fields.name || !fields.email || !fields.qualification || !fields.password) {
        return res.status(400).json({ error: "Missing required fields." });
      }

      const email = fields.email[0];
      const existingTeacher = await Teacher.findOne({ email });
      if (existingTeacher) {
        return res.status(409).json({ error: "Email is already registered" });
      }

      let teacherImageUrl = null;
      let teacherImageId = null;

      if (files.teacher_image && files.teacher_image[0]) {
        const photo = files.teacher_image[0];
        try {
          const uploadRes = await cloudinary.uploader.upload(photo.filepath, {
            folder: "teachers",
          });
          teacherImageUrl = uploadRes.secure_url;
          teacherImageId = uploadRes.public_id;
        } catch (fileError) {
          console.error("Cloudinary upload error:", fileError);
          return res.status(500).json({ error: "Failed to upload image to Cloudinary." });
        }
      }

      const salt = await bcrypt.genSalt(10);
      const hashPassword = await bcrypt.hash(fields.password[0], salt);

      const newTeacher = new Teacher({
        school: req.user?.schoolId, // ✅ make sure req.user exists
        email: fields.email[0],
        name: fields.name[0],
        qualification: fields.qualification[0],
        age: fields.age?.[0] || "",
        gender: fields.gender?.[0] || "",
        teacher_image: teacherImageUrl,
        teacher_image_id: teacherImageId,
        password: hashPassword,
      });

      const savedTeacher = await newTeacher.save();

      res.status(201).json({
        message: "Teacher registered successfully.",
        data: savedTeacher,
        success: true,
      });
    });
  } catch (e) {
    console.error("RegisterTeacher error:", e);
    res.status(500).json({ error: "Server error." });
  }
};

export const loginTeacher = async (req, res) => {
  try {
    const teacher = await Teacher.findOne({ email: req.body.email });
    if (teacher) {
      const isAuth = await bcrypt.compare(req.body.password, teacher.password);
      if (isAuth) {
        const token = jwt.sign(
          {
            id: teacher._id,
            SchoolId: teacher.school,
            Teacher_name: teacher.name,
            image_url: teacher.teacher_image,
            role: "TEACHER",
          },
          process.env.JWT_SECRET
        );
        res.header("Authorization", token);
        return res.status(200).json({
          success: true,
          message: "Logged in Successfully",
          user: {
            id: teacher._id,
            SchoolId: teacher.school,
            Teacher_name: teacher.name,
            image_url: teacher.teacher_image,
            role: "TEACHER",
          },
        });
      } else {
        return res.status(401).json({ success: false, message: "Password is incorrect" });
      }
    } else {
      return res.status(401).json({ success: false, message: "Email is not registered" });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal Server Error [Teacher Login]" });
  }
};

export const getTeachersWithQuery = async (req, res) => {
  try {
    const filterQuery = { school: req.user.schoolId };

    if (req.query.search) {
      filterQuery["name"] = { $regex: req.query.search, $options: "i" };
    }

    const teachers = await Teacher.find(filterQuery).select("-password");
    res.status(200).json({
      success: true,
      message: "Success in fetching all the teachers",
      teachers,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal Server Error [All Teacher Data]" });
  }
};

export const getTeacherOwnData = async (req, res) => {
  try {
    const teacher = await Teacher.findOne({
      _id: req.user.id,
      school: req.user.SchoolId,
    }).select("-password");

    if (teacher) {
      res.status(200).json({ success: true, teacher });
    } else {
      res.status(404).json({ success: false, message: "Teacher not found" });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: "Internal Server Error [Own Teacher Data]" });
  }
};
export const fetchTeacherWithId = async (req, res) => {
  try {
    const teacher = await Teacher.findOne({ _id: req.params.id, school: req.user.schoolId }).select("-password");
    if (teacher) {
      res.status(200).json({ success: true, teacher });
    } else {
      res.status(404).json({ success: false, message: "Teacher not found" });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: "Internal Server Error [Fetch by ID]" });
  }
};

export const updateTeacher = async (req, res) => {
  try {
    const id = req.params.id;
    const form = formidable({ multiples: true, keepExtensions: true });

    form.parse(req, async (err, fields, files) => {
      if (err) return res.status(400).json({ success: false, message: "Form parsing failed." });

      const teacher = await Teacher.findById(id);
      if (!teacher) return res.status(404).json({ success: false, message: "Teacher not found." });

      const updatableFields = ["name", "email", "age", "qualification", "gender", "password"];

      updatableFields.forEach((field) => {
        if (fields[field]) teacher[field] = fields[field][0];
      });

      if (fields.password && fields.password[0]) {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(fields.password[0], salt);
        teacher.password = hashedPassword;
      }

      if (files.image && files.image[0]) {
        try {
          // delete old image from cloudinary
          if (teacher.teacher_image_id) {
            await cloudinary.uploader.destroy(teacher.teacher_image_id);
          }

          const photo = files.image[0];
          const uploadRes = await cloudinary.uploader.upload(photo.filepath, {
            folder: "teachers",
          });

          teacher.teacher_image = uploadRes.secure_url;
          teacher.teacher_image_id = uploadRes.public_id;
        } catch (fileError) {
          return res.status(500).json({ success: false, message: "Failed to upload image." });
        }
      }

      await teacher.save();
      res.status(200).json({ success: true, message: "Teacher updated successfully", teacher });
    });
  } catch (e) {
    res.status(500).json({ success: false, message: "Internal server error." });
  }
};

export const deleteTeacherWithID = async (req, res) => {
  try {
    const { id } = req.params;
    const schoolId = req.user.schoolId;

    const teacher = await Teacher.findOne({ _id: id, school: schoolId });
    if (!teacher) return res.status(404).json({ success: false, message: "Teacher not found." });

    // ✅ Delete image from cloudinary
    if (teacher.teacher_image_id) {
      try {
        await cloudinary.uploader.destroy(teacher.teacher_image_id);
      } catch (_) {}
    }

    await Teacher.deleteOne({ _id: id });
    res.status(200).json({ success: true, message: "Teacher deleted successfully." });
  } catch (e) {
    res.status(500).json({ success: false, message: "Internal server error." });
  }
};
