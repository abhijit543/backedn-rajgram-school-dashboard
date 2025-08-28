import Notice from "../models/notice.model.js";

export const getAllNotice = async (req, res) => {
  try {
    const schoolId = req.user.schoolId || req.user.SchoolId;
    const userRole = req.user.role;

    if (!schoolId) {
      return res.status(400).json({ success: false, message: "School ID missing from user data" });
    }

    let audienceFilter = ["Website"];
    if (userRole === "SCHOOL") {
      audienceFilter = ["Website", "Teacher", "Student"];
    } else if (userRole === "TEACHER") {
      audienceFilter.push("Teacher");
    } else if (userRole === "STUDENT") {
      audienceFilter.push("Student");
    }

    const allNotices = await Notice.find({
      school: schoolId,
      audience: { $in: audienceFilter },
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      message: "Successfully fetched all notices",
      data: allNotices,
    });
  } catch (err) {
    console.error("getAllNotice Error =>", err);
    res.status(500).json({ success: false, message: "Server error in fetching notices" });
  }
};

export const createNotice = async (req, res) => {
  try {
    const { title, message, date, audience, url } = req.body;

    if (!title || !message || !date || !audience) {
      return res.status(400).json({ success: false, message: "Title, message, date, and audience are required" });
    }

    const newNotice = new Notice({
      school: req.user.schoolId,
      title,
      message,
      date,
      audience,
      url: url || null,
    });

    await newNotice.save();

    res.status(201).json({
      success: true,
      message: "Successfully created the notice",
      data: newNotice,
    });
  } catch (err) {
    console.error("createNotice Error =>", err);
    res.status(500).json({ success: false, message: "Server error in creating notice" });
  }
};

export const updateNotice = async (req, res) => {
  try {
    const id = req.params.id;
    const { title, message, date, audience } = req.body;

    const updateFields = {};
    if (title) updateFields.title = title;
    if (message) updateFields.message = message;
    if (date) updateFields.date = date;
    if (audience) updateFields.audience = audience;

    const updatedNotice = await Notice.findOneAndUpdate({ _id: id, school: req.user.schoolId }, { $set: updateFields }, { new: true });

    if (!updatedNotice) {
      return res.status(404).json({ success: false, message: "Notice not found" });
    }

    res.status(200).json({
      success: true,
      message: "Successfully updated the notice",
      data: updatedNotice,
    });
  } catch (err) {
    console.error("updateNotice Error =>", err);
    res.status(500).json({ success: false, message: "Server error in updating notice" });
  }
};

export const deleteNotice = async (req, res) => {
  try {
    const id = req.params.id;
    const schoolId = req.user.schoolId;

    const deleted = await Notice.findOneAndDelete({ _id: id, school: schoolId });

    if (!deleted) {
      return res.status(404).json({ success: false, message: "Notice not found or already deleted" });
    }

    res.status(200).json({
      success: true,
      message: "Successfully deleted the notice",
    });
  } catch (err) {
    console.error("deleteNotice Error =>", err);
    res.status(500).json({ success: false, message: "Server error in deleting notice" });
  }
};
