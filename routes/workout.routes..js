import express from "express";
import { generateWorkout, getTodaysWorkout, getWorkoutByDate, getWorkoutWeekSummaries, reGenerateWorkout } from "../controllers/workout.controller.js";
import { verifyToken } from '../middlewares/tokenAuth.js';
import validateMiddleware from "../middlewares/validate.js";
import { getTodayWorkoutSchema } from "../validations/workout.validation.js";

const workoutRouter = express.Router();

workoutRouter
    .post("/generate-workout", verifyToken, generateWorkout)
    .post("/regenerate-workout", verifyToken, reGenerateWorkout)
    .get("/week-summary", verifyToken, getWorkoutWeekSummaries)
    .get("/today-workout", verifyToken, validateMiddleware(getTodayWorkoutSchema), getTodaysWorkout)
    .get("/date", verifyToken, validateMiddleware(getTodayWorkoutSchema), getWorkoutByDate)





export default workoutRouter;
