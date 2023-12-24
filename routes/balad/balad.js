const {
  setupWebDriver,
  getElementByTypeClassName, getElementsByTypeClassName, fetchGetData, writeToJSONFile,
} = require("../../utils/utils");
const cheerio = require('cheerio');

async function balad(object) {
  const driver = await setupWebDriver();
  let log = {
    TestTitle: "get a balad",
    result: "failed",
    error: null,
    jsonResult:[],
  };
  try {
    for(var pageNumber = object.firstPage; pageNumber < object.lastPage + 1 ;pageNumber++ ) {
      console.log('pageNumber', pageNumber);
      const mainURL = object.url + pageNumber;
      const htmlContent = await fetchGetData(mainURL);
      //await driver.get(mainURL);
      const $ = cheerio.load(htmlContent);
      // Find all <a> tags with the specified class
      const tempLinks = $('a.BundleItem_item__content__3l8hl');
      const mainLinks = [];
      tempLinks.each((index, element) => {
        const href = $(element).attr('href');
        mainLinks.indexOf(href) === -1 ? mainLinks.push(href) : '';
      });
      //mainLinks.splice(2, 20);
      // console.log('main links', mainLinks);
      for (const linkURL of mainLinks) {
        const itemUrl = object.siteURL + linkURL;
        await driver.get(itemUrl);
        await driver.sleep(process.env.LOADING_TIME);
        //const items = await getAllElementsByClassName(driver, "BundleItem_item__content__3l8hl");
        //await driver.sleep(process.env.PROFILE_WAIT);
        //await items[0].click();
        //await driver.sleep(process.env.PROFILE_WAIT);
        const title = await getElementByTypeClassName(driver, "h1", "DetailsHeader_title__153Y2");
        const titleText = await title.getText();
        const address = await getElementByTypeClassName(driver, "p", "DynamicFields_text__36H36");
        const addressText = await address.getText();
        const category = await getElementByTypeClassName(driver, "p", "DetailsHeader_category__2Qvqi");
        const categoryText = await category.getText();
        const linkElements = await getElementsByTypeClassName(driver, "a", "DynamicFields_text__36H36");
        const links = [];
        linkElements.map(async item => {
          const link = await item.getAttribute('href');
          links.push(link);
        });
        const locationButton = await getElementByTypeClassName(driver, "button", "Button_primary__1HfZQ");
        await locationButton.click();
        await driver.sleep(process.env.PROFILE_WAIT);
        const location = await driver.getCurrentUrl();
        const resultObject = {
          titleText, addressText, categoryText, links, location, category: object.cat,
          city: object.city
        };
        log.jsonResult.push(resultObject);
      }
    }
    log = {...log, result: 'success'}

    const fileName = object.name+'-'+object.cat+'-'+object.city+'-'+object.firstPage+'.json';
    await writeToJSONFile(fileName, JSON.stringify(log.jsonResult));
  } finally {
    await driver.close();
    await driver.quit();
  }
  return log;
}

module.exports = balad;
