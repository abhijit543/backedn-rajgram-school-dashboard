import express from "express";
import authMiddleware from "../auth/auth.js";
import { getAllSchedules, createSchedule, updateSchedule, deleteSchedule, getSchedulesForStudent } from "../controllers/schedule.controller.js";

const router = express.Router();

// Route for creating a new schedule
router.post("/create", authMiddleware(["SCHOOL"]), createSchedule);

// Route for fetching all schedules
router.get("/all", authMiddleware(["SCHOOL", "TEACHER"]), getAllSchedules);

// Route for student fetching schedule by class
router.get("/fetch", authMiddleware(["STUDENT"]), getSchedulesForStudent);

// Route for updating a schedule
router.patch("/update/:id", authMiddleware(["SCHOOL", "TEACHER"]), updateSchedule);

// Route for deleting a schedule
router.delete("/delete/:id", authMiddleware(["SCHOOL"]), deleteSchedule);

export default router;
