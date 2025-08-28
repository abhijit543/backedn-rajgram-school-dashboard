import express from "express";
import authMiddleware from "../auth/auth.js";
import { registerStudent, getStudentsWithQuery, loginStudent, updateStudent, getStudentOwnData, fetchStudentWithId, deleteStudentWithID } from "../controllers/student.controller.js";

const router = express.Router();

router.post("/register", authMiddleware(["SCHOOL"]), registerStudent);

router.get("/all", authMiddleware(["SCHOOL"]), getStudentsWithQuery);
router.post("/login", loginStudent);
router.patch("/update/:id", authMiddleware(["SCHOOL"]), updateStudent);

router.get("/fetch-single", authMiddleware(["STUDENT"]), getStudentOwnData);
router.get("/fetch/:id", authMiddleware(["SCHOOL"]), fetchStudentWithId);
router.delete("/delete/:id", authMiddleware(["SCHOOL"]), deleteStudentWithID);

export default router;
