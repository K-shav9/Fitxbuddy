import express from "express";
import validateMiddleWare from "../middlewares/validate.js";
import {
  signupJoiSchema,
  loginJoiSchema,
  resetPasswordSchema,
  forgetPasswordJoiSchema,
  socialLoginJoiSchema,
} from "../validations/auth.validation.js";
import { forgetPassword, login, resetPassword, signup, socialLogin } from "../controllers/auth.controller.js";

const authRouter = express.Router();

authRouter
  .post("/signup", validateMiddleWare(signupJoiSchema), signup)
  .post("/login", validateMiddleWare(loginJoiSchema), login)
  .post("/forget-password", validateMiddleWare(forgetPasswordJoiSchema), forgetPassword)
  .post("/reset-password", validateMiddleWare(resetPasswordSchema), resetPassword)
  .post("/social-login", validateMiddleWare(socialLoginJoiSchema), socialLogin)


export default authRouter;
