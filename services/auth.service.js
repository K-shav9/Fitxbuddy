import jwt from 'jsonwebtoken';
import { generateResetToken, generateToken } from '../middlewares/tokenAuth.js';
import { db } from '../config/database.js';
import { comparePassword, hashPassword } from '../utils/hashPassword.js';
import statusCodes from '../utils/status.code.js';
import messages from '../utils/message.utils.js';
import { generateResetEmail } from '../utils/emailTemplates.js';
import { sendEmail } from '../utils/sendMail.js';
import { OAuth2Client } from 'google-auth-library';
import { splitName } from '../utils/common.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);



const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID); // Your app's Client ID
const PORT = process.env.DB_PORT || 3000;
const HOST = process.env.HOST || 'localhost'; // fallback added for safety


const { User, WorkoutEquipment, FitnessProfile, PasswordResetToken } = db;

export const createUserOrGetUserForSocialService = async ({ email, ...userData }) => {
  try {
    if (!email) {
      return {
        success: false,
        message: messages?.EMAIL_IS_REQUIRED,
      };
    }

    const userExist = await User.findOne({ where: { email } });

    if (userExist) {
      const token = generateToken({ id: userExist?.id });
      return { success: true, user: userExist, token };
    } else {
      const newUser = await User.create({
        email,
        isVerified: true,
        ...userData,
      });
      const token = generateToken({ id: newUser?.id });
      return { success: true, user: newUser, token };
    }
  } catch (error) {
    return {
      success: false,
      message: `Error creating or getting user: ${error.message}`,
    };
  }
};

export const registerUserService = async ({ email, password, confirmPassword, userType }) => {
  try {
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return {
        success: false,
        status: statusCodes.CONFLICT,
        message: messages.USER_ALREADY_EXISTS,
      };
    }

    const hashedPassword = await hashPassword(password);

    const newUser = await User.create({
      email: email.toLowerCase(),
      password: hashedPassword,
      userType
    });

    const token = generateToken({
      id: newUser?.id,
      email: newUser?.email,
      role: newUser?.userType,
      // onBoardStep: newUser?.onBoardStep
    });

    await FitnessProfile.create({
      userId: newUser?.id,
    });

    const userWithFitnessProfile = await User.findByPk(newUser?.id, {
      attributes: { exclude: ['password', 'createdAt', 'updatedAt', 'deletedAt', 'isDeleted'] },
      include: [
        {
          model: FitnessProfile,
          attributes: { exclude: ['createdAt', 'updatedAt'] },
          include: [
            {
              model: WorkoutEquipment,
              as: 'equipment',
              attributes: { exclude: ['createdAt', 'updatedAt'] }
            }
          ]
        }
      ]
    });
    const data = { ...userWithFitnessProfile?.dataValues, token }
    return {
      success: true,
      user: data,
    };
  } catch (error) {
    console.error('Error in registerUserService:', error);
    return {
      success: false,
      status: statusCodes.ERROR,
      message: messages.INTERNAL_SERVER_ERROR,
    };
  }
};

export const loginService = async (email, password) => {
  try {
    const user = await User.findOne({ where: { email } });

    if (!user) {
      return {
        success: false,
        status: statusCodes.NOT_FOUND,
        message: messages.USER_NOT_FOUND,
      };
    }

    const isMatch = await comparePassword(password, user.password);
    if (!isMatch) {
      return {
        success: false,
        status: statusCodes.UNAUTHORIZED,
        message: messages.INVALID_CREDENTIALS,
      };
    }

    const token = generateToken({
      id: user.id,
      email: user.email,
      role: user.userType,
    });

    const userWithFitnessProfile = await User.findByPk(user.id, {
      attributes: { exclude: ['password', 'createdAt', 'updatedAt', 'deletedAt', 'isDeleted'] },
      include: [
        {
          model: FitnessProfile,
          attributes: { exclude: ['createdAt', 'updatedAt'] },
          include: [
            {
              model: WorkoutEquipment,
              as: 'equipment',
              attributes: { exclude: ['createdAt', 'updatedAt'] }
            }
          ]
        }
      ]
    });
    const data = { ...userWithFitnessProfile?.dataValues, token }
    // data.token = token
    return {
      success: true,
      user: data,
    };

  } catch (error) {
    console.error('Error in loginService:', error);
    return {
      success: false,
      status: statusCodes.ERROR,
      message: messages.INTERNAL_SERVER_ERROR,
    };
  }
};

export const forgetPasswordService = async (email) => {
  try {
    const user = await User.findOne({
      where: {
        email: email.toLowerCase(),
        authProvider: 'app'
      }
    });

    if (!user) {
      return {
        success: false,
        status: statusCodes.NOT_FOUND,
        message: messages.USER_NOT_FOUND,
      };
    }

    const resetToken = await generateResetToken({
      id: user.id,
      email: user.email,
      role: user.userType,
    });

    const expiresAt = new Date(Date.now() + 3600 * 1000); // 1 hour from now
    const webPageURL = `http://${HOST}:${PORT}`; // frontend base
    const resetPasswordUrl = `${webPageURL}/reset-password?token=${resetToken}`;
    const subject = "Reset Your FitXBuddy Account Password";
    const htmlContent = generateResetEmail(resetPasswordUrl, webPageURL);

    await PasswordResetToken.create({
      userId: user.id,
      token: resetToken,
      expiresAt,
    });

    const attachments = [
      {
        filename: 'fitxbuddylogo.png',
        path: path.join(__dirname, '../public/logos/fitxbuddylogo.png'),
        cid: 'fitxbuddylogo', // This matches the src in your email HTML
      },
    ];
    
    const emailData = { email, subject, htmlContent, attachments }
    const response = await sendEmail(emailData);
    console.log("Email response :::::::::::", response);

    return {
      success: true,
      status: statusCodes.OK,
      message: messages.FORGOT_PASSWORD_LINK_SENT,
      resetUrl: resetPasswordUrl,
    };
  } catch (error) {
    console.error('Error in forgetPasswordService:', error);
    return {
      success: false,
      status: statusCodes.ERROR,
      message: messages.INTERNAL_SERVER_ERROR,
    };
  }
};


export const resetPasswordService = async (token, newPassword) => {
  try {

    const tokenRecord = await PasswordResetToken.findOne({ where: { token } });

    if (!tokenRecord || new Date(tokenRecord.expiresAt) < Date.now()) {
      return {
        success: false,
        status: statusCodes.UNAUTHORIZED,
        message: messages?.TOKEN_INVALID_OR_EXPIRED,
      };
    }

    const user = await User.findByPk(tokenRecord.userId);
    if (!user) {
      return {
        success: false,
        status: statusCodes.NOT_FOUND,
        message: messages.USER_NOT_FOUND,
      };
    }

    user.password = await hashPassword(newPassword);
    await user.save();

    await PasswordResetToken.destroy({ where: { id: tokenRecord.id } });

    return {
      success: true,
      status: statusCodes.OK,
      message: messages?.PASSWORD_RESET_SUCCESSFUL,
    };
  } catch (error) {
    console.error('Error in resetPasswordService:', error);
    return {
      success: false,
      status: statusCodes.ERROR,
      message: messages.INTERNAL_SERVER_ERROR,
    };
  }
};

const verifyGoogleToken = async (idToken) => {
  try {
    const ticket = await client.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    return ticket.getPayload();
  } catch (error) {
    console.error("Google token verification failed:", error.message);
    throw error;
  }
};

const createUserOrGetUserForSocial = async ({ email, ...userData }) => {
  try {
    let user;
    let isNewUser = false;

    // ============ Google Login ============
    if (userData?.authProvider === "android") {
      if (!email) {
        return { success: false, message: `Email is required, please provide it!` };
      }

      user = await User.findOne({ where: { email } });

      const { firstName, lastName } = splitName(userData?.fullName);


      if (user) {
        if (user?.isDeleted || user?.deletedAt !== null) {

          await user.update({
            isDeleted: false,
            deletedAt: null,
            socialId: userData?.socialId,
            authProvider: userData?.authProvider,
            fullName: userData?.fullName,
            firstName: firstName,
            lastName: lastName
          });
        }
      } else {
        user = await User.create({
          email,
          fullName: userData?.fullName,
          firstName: firstName,
          lastName: lastName,
          ...userData
        });

        await FitnessProfile.create({ userId: user?.id });
        isNewUser = true;
      }
    }

    // ============ Apple / Other Social Login ============
    else {
      user = await User.findOne({ where: { socialId: userData?.socialId } });

      if (!user) {
        const userPayload = {
          fullName: userData?.fullName,
          socialId: userData?.socialId,
          authProvider: userData?.authProvider,
          firstName: userData?.firstName.toLowerCase(),
          lastName: userData?.lastName.toLowerCase()
        };

        if (email) {
          userPayload.email = email;
        }


        user = await User.create(userPayload);
        await FitnessProfile.create({ userId: user?.id });
        isNewUser = true;
      }
    }

    const token = generateToken({
      id: user?.id,
      email: user?.email,
      role: user?.userType,
    });

    const userWithFitnessProfile = await User.findByPk(user?.id, {
      attributes: { exclude: ['password', 'createdAt', 'updatedAt', 'deletedAt', 'isDeleted'] },
      include: [
        {
          model: FitnessProfile,
          attributes: { exclude: ['createdAt', 'updatedAt'] },
          include: [
            {
              model: WorkoutEquipment,
              as: 'equipment',
              attributes: { exclude: ['createdAt', 'updatedAt'] }
            }
          ]
        }
      ]
    });

    const data = { ...userWithFitnessProfile?.dataValues, token };

    return {
      success: true,
      user: data,
      isNewUser: isNewUser
    };

  } catch (error) {
    return {
      success: false,
      message: `Error creating or getting user: ${error.message}`,
    };
  }
};


export const verifySocialUserService = async (socialBody, auth) => {
  //Google Login
  if (auth === "android") {
    try {
      const user = await createUserOrGetUserForSocial({
        authProvider: auth,
        socialId: socialBody.id,
        email: socialBody.email?.toLowerCase(),
        fullName: socialBody.name,
      });

      return user;
    } catch (error) {
      return { status : statusCodes?.INTERNAL_SERVER_ERROR ,success: false, message: "Internal Server Error" };
    }
  }

  //Apple Login

  else if (auth === "ios") {
    const {
      accessToken,
      id,
      // name,
      email,
      firstName,
      lastName
    } = socialBody;

    if (!accessToken) {
      return { success: false, message: messages?.TOKEN_NOT_PROVIDED };
    }

    try {
      const decoded = jwt.decode(accessToken, { complete: true });
      const sub = decoded?.payload?.sub;

      if (!sub) {
        return { success: false, message: messages?.INVALID_TOKEN_FORMAT };
      }

      // First-time login (appleId present)
      if (id) {
        if (sub !== id) {
          return { success: false, message: messages?.TOKEN_AND_ID_MISMATCH };
        }

        const user = await createUserOrGetUserForSocial({
          authProvider: auth,
          socialId: id,                // Store appleId (same as sub)
          email: email?.toLowerCase(),
          fullName: `${firstName.trim()} ${lastName.trim()}`.trim(),
          firstName,
          lastName
        });
        return user;
      }

      // Subsequent login (only accessToken)
      const user = await createUserOrGetUserForSocial({
        authProvider: auth,
        socialId: sub                      // Match stored appleId from first login
      });

      return user;
    } catch (error) {
      console.error("Apple login error:", error);
      return { success: false, message: "Internal Server Error" };
    }
  }

};