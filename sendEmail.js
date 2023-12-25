const sendEmail = require("./utils/mailer");

async function sendFileEmail() {
    await sendEmail('balad-restaurant-tehran-1.json');
}
sendFileEmail();