import Class from "../models/class.model.js";
import Student from "../models/student.model.js";
import Schedule from "../models/schedule.model.js";

const classController = {
  getAllClasses: async (req, res) => {
    const schoolId = req.user.schoolId || req.user.SchoolId;

    if (!schoolId) {
      return res.status(400).json({ success: false, message: "School ID missing from user data" });
    }

    try {
      const classes = await Class.find({ school: schoolId });
      return res.status(200).json({ success: true, data: classes });
    } catch (error) {
      return res.status(500).json({ success: false, message: "Error fetching classes", error });
    }
  },

  createClass: async (req, res) => {
    try {
      const newClass = new Class({
        school: req.user.schoolId,
        class_text: req.body.class_text,
        class_num: req.body.class_num,
      });
      await newClass.save();
      res.status(200).json({ success: true, message: "Successfully created the class" });
    } catch (err) {
      res.status(500).json({ success: false, message: "Server error in creating class" });
    }
  },

  updateClass: async (req, res) => {
    try {
      const id = req.params.id;
      await Class.findOneAndUpdate({ _id: id }, { $set: { ...req.body } });
      const classAfterUpdate = await Class.findOne({ _id: id });
      res.status(200).json({ success: true, message: "Successfully updated the class", data: classAfterUpdate });
    } catch (err) {
      console.log("update class Error =>", err);
      res.status(500).json({ success: false, message: "Server error in updating class" });
    }
  },

  deleteClass: async (req, res) => {
    try {
      const id = req.params.id;
      const schoolId = req.user.schoolId;

      const classStudentCount = await Student.countDocuments({ student_class: id, school: schoolId });
      const classScheduleCount = await Schedule.countDocuments({ class: id, school: schoolId });

      if (classStudentCount === 0 && classScheduleCount === 0) {
        await Class.findOneAndDelete({ _id: id, school: schoolId });
        res.status(200).json({ success: true, message: "Successfully deleted the class" });
      } else {
        res.status(400).json({ success: false, message: "This class is already in use" });
      }
    } catch (err) {
      console.log("delete class Error =>", err);
      res.status(500).json({ success: false, message: "Server error in deleting class" });
    }
  },
};

export default classController;
