import express from "express";
import authMiddleware from "../auth/auth.js";
import schoolController from "../controllers/school.controller.js"; // default export

const { registerSchool, getAllSchools, loginSchool, updateSchool, getSchoolOwnData } = schoolController;

const router = express.Router();

router.post("/register", registerSchool);
router.get("/all", getAllSchools);
router.post("/login", loginSchool);
router.patch("/update", authMiddleware(["SCHOOL"]), updateSchool);
router.get("/fetch-single", authMiddleware(["SCHOOL"]), getSchoolOwnData);

export default router;
