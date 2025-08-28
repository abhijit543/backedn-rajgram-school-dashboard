import express from "express";
import authMiddleware from "../auth/auth.js";
import { getAllNotice, createNotice, updateNotice, deleteNotice } from "../controllers/notice.controller.js";

const router = express.Router();

router.post("/create", authMiddleware(["SCHOOL"]), createNotice);
router.get("/all", authMiddleware(["SCHOOL", "TEACHER", "STUDENT"]), getAllNotice);
router.patch("/update/:id", authMiddleware(["SCHOOL"]), updateNotice);
router.delete("/delete/:id", authMiddleware(["SCHOOL"]), deleteNotice);

export default router;
