import express from "express";
import authMiddleware from "../auth/auth.js";
import { registerTeacher, loginTeacher, getTeachersWithQuery, getTeacherOwnData, fetchTeacherWithId, updateTeacher, deleteTeacherWithID } from "../controllers/teacher.controller.js";

const router = express.Router();

router.post("/register", authMiddleware(["SCHOOL"]), registerTeacher);

router.get("/all", authMiddleware(["SCHOOL"]), getTeachersWithQuery);
router.post("/login", loginTeacher);
router.patch("/update/:id", authMiddleware(["SCHOOL"]), updateTeacher);

router.get("/fetch-single", authMiddleware(["TEACHER"]), getTeacherOwnData);
router.get("/fetch/:id", authMiddleware(["SCHOOL"]), fetchTeacherWithId);
router.delete("/delete/:id", authMiddleware(["SCHOOL"]), deleteTeacherWithID);

export default router;
