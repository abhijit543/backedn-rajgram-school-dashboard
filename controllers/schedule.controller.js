import mongoose from "mongoose";
import Schedule from "../models/schedule.model.js";
import Teacher from "../models/teacher.model.js";
import Subject from "../models/subject.model.js";
import Class from "../models/class.model.js";
import Student from "../models/student.model.js";

export const getAllSchedules = async (req, res) => {
  console.log("DEBUG req.user =>", req.user);

  try {
    const schoolId = req.user.schoolId || req.user.SchoolId;
    if (!schoolId) return res.status(400).json({ success: false, message: "School ID missing from user data" });

    const allSchedules = await Schedule.find({ school: schoolId }).populate("teacher", "name").populate("subject", "subject_name").populate("class", "class_num class_text");

    res.status(200).json({ success: true, message: "Successfully fetched all schedules", data: allSchedules });
  } catch (err) {
    console.log("Get all schedules error:", err);
    res.status(500).json({ success: false, message: "Server error in fetching schedules" });
  }
};

export const createSchedule = async (req, res) => {
  try {
    const { teacher, subject, classId, start_time, end_time } = req.body;
    const schoolId = req.user.schoolId;
    if (!schoolId) return res.status(400).json({ success: false, message: "School ID missing from user data" });

    if (!mongoose.Types.ObjectId.isValid(teacher)) return res.status(400).json({ success: false, message: "Invalid teacher ID" });
    const teacherDoc = await Teacher.findById(teacher);
    if (!teacherDoc) return res.status(404).json({ success: false, message: "Teacher not found" });

    if (!mongoose.Types.ObjectId.isValid(subject)) return res.status(400).json({ success: false, message: "Invalid subject ID" });
    const subjectDoc = await Subject.findById(subject);
    if (!subjectDoc) return res.status(404).json({ success: false, message: "Subject not found" });

    if (!mongoose.Types.ObjectId.isValid(classId)) return res.status(400).json({ success: false, message: "Invalid class ID" });
    const classDoc = await Class.findById(classId);
    if (!classDoc) return res.status(404).json({ success: false, message: "Class not found" });

    const newSchedule = new Schedule({
      school: schoolId,
      teacher: teacherDoc._id,
      subject: subjectDoc._id,
      class: classDoc._id,
      start_time: new Date(start_time),
      end_time: new Date(end_time),
    });

    await newSchedule.save();
    res.status(200).json({ success: true, message: "Successfully created the schedule" });
  } catch (err) {
    console.error("Error in creating schedule:", err);
    res.status(500).json({ success: false, message: err.message || "Server error in creating schedule" });
  }
};

export const updateSchedule = async (req, res) => {
  try {
    const { teacherId, subjectId, classId, start_time, end_time } = req.body;
    const scheduleId = req.params.id;
    const schoolId = req.user.schoolId || req.user.SchoolId;
    if (!schoolId) return res.status(400).json({ success: false, message: "School ID missing from user data" });

    const schedule = await Schedule.findById(scheduleId);
    if (!schedule) return res.status(404).json({ success: false, message: "Schedule not found" });

    if (req.user.role === "TEACHER") {
      const teacherIdFromSchedule = schedule.teacher._id ? schedule.teacher._id.toString() : schedule.teacher.toString();
      if (teacherIdFromSchedule !== req.user.id) return res.status(403).json({ success: false, message: "Not authorized" });
    }

    if (teacherId) {
      const teacher = await Teacher.findById(teacherId);
      if (!teacher) return res.status(404).json({ success: false, message: "Teacher not found" });
      schedule.teacher = teacherId;
    }
    if (subjectId) {
      const subject = await Subject.findById(subjectId);
      if (!subject) return res.status(404).json({ success: false, message: "Subject not found" });
      schedule.subject = subjectId;
    }
    if (classId) schedule.class = classId;
    if (start_time) schedule.start_time = new Date(start_time);
    if (end_time) schedule.end_time = new Date(end_time);

    await schedule.save();
    res.status(200).json({ success: true, message: "Successfully updated the schedule", data: schedule });
  } catch (err) {
    console.log("Update schedule error:", err);
    res.status(500).json({ success: false, message: "Server error in updating schedule" });
  }
};

export const deleteSchedule = async (req, res) => {
  try {
    const scheduleId = req.params.id;
    const schoolId = req.user.schoolId;
    if (!schoolId) return res.status(400).json({ success: false, message: "School ID missing from user data" });

    const schedule = await Schedule.findById(scheduleId);
    if (!schedule) return res.status(404).json({ success: false, message: "Schedule not found" });

    await Schedule.findByIdAndDelete(scheduleId);
    res.status(200).json({ success: true, message: "Schedule deleted successfully" });
  } catch (err) {
    console.log("Delete schedule error:", err);
    res.status(500).json({ success: false, message: "Server error in deleting schedule" });
  }
};

export const getSchedulesForStudent = async (req, res) => {
  try {
    const student = await Student.findById(req.user.id);
    if (!student || !student.student_class || !student.school) return res.status(400).json({ success: false, message: "Student's class or school not found" });

    const classDoc = await Class.findOne({ class_num: student.student_class });
    if (!classDoc) return res.status(404).json({ success: false, message: "Class not found in database" });

    const schedules = await Schedule.find({ class: classDoc._id, school: student.school }).populate("teacher", "name").populate("subject", "subject_name").populate("class", "class_num class_text");

    res.status(200).json({ success: true, data: schedules });
  } catch (err) {
    console.error("Error:", err);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};
