import express from "express";
import authMiddleware from "../auth/auth.js";
import { getAllSubject, createSubject, updateSubject, deleteSubject } from "../controllers/subject.controller.js";

const router = express.Router();

router.post("/create", authMiddleware(["SCHOOL"]), createSubject);
router.get("/all", authMiddleware(["SCHOOL", "TEACHER"]), getAllSubject);
router.patch("/update/:id", authMiddleware(["SCHOOL"]), updateSubject);
router.delete("/delete/:id", authMiddleware(["SCHOOL"]), deleteSubject);

export default router;
