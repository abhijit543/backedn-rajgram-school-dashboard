import express from "express";
import authMiddleware from "../auth/auth.js";
import classController from "../controllers/class.controller.js"; // assuming default export

const { getAllClasses, createClass, updateClass, deleteClass } = classController;

const router = express.Router();

router.post("/create", authMiddleware(["SCHOOL"]), createClass);
router.get("/all", authMiddleware(["SCHOOL", "TEACHER"]), getAllClasses);
router.patch("/update/:id", authMiddleware(["SCHOOL"]), updateClass);
router.delete("/delete/:id", authMiddleware(["SCHOOL"]), deleteClass);

export default router;
