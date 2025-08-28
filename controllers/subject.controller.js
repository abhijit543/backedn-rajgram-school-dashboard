import Subject from "../models/subject.model.js";
import Schedule from "../models/schedule.model.js";

export const getAllSubject = async (req, res) => {
  try {
    const schoolId = req.user.schoolId || req.user.SchoolId;

    if (!schoolId) {
      return res.status(400).json({ success: false, message: "School ID missing from user data" });
    }

    const allSubject = await Subject.find({ school: schoolId });

    res.status(200).json({
      success: true,
      message: "Successfully fetched all subjects",
      data: allSubject,
    });
  } catch (err) {
    console.log("getAllSubject Error =>", err);
    res.status(500).json({ success: false, message: "Server error in fetching subjects" });
  }
};

export const createSubject = async (req, res) => {
  try {
    const newSubject = new Subject({
      school: req.user.schoolId,
      subject_name: req.body.subject_name,
      subject_codename: req.body.subject_codename,
    });

    await newSubject.save();

    res.status(200).json({ success: true, message: "Successfully created the subject" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message || "Server error in creating subject" });
  }
};

export const updateSubject = async (req, res) => {
  try {
    const id = req.params.id;
    await Subject.findOneAndUpdate({ _id: id }, { $set: { ...req.body } });
    const subjectAfterUpdate = await Subject.findOne({ _id: id });
    res.status(200).json({ success: true, message: "Successfully updated the subject", data: subjectAfterUpdate });
  } catch (err) {
    console.log("updateSubject Error =>", err);
    res.status(500).json({ success: false, message: "Server error in updating subject" });
  }
};

export const deleteSubject = async (req, res) => {
  try {
    const id = req.params.id;
    const schoolId = req.user.schoolId;

    const subjectScheduleCount = (await Schedule.find({ subject: id, school: schoolId })).length;
    if (subjectScheduleCount === 0) {
      await Subject.findOneAndDelete({ _id: id, school: schoolId });
      res.status(200).json({
        success: true,
        message: "Successfully deleted the subject",
      });
    } else {
      res.status(500).json({ success: false, message: "This subject is already in use" });
    }
  } catch (err) {
    console.log("deleteSubject Error =>", err);
    res.status(500).json({ success: false, message: "Server error in deleting subject" });
  }
};
