const { Builder, By, until, Key} = require("selenium-webdriver");
const { Options } = require("selenium-webdriver/chrome");
const uuid = require("uuid");
const axios = require("axios");
const fs = require("fs");
const { decodeData } = require("./hashHelper");
require("dotenv").config();
require("chromedriver");
const os = require("os");
const { USER_CITY, TEST_TEXT } = require("./constData");
// const colors = require("colors");

async function setupWebDriver() {
  const platform = await getPlatform();
  let builder = new Builder().forBrowser("chrome");
  let options = new Options();
  if (platform === "linux") {
    options.headless(); // run headless Chrome
    options.addArguments("--window-size=1920,1200");
  } else {
    options.addArguments("--start-maximized");
  }
  options.excludeSwitches(["enable-logging"]); // disable 'DevTools listening on...'
  options.addArguments("--disable-extensions");
  options.addArguments(["--no-sandbox"]); // not an advised flag but eliminates "DevToolsActivePort file doesn't exist" error.
  // options.detachDriver(true);
  let driver = await builder.setChromeOptions(options).build();
  return driver;
}

async function getDivByClassNameAndContent(driver, className, content) {
  try {
    const xpathExpression = `//div[contains(@class, '${className}') and contains(text(), '${content}')]`;
    return await driver.findElement(By.xpath(xpathExpression));
  } catch (error) {
    await logErrors([
      "An error occurred for getDivByClassNameAndContent:",
      error,
    ]);
  }
}
async function getSpanByClassNameAndContent(driver, className, content) {
  try {
    const xpathExpression = `//span[contains(@class, '${className}') and contains(text(), '${content}')]`;
    return await driver.findElement(By.xpath(xpathExpression));
  } catch (error) {
    await logErrors([
      "An error occurred for getDivByClassNameAndContent:",
      error,
    ]);
  }
}

async function getDivByClassName(driver, className) {
  try {
    const xpathExpression = `//div[contains(@class, '${className}')]`;
    return await driver.findElement(By.xpath(xpathExpression));
  } catch (error) {
    await logErrors(["An error occurred getDivByClassName :", error]);
    return null;
  }
}

async function doesElementExist(driver, id) {
  try {
    return await getElementById(driver, id);
  } catch (error) {
    return false; // Element does not exist
  }
}
async function doesElementExistByClass(driver, className) {
  try {
    return await getElementByClassName(driver, className);
  } catch (error) {
    return false; // Element does not exist
  }
}

async function getElementByClassName(driver, className) {
  try {
    await logDebug(["class before", new Date(), className]);
    let element = await driver.findElement(By.className(className));
    await driver.wait(until.elementIsVisible(element), await getTimeout());
    await logDebug(["class after", new Date(), className]);
    return element;
  } catch (error) {
    await logErrors(["An error occurred getElementByClassName:", error]);
    return null;
  }
}
async function getElementByTypeClassName(driver, type, className) {
  try {
    const item = type + '.' + className;
    await logDebug(["class before", new Date(), className]);
    const element = await driver.executeScript(
        'return document.querySelector("'+item+'")'
    );
    await logDebug(["class after", new Date(), className]);
    return element;
  } catch (error) {
    await logErrors(["An error occurred getElementByClassName:", error]);
    return null;
  }
}
async function getElementsByTypeClassName(driver, type, className) {
  try {
    const item = type + '.' + className;
    await logDebug(["class before", new Date(), className]);
    const element = await driver.executeScript(
        'return document.querySelectorAll("'+item+'")'
    );
    await logDebug(["class after", new Date(), className]);
    return element;
  } catch (error) {
    await logErrors(["An error occurred getElementByClassName:", error]);
    return null;
  }
}
async function getElementAttributeJS(driver, item, attribute) {
  try {
    await logDebug(["class before", new Date(), attribute]);
    const element = await driver.executeScript(
        'return ' + item + '.' + attribute +';'
    );
    await logDebug(["class after", new Date(), attribute]);
    return element;
  } catch (error) {
    await logErrors(["An error occurred getElementByClassName:", error]);
    return null;
  }
}
async function clickElementByJS(driver, id) {
  try {
    await logDebug(["click before", new Date(), id]);
    //await driver.sleep(process.env.LOADING_TIME);
    // Execute JavaScript to interact with the element
    await driver.executeScript(
      "document.getElementById('" + id + "').click();"
    );
    await logDebug(["click after", new Date(), id]);
  } catch (error) {
    await logErrors(["An error occurred clickElementByJS:", error]);
    return null;
  }
}
async function clickElementByJSCalss(driver, className) {
  try {
    await logDebug(["click before", new Date(), className]);
    await driver.sleep(process.env.LOADING_TIME);
    // Execute JavaScript to interact with the element
    await driver.executeScript(
      "document.getElementsByClassName('" + className + "')[0].click();"
    );
    await logDebug(["click after", new Date(), className]);
  } catch (error) {
    await logErrors(["An error occurred clickElementByJS:", error]);
    return null;
  }
}
async function clickGetQuoteJS(driver) {
  try {
    await logDebug(["click before", new Date()]);
    await driver.sleep(process.env.LOADING_TIME);
    // Execute JavaScript to interact with the element
    await driver.executeScript(
      "document.querySelectorAll('#get-balad')[1].click();"
    );
    //const res = await driver.executeScript("return document.querySelectorAll('#get-balad');");
    await logDebug(["click after", new Date()]);
    await driver.sleep(process.env.LOADING_TIME);
  } catch (error) {
    await logErrors(["An error occurred clickElementByJS:", error]);
    return null;
  }
}
async function getTemplateElementsJS(driver) {
  try {
    await logDebug(["click before", new Date()]);
    // await driver.sleep(process.env.LOADING_TIME);
    // Execute JavaScript to interact with the element
    const elements = await driver.executeScript(
      "return document.querySelectorAll('[id*=\"15\"]')"
    );
    //const res = await driver.executeScript("return document.querySelectorAll('#get-balad');");
    await logDebug(["click after", new Date()]);
    // await driver.sleep(process.env.LOADING_TIME);
    return elements;
  } catch (error) {
    await logErrors(["An error occurred clickElementByJS:", error]);
    return null;
  }
}
async function getGoogleAddressElementsJS(driver) {
  try {
    await logDebug(["click before", new Date()]);
    // Execute JavaScript to interact with the element
    const elements = await driver.executeScript(
        "return document.querySelectorAll('[id*=\"react-select-\"]')"
    );
    await logDebug(["click after", new Date()]);
    return elements;
  } catch (error) {
    await logErrors(["An error occurred clickElementByJS:", error]);
    return null;
  }
}

async function getAllElementsByClassName(driver, className) {
  try {
    return await driver.findElements(By.className(className));
  } catch (error) {
    await logErrors(["An error occurred getElementByClassName:", error]);
    return null;
  }
}

async function getElementByName(driver, name) {
  try {
    return await driver.findElement(By.name(name));
  } catch (error) {
    await logErrors(["An error occurred getElementByName:", error]);
    return null;
  }
}

// async function waitForUrlAndCheck2(driver, expectedUrl) {
//   try {
//     return await driver.wait(until.urlIs(expectedUrl), await getTimeout());
//   } catch (error) {
//     await logErrors(["An error occurred, waitForUrlAndCheck:", error]);
//     return false;
//   }
// }
async function waitForUrlAndCheck(driver, expectedUrl) {
  try {
    await driver.sleep(process.env.LOADING_TIME);
    const currentURL = await driver.getCurrentUrl();
    return currentURL === expectedUrl;
  } catch (error) {
    await logErrors(["An error occurred, waitForUrlAndCheck:", error]);
    return false;
  }
}
async function getCheckboxByClassName(driver, className) {
  try {
    const selector = `input[type="checkbox"].${className}`;
    return await driver.findElement(By.css(selector));
  } catch (error) {
    await logErrors(["An error occurred getCheckboxByClassName:", error]);
    return null;
  }
}

async function getElementById(driver, id) {
  try {
    await logDebug(["element before", new Date(), id]);
    let element = await driver.findElement(By.id(id));
    await driver.wait(until.elementIsVisible(element), await getTimeout());
    await logDebug(["element after", new Date(), id]);
    return element;
  } catch (error) {
    await logErrors(["An error occurred getElementById:", error]);
    return null;
  }
}

async function getInputByPlaceH(driver, placeholderText) {
  try {
    return await driver.findElement(
      By.css(`input[placeholder="${placeholderText}"]`)
    );
  } catch (error) {
    await logErrors(["An error occurred getInputByPlaceH:", error]);
    return null;
  }
}

async function getElementByContentAndType(driver, elementType, elementContent) {
  try {
    const elementSelector = `${elementType}[value="${elementContent}"]`;
    return await driver.findElement(By.css(elementSelector));
  } catch (error) {
    await logErrors(["An error occurred, getElementByContentAndType:", error]);
    return null;
  }
}
async function writeJsonObjectToFile(filePath, newJsonObject) {
  try {
    const datetime = new Date();

    // Add date and time properties to the newJsonObject
    newJsonObject["date"] = datetime.toISOString().slice(0, 10);
    newJsonObject["time"] = datetime.toTimeString().slice(0, 8);

    let existingData = "";

    try {
      existingData = await fs.readFile(filePath, "utf-8");
    } catch (readError) {
      // File doesn't exist, so it will be created
    }

    existingData = existingData.trim(); // Remove any leading/trailing whitespace

    let existingJsonArray = [];
    if (existingData) {
      existingJsonArray = JSON.parse(existingData);
      if (!Array.isArray(existingJsonArray)) {
        throw new Error("Existing data in the file is not a valid JSON array.");
      }
    }

    // If the existing array doesn't exist, create a new one
    if (!Array.isArray(existingJsonArray)) {
      existingJsonArray = [];
    }

    existingJsonArray.push(newJsonObject);

    const updatedJsonString = JSON.stringify(existingJsonArray, null, 2);

    // Create the file if it doesn't exist
    try {
      await fs.writeFile(filePath, updatedJsonString, "utf-8");
    } catch (writeError) {
      console.error("Error writing to file:", writeError);
    }
  } catch (error) {
    console.error("Error appending JSON object to file:", error);
  }
}

async function writeObjectsToCsv(filePath, objectArray) {
  try {
    for (const newObject of objectArray) {
      const datetime = new Date();
      newObject["date"] = datetime.toISOString().slice(0, 10);
      newObject["time"] = datetime.toTimeString().slice(0, 8);

      if (newObject?.error) {
        let error = newObject.error.toString();
        error = error
          .substring(0, process.env.LOG_ERROR_LENGTH)
          .replace(",", "-")
          .replace(/\n/g, "-");
        newObject["error"] = `${error}...`;
      }

      let existingData = [];

      try {
        // Read the existing CSV file if it exists
        await fs.promises.access(filePath);
        const csvString = await fs.promises.readFile(filePath, "utf-8");
        const existingCsv = csvString.trim();

        if (existingCsv) {
          existingData = await parseCsv(existingCsv);
        }
      } catch (readError) {
        // File doesn't exist, so it will be created
      }

      // Add the new object's values as a new row
      const header = Object.keys(newObject);

      if (existingData.length === 0) {
        // If the array is empty, meaning there is no existing data in the CSV file, add the header row
        existingData.push(header);
      }

      const newRow = header.map((key) => newObject[key]);
      existingData.push(newRow);

      // Write the updated CSV data to the file
      const csvRows = existingData.map((row) => row.join(","));
      await fs.promises.writeFile(filePath, csvRows.join("\n") + "\n");
    }
  } catch (error) {
    console.error("Error appending objects to CSV file:", error);
  }
}
async function writeToJSONFile(filePath, object) {
  try {
    await fs.promises.writeFile(filePath, object);
  } catch (error) {
    console.error("Error appending objects to JSON file:", error);
  }
}
async function parseCsv(csvString) {
  const rows = csvString
    .split("\n")
    .map((row) => row.trim())
    .filter((row) => row !== "");
  const header = rows[0].split(",");
  const data = rows.slice(1).map((row) => row.split(","));
  return [header, ...data];
}

async function getColumnFromCsv(filePath, columnName) {
  try {
    // Read the CSV file
    const csvString = await fs.promises.readFile(filePath, "utf-8");
    const rows = csvString
      .split("\n")
      .map((row) => row.trim())
      .filter((row) => row !== "");

    // Parse the header row to find the column index
    const header = rows[0].split(",");
    const columnIndex = header.indexOf(columnName);

    if (columnIndex === -1) {
      throw new Error(`Column "${columnName}" not found in CSV.`);
    }

    // Extract the data from the specified column
    return rows.slice(1).map((row) => {
      const rowData = row.split(",");
      return rowData[columnIndex];
    });
  } catch (error) {
    // console.error("Error reading CSV file:", error);
    return [];
  }
}

async function getCellValueByColumn(filePath, rowIndex, columnName) {
  try {
    // Read the CSV file
    const csvString = await fs.promises.readFile(filePath, "utf-8");
    const rows = csvString
      .split("\n")
      .map((row) => row.trim())
      .filter((row) => row !== "");

    // Find the column index by column name
    const headerRow = rows[0].split(",");
    const columnIndexByName = headerRow.indexOf(columnName);

    if (columnIndexByName === -1) {
      throw new Error(`Column "${columnName}" not found in CSV.`);
    }

    // Retrieve the cell value by both row index and column index
    const rowData = rows[rowIndex + 1].split(",");
    return rowData[columnIndexByName];
  } catch (error) {
    // console.error("Error reading CSV file:", error);
    return undefined;
  }
}

function makeEmail() {
  let id = uuid.v1();
  id = id.substring(0, id.indexOf("-"));
  const email = `qa-${id}@mailinator.com`;
  return email.toString();
}
async function fetchUserData(email) {
  try {
    const response = await axios.get(`${process.env.Back_URL}/users`, {
      params: {
        email: email,
      },
    });
    return decodeData(response.data.data);
  } catch (error) {
    console.error(error);
  }
}

async function fetchCase(caseId) {
  const jwtTest = localStorage.getItem("feathers-jwt");
  const headers = {
    Authorization: `Bearer ${jwtTest}`,
  };
  try {
    const response = await axios.get(
      `${process.env.Back_URL}/cases/${caseId}?include[]=user&include[]=toUser`,
      headers
    );
    return decodeData(response.data.data);
  } catch (error) {
    console.error(error);
  }
}
async function postData(endPoint, params) {
  try {
    const response = await axios.post(`${process.env.Back_URL}/${endPoint}`, {
      hash: params,
    });
    return decodeData(response.data);
  } catch (error) {
    console.error(error);
  }
}

async function getIframeByTitle(driver, title) {
  try {
    return await driver.findElement(
      By.css(`iframe[title=${title}]`)
    );
  } catch (error) {
    await logErrors(["An error occurred getElementById:", error]);
    return null;
  }
}

async function getAllDivByClassNameAndContent(driver, className, content) {
  try {
    const xpathExpression = `//div[contains(@class, '${className}') and contains(text(), '${content}')]`;
    return await driver.findElements(By.xpath(xpathExpression));
  } catch (error) {
    await logErrors([
      "An error occurred for getDivByClassNameAndContent:",
      error,
    ]);
    return null;
  }
}

async function hideChatPopuoJS(driver) {
  try {
    await driver.executeScript(
      "document.getElementsByClassName('intercom-app')[0].style.visibility='hidden';"
    );
  } catch (error) {
    await logErrors(["An error occurred clickElementByJS:", error]);
    return null;
  }
}

async function getElementByCssSelector(driver, selector, value) {
  try {
    return await driver.findElement(By.css(`[${selector}=${value}]`));
  } catch (error) {
    await logErrors(["An error occurred getElementByCssSelector:", error]);
    return null;
  }
}
async function writeOnDoc(driver) {
  // Rich Text Area
  const texareaIfame = await driver.findElement(
    By.css('iframe[title="Rich Text Area"]')
  );
  await driver.switchTo().frame(texareaIfame);
  const body = await getElementById(driver, "tinymce");
  const paragraph = await body.findElement(By.xpath("//p"));
  await paragraph.sendKeys(TEST_TEXT);
  await driver.sleep(process.env.LOADING_TIME);
  await driver.switchTo().defaultContent();
}
async function checkDocText(driver) {
  const texareaIfame = await driver.findElement(
    By.css('iframe[title="Rich Text Area"]')
  );
  await driver.switchTo().frame(texareaIfame);
  const body = await getElementById(driver, "tinymce");
  const paragraph = await body.findElement(By.xpath("//p"));
  const docText = await paragraph.getText();
  await driver.switchTo().defaultContent();
  return docText === TEST_TEXT;
}
async function addCard(driver) {
  const cartIframe = await driver.findElement(
    By.css('iframe[title="Secure card number input frame"]')
  );
  await driver.switchTo().frame(cartIframe);
  const cartNumber = await getElementByName(driver, "cardnumber");
  await cartNumber.sendKeys("4242424242424242");
  await driver.switchTo().defaultContent();

  const expirationIframe = await driver.findElement(
    By.css('iframe[title="Secure expiration date input frame"]')
  );
  await driver.switchTo().frame(expirationIframe);
  const cartExpiration = await getElementByName(driver, "exp-date");
  await cartExpiration.sendKeys("0624");
  await driver.switchTo().defaultContent();

  const cvcIframe = await driver.findElement(
    By.css('iframe[title="Secure CVC input frame"]')
  );
  await driver.switchTo().frame(cvcIframe);
  const cartCvc = await getElementByName(driver, "cvc");
  await cartCvc.sendKeys("740");
  await driver.switchTo().defaultContent();

  const addButtonCart = await getElementById(driver, "save-button");
  await addButtonCart.click();
  await driver.sleep(process.env.LOADING_TIME);
  await driver.switchTo().defaultContent();
}
async function addBillingInfo(driver, timeout) {
  const firstName = await getElementById(driver, "billing-info-first-name");
  const lastName = await getElementById(driver, "billing-info-last-name");
  const phoneNumber = await getElementById(driver, "billing-info-phone");
  const postalCode = await getElementById(driver, "billing-info-postal-code");
  const address1 = await getGoogleAddressElementsJS(driver);

  await firstName.click();
  await firstName.clear();
  await lastName.clear();
  await postalCode.clear();
  await phoneNumber.clear();

  await firstName.sendKeys("firstname");
  await lastName.sendKeys("lastname");
  await postalCode.sendKeys('123456');
  await phoneNumber.sendKeys("(111) 111-8982");
  await driver.sleep(timeout || process.env.LOADING_TIME);
  await address1[0].sendKeys(process.env.Address);
  await driver.sleep(timeout || process.env.LOADING_TIME);
  await address1[0].sendKeys(Key.RETURN);
}

  async function fillBasicInfo(driver) {
  const firstName = await getElementById(driver, "firstName");
  const lastName = await getElementById(driver, "lastName");
  const phoneNumber = await getElementById(driver, "phone");

  await firstName.click();
  await clearInputJS(driver, "firstName");
  await firstName.sendKeys(process.env.Customer_Name);
  await driver.sleep(process.env.PROFILE_WAIT);
  await  lastName.click();
  await clearInputJS(driver, "lastName");
  await lastName.sendKeys(process.env.Customer_Lastname);
  await driver.sleep(process.env.PROFILE_WAIT);
  await phoneNumber.sendKeys(process.env.Customer_Phone);
}

async function clearInput(element){
  element.sendKeys(Key.CONTROL + "a")
  element.sendKeys(Key.DELETE)
}
async function clearInputJS(driver, id){
  await driver.executeScript(
      "document.getElementById('" + id + "').value='';"
  );
}

async function fillNotifiSettings(driver) {
  const inAppNotif = await getElementById(driver, "notification-in-app");
  await driver.sleep(process.env.PROFILE_WAIT);
  await inAppNotif.click();
  await driver.sleep(process.env.PROFILE_WAIT);
  const emailNotif = await getElementById(driver, "notification-email");
  await emailNotif.click();
}

async function fillBusinessInfo(driver) {
  const businessName = await getElementById(
    driver,
    "control-hooks_businessName"
  );
  await businessName.sendKeys("Btest");
  await driver.sleep(process.env.PROFILE_WAIT);

  const hst = await getElementById(driver, "control-hooks_hst");
  await hst.sendKeys("5");
  await driver.sleep(process.env.PROFILE_WAIT);

  const lso = await getElementById(driver, "control-hooks_lso");
  await lso.sendKeys("a12345");
  await driver.sleep(process.env.PROFILE_WAIT);

  const cPosition = await getElementById(
    driver,
    "control-hooks_currentPosition"
  );
  await cPosition.sendKeys("test");
  await driver.sleep(process.env.PROFILE_WAIT);

  const address = await getElementById(driver, "control-hooks_businessAddress");
  await address.sendKeys("central park");
  await driver.sleep(process.env.PROFILE_WAIT);

  const city = await getElementById(driver, "control-hooks_businessCity");
  await city.sendKeys("new york");
  await driver.sleep(process.env.PROFILE_WAIT);

  const province = await getElementById(
    driver,
    "control-hooks_businessProvince"
  );
  await province.sendKeys("la");
  await driver.sleep(process.env.PROFILE_WAIT);

  const postalCode = await getElementById(
    driver,
    "control-hooks_businessPostalCode"
  );
  await postalCode.sendKeys("123");
  await driver.sleep(process.env.PROFILE_WAIT);

  const biography = await getElementById(driver, "control-hooks_biography");
  await biography.sendKeys("bio test");
  await driver.sleep(process.env.PROFILE_WAIT);
}

async function fillIntakeQ(driver) {
  // const year = await getElementById(driver, "input-year-of-call");
  // await year.sendKeys("1");
  // await driver.sleep(process.env.PROFILE_WAIT);

  //await driver.findElement(By.id('select-CertifiedItems')).sendKeys('1');
  //const jurisdiction = await getSelectElementsJS(driver, "select-CertifiedItems");
  //const actions = driver.actions({async: true});
  //await actions.move({origin: jurisdiction[0]}).click().perform();
  //await jurisdiction[0].click();
  //await jurisdiction[0].sendKeys("ontario");

  const experiencedItems = await driver.executeScript(
      "return document.getElementById('select-ExperiencedItems');");
  console.log('service', experiencedItems);
  const actions = driver.actions({async: true});
  await actions.move({origin: experiencedItems}).click().perform();
  //await experiencedItems.sendKeys("Wills");
  await experiencedItems.sendKeys(Key.ARROW_DOWN);
  //await experiencedItems.sendKeys(Key.RETURN);

  const items = await driver.executeScript(
      "return document.getElementById('select-ExperiencedItems_list').children[0];");
  console.log('service', items);
  //const actions = driver.actions({async: true});
  await actions.move({origin: items}).click().perform();
  //await experiencedItems.sendKeys("Wills");
  //await experiencedItems.sendKeys(Key.ARROW_DOWN);
  //await experiencedItems.sendKeys(Key.RETURN);

  //This solution only works with <select>
  //const dropdown = new Select(experiencedItems);
  //await dropdown.selectByVisibleText("Wills");

  const dedicating = await getElementById(driver,"input-anticipate-dedicating");
  await dedicating.sendKeys("5");
  await driver.sleep(process.env.PROFILE_WAIT);
}

async function fillBillingInfo(driver) {
  const fName = await getElementById(driver, "control-hooks_firstName");
  await fName.sendKeys("test");
  await driver.sleep(process.env.PROFILE_WAIT);

  const lName = await getElementById(driver, "control-hooks_lastName");
  await lName.sendKeys("test");
  await driver.sleep(process.env.PROFILE_WAIT);

  const mobile = await getElementById(driver, "control-hooks_phone");
  await mobile.sendKeys("1111111111");
  await driver.sleep(process.env.PROFILE_WAIT);

  const city = await getElementById(driver, "control-hooks_city");
  await city.sendKeys(USER_CITY);
  await driver.sleep(process.env.PROFILE_WAIT);

  const province = await getElementById(driver, "control-hooks_province");
  await province.sendKeys(USER_CITY);
  await driver.sleep(process.env.PROFILE_WAIT);

  const postalCode = await getElementById(driver, "control-hooks_postalCode");
  await postalCode.sendKeys("123456");
  await driver.sleep(process.env.PROFILE_WAIT);

  await addCard(driver);
}

async function checkFillProfile(userData) {
  let correct = true;
  let problem = [];
  const userFirstName = userData[0]?.firstName;
  const userLastName = userData[0]?.lastName;
  //const userCity = userData[0].city;
  const notificationToEmail = userData[0]?.notificationToEmail;
  const notificationToApp = userData[0]?.notificationToApp;

  if (correct) {
    if (userFirstName !== process.env.Customer_Name) {
      correct = false;
      problem.push("fName");
    }
    if (userLastName !== process.env.Customer_Lastname) {
      correct = false;
      problem.push("lName");
    }
    // if (userCity !== USER_CITY) {
    //   correct = false;
    //   problem.push("city");
    // }
    if (notificationToEmail) {
      correct = false;
      problem.push("notifToEmail");
    }
    if (notificationToApp) {
      correct = false;
      problem.push("notifToApp");
    }
  }
  return { correct, problem };
}

async function fetchGetData(url) {
  try {
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    console.error(error);
  }
}

async function checkActionView(driver, documentRow) {
  const documentId = await documentRow.getAttribute("data-row-key");
  const documentCells = await documentRow.findElements(
    By.className("ant-table-cell")
  );
  const documentCellName = await documentCells[1].findElement(
    By.xpath("./div[1]")
  );
  let documentName = await documentCellName.getAttribute("id");
  const viewDocBtn = await documentRow.findElement(
    By.id(`view-document-${documentId}`)
  );
  await viewDocBtn.click();
  await driver.sleep(process.env.PROFILE_WAIT);
  const popupTitleDiv = await getElementById(driver,"popup-document-title");
  const popupTitle = await popupTitleDiv.getText();
  documentName = documentName.replace("document-title-", "");
  documentName = documentName.replace(/  +/g, " ");
  const closeButton = await getElementById(driver, "popup-close-button");
  await closeButton.click();
  return popupTitle === documentName;
}

async function checkClickOnTitleDocument(driver, documentRow) {
  const documentCells = await documentRow.findElements(
    By.className("ant-table-cell")
  );
  const documentCellName = await documentCells[1].findElement(
    By.xpath("./div[1]")
  );
  let documentNameCell = await documentCellName.getAttribute("id");
  documentNameCell = documentNameCell.replace("document-title-", "");
  await documentRow.click();
  await driver.sleep(process.env.LOADING_TIME);
  let placeholderValue = "Document Name";
  let documentNameElement = await driver.findElement(
    By.xpath(`//input[@placeholder='${placeholderValue}']`)
  );
  await driver.sleep(process.env.LOADING_TIME);
  const documentNameInput = await documentNameElement.getAttribute("value");

  return documentNameInput === documentNameCell;
}
async function checkEditDocument(driver, documentRow, documentId) {
  const documentCells = await documentRow.findElements(
    By.className("ant-table-cell")
  );
  const documentCellName = await documentCells[1].findElement(
    By.xpath("./div[1]")
  );
  let documentNameCell = await documentCellName.getAttribute("id");
  documentNameCell = documentNameCell.replace("document-title-", "");
  const editDocumentBtn = await getElementById(driver, `edit-document-${documentId}`);
  await editDocumentBtn.click();
  await driver.sleep(process.env.PROFILE_WAIT);
  const documentNameElement = await getElementById(driver, "document-title");
  await driver.sleep(process.env.LOADING_TIME);
  const documentNameInput = await documentNameElement.getAttribute("value");
  return documentNameInput === documentNameCell;
}

async function checkDeleteDocument(driver, documentId) {
  const deleteDocumentBtn = await getElementById(driver, `delete-document-${documentId}`);
  await deleteDocumentBtn.click();
  await driver.sleep(process.env.PROFILE_WAIT);
  const confirmBtn = await getElementById(driver, "confirm-button");
  await confirmBtn.click();
  await driver.sleep(process.env.PROFILE_WAIT);
  const documentList = await fetchGetData(
    `${process.env.DOCUMENT_ENDPOINT}/dc-documents?id=${documentId}`
  );
  return documentList.length === 0;
}

async function checkShareButton(driver, documentId) {
  const shareDocumentBtn = await getElementById(driver, `share-document-${documentId}`);
  await shareDocumentBtn.click();
  await driver.sleep(process.env.PROFILE_WAIT);
  const closeButton = await getElementById(driver, "close-button");
  if (closeButton) {
    await closeButton.click();
    return true;
  } else {
    return false;
  }
}

function writeScenarioName(name) {
  console.log("Scenario: ", name);
  return null;
}
async function waiting(driver, seconds) {
  let w = seconds * 1000;
  await driver.sleep(w);
}
async function getTimeout() {
  return parseInt(process.env.WAIT_TIME_OUT);
}
async function getPlatform() {
  return os.platform();
}
async function logDebug(data) {
  if (process.env.Debug_Show == "true") {
    console.log(data);
  }
}
async function logErrors(data) {
  if (process.env.Debug_Show_Error == "true") {
    console.log(data);
  }
}

module.exports = {
  setupWebDriver,
  getDivByClassNameAndContent,
  getDivByClassName,
  doesElementExist,
  getElementByClassName,
  waitForUrlAndCheck,
  getCheckboxByClassName,
  getElementById,
  getInputByPlaceH,
  getElementByContentAndType,
  writeJsonObjectToFile,
  getElementByName,
  makeEmail,
  fetchUserData,
  postData,
  getIframeByTitle,
  getAllElementsByClassName,
  getAllDivByClassNameAndContent,
  getColumnFromCsv,
  getCellValueByColumn,
  fetchCase,
  writeObjectsToCsv,
  writeScenarioName,
  getSpanByClassNameAndContent,
  waiting,
  getTimeout,
  getPlatform,
  logDebug,
  logErrors,
  clickElementByJS,
  clickGetQuoteJS,
  doesElementExistByClass,
  hideChatPopuoJS,
  getElementByCssSelector,
  addCard,
  fillBasicInfo,
  fillNotifiSettings,
  checkFillProfile,
  fillBusinessInfo,
  fillIntakeQ,
  fillBillingInfo,
  writeOnDoc,
  checkDocText,
  getTemplateElementsJS,
  clickElementByJSCalss,
  fetchGetData,
  checkActionView,
  checkClickOnTitleDocument,
  checkShareButton,
  checkEditDocument,
  checkDeleteDocument,
  addBillingInfo,
  getElementByTypeClassName,
  getElementsByTypeClassName,
  getElementAttributeJS,
  writeToJSONFile
};
