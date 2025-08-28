import dotenv from "dotenv";
dotenv.config();

import formidable from "formidable";
import bcrypt from "bcrypt";

import jwt from "jsonwebtoken";
import School from "../models/school.model.js";
import cloudinary from "../utils/cloudinary.js";

export default {
  registerSchool: async (req, res) => {
    try {
      const form = formidable({ keepExtensions: true });

      form.parse(req, async (err, fields, files) => {
        if (err) {
          console.error("Form parsing error:", err);
          return res.status(400).json({ error: "Form parsing failed." });
        }

        // Validate required fields
        if (!fields.school_name || !fields.email || !fields.owner_name || !fields.password) {
          return res.status(400).json({ error: "Missing required fields." });
        }

        const email = Array.isArray(fields.email) ? fields.email[0] : fields.email;
        const existingSchool = await School.findOne({ email });
        if (existingSchool) {
          return res.status(409).json({ error: "Email is already registered" });
        }

        let schoolImageUrl = null;

        if (files.image) {
          // Formidable v3+ returns object, not array
          const photo = Array.isArray(files.image) ? files.image[0] : files.image;

          if (!photo.filepath) {
            return res.status(400).json({ error: "Image file is missing" });
          }

          try {
            const result = await cloudinary.uploader.upload(photo.filepath, {
              folder: "schools",
              public_id: photo.originalFilename.replace(/\s+/g, "_"),
            });
            schoolImageUrl = result.secure_url;
          } catch (cloudErr) {
            console.error("Cloudinary upload error:", cloudErr);
            return res.status(500).json({ error: "Image upload failed." });
          }
        }

        const passwordValue = Array.isArray(fields.password) ? fields.password[0] : fields.password;
        const salt = await bcrypt.genSalt(10);
        const hashPassword = await bcrypt.hash(passwordValue, salt);

        // Create the school
        const newSchool = new School({
          school_name: Array.isArray(fields.school_name) ? fields.school_name[0] : fields.school_name,
          email,
          owner_name: Array.isArray(fields.owner_name) ? fields.owner_name[0] : fields.owner_name,
          school_image: schoolImageUrl,
          password: hashPassword,
        });

        const savedSchool = await newSchool.save();

        return res.status(201).json({
          message: "School registered successfully.",
          data: savedSchool,
          success: true,
        });
      });
    } catch (e) {
      console.error("Unexpected error:", e);
      return res.status(500).json({ error: "Server error." });
    }
  },

  loginSchool: async (req, res) => {
    try {
      const school = await School.findOne({ email: req.body.email });
      if (school) {
        const isAuth = bcrypt.compareSync(req.body.password, school.password);
        if (isAuth) {
          const jwtSecret = process.env.JWT_SECRET;
          const token = jwt.sign(
            {
              id: school._id,
              schoolId: school._id,
              owner_name: school.owner_name,
              school_name: school.school_name,
              image_url: school.school_image, // assuming you save it here
              role: "SCHOOL",
            },
            jwtSecret
          );
          res.header("Authorization", token);
          res.status(200).json({
            success: true,
            message: "Logged in Successfully",

            user: {
              id: school._id,
              owner_name: school.owner_name,
              school_name: school.school_name,
              image_url: school.school_image,
              role: "SCHOOL",
            },
          });
        } else {
          res.status(401).json({ success: false, message: "Password is incorrect" });
        }
      } else {
        res.status(401).json({ success: false, message: "email is not Registered" });
      }
    } catch (error) {
      res.status(500).json({ success: false, message: "Internal Server Error[School Login]" });
    }
  },
  getAllSchools: async (req, res) => {
    try {
      const schools = await School.find().select(["-password", "-_id", "-email", "-owner_name", "-createAt"]);
      res.status(200).json({ success: true, message: "Success in fetching all the schools", schools });
    } catch (error) {
      res.status(500).json({ success: false, message: "Internal Server Error[All School Data]" });
    }
  },
  getSchoolOwnData: async (req, res) => {
    try {
      const id = req.user.id;
      const school = await School.findOne({ _id: id }).select("-password");
      if (school) {
        res.status(200).json({ success: true, school });
      } else {
        res.status(404).json({ success: false, message: "School Not Found" });
      }
    } catch (err) {
      console.error("Error in getSchoolOwnData:", err.message);
      res.status(500).json({ success: false, message: "Internal Server Error[Own School Data]" });
    }
  },

  updateSchool: async (req, res) => {
    try {
      const id = req.user.id;
      const form = formidable({ keepExtensions: true });

      form.parse(req, async (err, fields, files) => {
        if (err) {
          console.error("Form parsing error:", err);
          return res.status(400).json({ success: false, message: "Form parsing failed." });
        }

        const school = await School.findOne({ _id: id });
        if (!school) {
          return res.status(404).json({ success: false, message: "School not found" });
        }

        // ✅ Update text fields
        Object.keys(fields).forEach((field) => {
          school[field] = Array.isArray(fields[field]) ? fields[field][0] : fields[field];
        });

        // ✅ Handle image replacement
        if (files.image) {
          const photo = Array.isArray(files.image) ? files.image[0] : files.image;

          if (!photo.filepath) {
            return res.status(400).json({ error: "Image file is missing" });
          }

          try {
            // Delete old image if exists
            if (school.school_image_id) {
              await cloudinary.uploader.destroy(school.school_image_id);
            }

            // Upload new one
            const result = await cloudinary.uploader.upload(photo.filepath, {
              folder: "schools",
              public_id: photo.originalFilename.replace(/\s+/g, "_"),
            });

            // Save both URL & public_id
            school.school_image = result.secure_url;
            school.school_image_id = result.public_id;
          } catch (cloudErr) {
            console.error("Cloudinary upload error:", cloudErr);
            return res.status(500).json({ error: "Failed to upload image." });
          }
        }

        await school.save();
        res.status(200).json({ success: true, message: "School updated successfully", school });
      });
    } catch (e) {
      console.error("Unexpected error:", e);
      res.status(500).json({ error: "Server error." });
    }
  },
};
