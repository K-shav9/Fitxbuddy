import nodemailer from "nodemailer";
// import { getHtmlContent } from "./htmlContent.js";

export const sendEmail = async ({ email, subject, htmlContent, attachments = [] }) => {
  const HOST = process.env.EMAIL_HOST || "";
  const NO_REPLY_EMAIL = process.env.NO_REPLY_EMAIL || "";
  const USER = process.env.ADMIN_EMAIL || "";
  const PASSWORD = process.env.EMAIL_PASSWORD || "";
  const PORT = parseInt(process.env.EMAIL_PORT || "587", 10); // Ensure it's a number
  try {
    const transporter = nodemailer.createTransport({
      host: HOST,
      port: PORT,
      secure: true,
      auth: {
        user: USER,
        pass: PASSWORD,
      },
    });

    const mailOptions = {
      from: NO_REPLY_EMAIL,
      to: email,
      subject: subject,
      html: htmlContent,
      attachments
    };

    await transporter.sendMail(mailOptions);
    return true;
  } catch (err) {
    console.error("send email -----",err);
    return false;
  }
}

export async function forgotPasswordOtpVerifyMail({
  email,
  subject,
  text,
}) {

  const htmlContent = await getHtmlContent(
    "forgot_password_otp_verify",
    replaceData
  );
  await sendMail({ email, subject, htmlContent });
}

export async function verifyEmailAfterSignup({
  email,
  subject,
  text,
  verificationOTP,
  link,
}) {
  const replaceData = {
    text,
    verificationCode: verificationOTP,
    link,
  };

  const htmlContent = await getHtmlContent(
    "verify_signup_email",
    replaceData
  );
  await sendMail({ email, subject, htmlContent });
}


async function sendWelcomeMail({ email, subject, firstName, link }) {
  const replaceData = {
    firstName,
    link,
    logoCid: "mandate360logo",
  };

  const htmlContent = await getHtmlContent("welcome_email", replaceData);
  const attachments = [
    {
      filename: "logo.png",
      path: path.join(__dirname, "../assets/logo.png"),
      cid: "mandate360logo",
    },
  ];
  await sendMail({ email, subject, htmlContent, attachments });
  return;
}
