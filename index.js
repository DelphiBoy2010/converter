const {writeScenarioName, getPlatform} = require("./utils/utils");
const sendEmail = require("./utils/mailer");
const {balad2} = require("./routes/balad/balad");
require("dotenv").config();

async function runAutomation() {
  const platform = await getPlatform();
  console.log("Platform is: ", platform);
  let tests = process.env.TODO_LIST;
  tests = JSON.parse(tests);
  //const totalTests = await tests.filter(item => item.flag === true)?.length;
  //console.log('Total Tests: ', totalTests);
  // const showTestNumber = () =>{
  //   currentTestNumber++;
  //   console.log('Test ' + currentTestNumber + '/'+totalTests);
  // };
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

  //process.env.Debug_Show && console.log('arrayLog', arrayLog);
  //await logDebug(["arrayLog", arrayLog]);
  //const fileName = tests.name+'-'+tests.cat+'-'+tests.city;
  //await writeToJSONFile(fileName, arrayLog[0].jsonResult);
  try {
    logs?.filename && await sendEmail(logs?.filename);
  } catch (error) {
    console.error("Error in sendEmail:", error);
  }
}

runAutomation();
