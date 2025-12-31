export const generateResetEmail = (resetLink, webPageURL) => {
  const emailTemplate = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>Reset Your Password</title>
  </head>
  <body style="margin: 0; padding: 0; background-color: #f4f4f4; font-family: 'Segoe UI', Tahoma, sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" style="padding: 20px 0;">
      <tr>
        <td align="center">
          <table width="600" cellpadding="0" cellspacing="0" style="background: #ffffff; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.05); overflow: hidden;">
            <tr style="background: linear-gradient(to bottom, #e6f0fb, #ffffff); text-align: center;">
              <td style="padding: 30px;">
              <img src="cid:fitxbuddylogo" alt="FitXBuddy Logo" width="80" />
                <h1 style="margin: 20px 0 10px; font-size: 24px; color: #144272;">FitXBuddy</h1>
                <p style="margin: 0; font-size: 14px; color: #555;">Your Dream Team. For Every Rep.</p>
              </td>
            </tr>

            <tr>
              <td style="padding: 40px 30px;">
                <h2 style="color: #144272; font-size: 20px;">Reset Your FitxBuddy Account Password</h2>
                <p style="color: #333; font-size: 15px;">We received a request to reset your FitXBuddy account password.</p>
                <p style="color: #333; font-size: 15px;">Click the button below to reset it. This link is <strong>valid for 1 hour</strong>.</p>
                <div style="margin: 30px 0; text-align: center;">
            <a href="${resetLink}" style="
               background-color: #28C76F;  /* Solid green matching your app's theme */
               color: white;
               padding: 14px 30px;
               text-decoration: none;
               border-radius: 12px;
               font-size: 16px;
               font-weight: 600;
               display: inline-block;
              box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            ">
              Reset Password
            </a>

                </div>
                <p style="font-size: 14px; color: #777;">If you didn’t request this, you can safely ignore this email.</p>
                <p style="font-size: 14px; color: #777; margin-top: 40px;">Thank you,<br>The FitXBuddy Team</p>
              </td>
            </tr>
            <tr>
              <td style="background-color: #f2f2f2; padding: 20px; text-align: center; color: #999; font-size: 12px;">
                &copy; ${new Date().getFullYear()} FitXBuddy. All rights reserved.
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
  return emailTemplate;
};


