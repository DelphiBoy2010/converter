const nodemailer = require("nodemailer");
const fs = require("fs");
const path = require("path");

async function sendEmail(arrayLog) {
  const filePath = "log.csv";
  let tests = arrayLog.length;
  let failed = 0;
  let success = 0;
  let failedScenarios = "";
  await Promise.all(
      arrayLog.map(async (item) => {
      if (item?.result === "successful") {
        success = success + 1;
      }
      if (item?.result === "failed") {
        failed = failed + 1;
        failedScenarios = failedScenarios + "-" + item?.TestTitle;
      }
    })
  );
  console.log('total', tests, 'success', success, 'failed', failed);
  const text = `Lawvo Automatic tests have been done with the following information:\n
  1- number of Tests: ${tests}\n
  2- Failed: ${failed}\n
  3- Success: ${success}\n
  4- Failed Scenarios: ${failedScenarios}`;
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
    subject: "Lawvo Automatic tests",
    text: text,
    attachments: [
      {
        filename: "log.csv",
        content: fs.createReadStream(path.join(__dirname, "../log.csv")),
      },
    ],
  };
  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent:", info.response);

    let objectDate = new Date();
    var date =
      objectDate.getFullYear() +
      "-" +
      (objectDate.getMonth() + 1) +
      "-" +
      objectDate.getDate();
    var time =
      objectDate.getHours() +
      ":" +
      objectDate.getMinutes() +
      ":" +
      objectDate.getSeconds();
    const newFileName = date + "-" + time + "-" + filePath;

    fs.rename(filePath, newFileName, (err) => {
      if (err) {
        console.error(`Error renaming file: ${err}`);
      } else {
      }
    });
  } catch (error) {
    console.error("Error sending email:", error);
  }
}
module.exports = sendEmail;
