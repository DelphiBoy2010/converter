const {writeScenarioName, getPlatform} = require("./utils/utils");
const sendEmail = require("./utils/mailer");
const {balad2} = require("./routes/balad/balad");
const transferData = require("./routes/transfer");
require("dotenv").config();

async function runAutomation() {
  const platform = await getPlatform();
  console.log("Platform is: ", platform);
  const mode = process.env.Mode;
  if(mode==="1"){
    let tests = process.env.TODO_LIST;
    tests = JSON.parse(tests);
    let logs;
    try {
      // showTestNumber();
      writeScenarioName("balad");
      logs = balad2(tests);
    } catch (error) {
      logs = {
        TestTitle: "balad",
        result: "failed",
        error,
      };
    }
    try {
      logs?.filename && await sendEmail(logs?.filename);
    } catch (error) {
      console.error("Error in sendEmail:", error);
    }
  }
  if(mode==="2"){
    await transferData(process.env.Transfer_File_Path);
  }

}

runAutomation();
