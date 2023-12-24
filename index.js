const {logDebug, writeObjectsToCsv, writeScenarioName, getPlatform, writeToJSONFile} = require("./utils/utils");
const sendEmail = require("./utils/mailer");
const balad = require("./routes/balad/balad");
require("dotenv").config();

async function runAutomation() {
  let arrayLog = [];
  const platform = await getPlatform();
  console.log("Platform is: ", platform);
  let tests = process.env.TODO_LIST;
  tests = JSON.parse(tests);
  //const totalTests = await tests.filter(item => item.flag === true)?.length;
  //console.log('Total Tests: ', totalTests);
  let currentTestNumber = 0;
  // const showTestNumber = () =>{
  //   currentTestNumber++;
  //   console.log('Test ' + currentTestNumber + '/'+totalTests);
  // };
  try {
    // showTestNumber();
    writeScenarioName("balad");
    const logs = balad(tests);
    arrayLog = [...arrayLog, ...logs];
  } catch (error) {
    const log = {
      TestTitle: "balad",
      result: "failed",
      error,
    };
    arrayLog.push(log);
  }

  //process.env.Debug_Show && console.log('arrayLog', arrayLog);
  //await logDebug(["arrayLog", arrayLog]);
  //const fileName = tests.name+'-'+tests.cat+'-'+tests.city;
  //await writeToJSONFile(fileName, arrayLog[0].jsonResult);
  // try {
  //   await sendEmail(arrayLog);
  // } catch (error) {
  //   console.error("Error in sendEmail:", error);
  // }
}

runAutomation();
