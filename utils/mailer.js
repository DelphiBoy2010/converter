const nodemailer = require("nodemailer");
const fs = require("fs");
const path = require("path");

async function sendEmail(fileName) {

  const text = `this result for ${fileName}`;
  const smtpConfig = {
    service: "Gmail", // Use the email service you prefer (e.g., 'Gmail', 'SMTP', etc.)
    auth: {
      user: "lawvoautomation@gmail.com",
      pass: process.env.APP_PASSWORD,
    },
  };
  const transporter = nodemailer.createTransport(smtpConfig);
  const mailOptions = {
    from: "lawvoautomation@gmail.com",
    to: process.env.EMAIL,
    subject: "site data",
    text: text,
    attachments: [
      {
        filename: fileName,
        content: fs.createReadStream(path.join(__dirname, "../"+fileName)),
      },
    ],
  };
  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent:", info.response);
  } catch (error) {
    console.error("Error sending email:", error);
  }
}
module.exports = sendEmail;
