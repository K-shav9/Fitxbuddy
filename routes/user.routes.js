import express from "express";
import { addOnboardUser, editOnboardUser, getAllEquipments, myProfile } from '../controllers/user.controller.js';
import { verifyToken } from '../middlewares/tokenAuth.js';
import validateMiddleWare from "../middlewares/validate.js";
import { addOnBoardSchema, updateOnBoardSchema } from "../validations/user.validation.js";

const userRouter = express.Router();


userRouter
    .post("/onboard-user", verifyToken, validateMiddleWare(addOnBoardSchema), addOnboardUser)
    // .put("/onboard-user", verifyToken, validateMiddleWare(updateOnBoardSchema), editOnboardUser)
    .get("/my-profile", verifyToken, myProfile)
    .get("/all-equipments", getAllEquipments)

export default userRouter;
