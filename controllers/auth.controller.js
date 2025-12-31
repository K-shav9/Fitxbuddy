import messages from "../utils/message.utils.js";
import statusCodes from "../utils/status.code.js";
import { hashPassword, comparePassword } from "../utils/hashPassword.js";
import { generateToken } from "../middlewares/tokenAuth.js";
import { generateOtp } from "../utils/generateOtp&Password.js";
import {
  verifyEmailAfterSignup,
} from "../utils/sendMail.js";
import { forgetPasswordService, loginService , registerUserService, resetPasswordService, verifySocialUserService } from "../services/auth.service.js";

// MODEL

export const socialLogin = async (req, res) => {
  try {
    const { authProvider } = req.body;
    if (!authProvider) {
      return res.status(statusCodes.BAD_REQUEST).json({
        status: statusCodes.BAD_REQUEST,
        message: "Auth provider is required.",
      });
    }

    const result = await verifySocialUserService(req.body, authProvider);
    if (!result.success) {
      return res.status(result.status).json({
        status: result.status,
        message: result.message,
      });
    }


    return res.status(statusCodes.OK).json({
      status: statusCodes.OK,
      message: result.isNewUser ? messages.USER_CREATED_SUCCESSFULLY : messages.LOGIN_SUCCESSFUL,
      data: result.user,
    });
  } catch (error) {
    console.error('Social Login controller error:', error);

    return res.status(statusCodes.ERROR).json({
      status: statusCodes.ERROR,
      message: messages.INTERNAL_SERVER_ERROR,
    });
  }
};

export const signup = async (req, res) => {
  try {
    const result = await registerUserService(req.body);

    if (!result.success) {
      return res.status(result.status).json({
        status: result.status,
        message: result.message,
      });
    }

    return res.status(statusCodes.OK).json({
      status: statusCodes.OK,
      message: messages.USER_CREATED_SUCCESSFULLY,
      data: result.user,
    });
  } catch (error) {
    console.error('Signup controller error:', error);
    return res.status(statusCodes.ERROR).json({
      status: statusCodes.ERROR,
      message: messages.INTERNAL_SERVER_ERROR,
    });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const result = await loginService(email, password);

    if (!result.success) {
      return res.status(result.status || 500).json({
        status: result.status || 500,
        message: result.message,
      });
    }

    const { user } = result;

    return res.status(statusCodes.OK).json({
      status: statusCodes.OK,
      message: messages.LOGIN_SUCCESSFUL,
      data: user
    });
  } catch (err) {
    console.error('Login Error:', err);
    return res.status(statusCodes.ERROR).json({
      status: statusCodes.ERROR,
      message: messages.INTERNAL_SERVER_ERROR,
    });
  }
};

export const forgetPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const result = await forgetPasswordService(email);

    if (!result.success) {
      return res.status(result.status || statusCodes.BAD_REQUEST).json({
        status: result.status || statusCodes.BAD_REQUEST,
        message: result.message,
      });
    }

    return res.status(statusCodes.OK).json({
      status: statusCodes.OK,
      message: result.message,
      data: {
        email,
        resetUrl: result.resetUrl, // Optional: expose reset URL if needed
      },
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    return res.status(statusCodes.ERROR).json({
      status: statusCodes.ERROR,
      message: messages.INTERNAL_SERVER_ERROR,
    });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { token } = req?.query
    const { newPassword } = req.body;

    const result = await resetPasswordService(token, newPassword);

    if (!result.success) {
      return res.status(result.status || statusCodes.BAD_REQUEST).json({
        status: result.status || statusCodes.BAD_REQUEST,
        message: result.message,
      });
    }

    return res.status(statusCodes.OK).json({
      status: statusCodes.OK,
      message: result.message,
    });

  } catch (error) {
    console.error("Reset password error:", error);
    return res.status(statusCodes.ERROR).json({
      status: statusCodes.ERROR,
      message: messages.INTERNAL_SERVER_ERROR,
    });
  }
};

