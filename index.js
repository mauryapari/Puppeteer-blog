const fs = require('fs');
const puppeteer = require('puppeteer');

let searchKeyword, siteUrl, linksJsonFile, accessibilityJsonFile;
function initialize() {
   searchKeyword = "Putin";
   siteUrl = 'https://www.gov.uk/';
   linksJsonFile = "links.json";
   accessibilityJsonFile = "accessibility.json"
}

async function startBrowser() {
   const browser = await puppeteer.launch({
      headless: true,
      defaultViewport: { width: 1920, height:1080}
   });
   const page = await browser.newPage();
   return {browser, page};
}

function printLog(result){
   console.log("\n\Label Title: ", result.title);
   console.log("Link URL: ", result.url);
}

function createJSONFile(fileName, data) {
   const jsonData = JSON.stringify(data);
   fs.writeFile(`${fileName}`, jsonData, (err)=> {
      try {
         if(err) {
            throw err;
         } else {
            console.log("\n JSON Data Created...\n",  
            "=====================================================\n");
         }
      } catch {(err => console.log(err))}; 

   })
}

/**
 * Generate a screenshot defined by the parameters provided.
 * @param {Object} page 
 * @param {String} path 
 * @param {Boolean} isFullPage 
 * @returns 
 */
async function generateScreenshot(page, path, isFullPage) {
   await page.screenshot({path: `./screenshots/${path}screenshot.png`, fullPage: isFullPage});
}

/**
 * 
 * @param {Object} page 
 */
async function fetchLinks(page) {
   let jsonData = [];
   const tags = await page.$$('a');
   for(const tag of tags) {
      const href = await tag.evaluate(element => element.href);
      const labelValue = await tag.evaluate(element=> element.innerText);
      if(labelValue.indexOf('tax') > -1) {
         jsonData.push({
            title: labelValue,
            url: href,
         });
      }
   }
   createJSONFile(linksJsonFile,jsonData);
}

/**
 * 
 * @param {Object} page 
 */
async function submitForm(page) {
   console.log("\n From Submission Started...\n",  
   "=====================================================\n");
   
   await page.click('#super-search-menu-toggle');
   await page.waitForSelector('#super-search-menu');
   console.log("\n Search Bar Opened...\n",  
   "=====================================================\n");
   await generateScreenshot(page,'searchBar', false);

   await page.type('.gem-c-search__input', searchKeyword);
   await page.keyboard.press('Enter');
   await page.waitForNavigation();
   await generateScreenshot(page,'searchResult', true);

   console.log("\n Form Submitted, Screenshot Generated...\n",  
   "=====================================================\n");
}

async function checkAccessibility(page) {
   console.log("\n Generating Accessibility Screenshot \n");
   await page.waitForSelector('main');
   const screenshot = await page.accessibility.snapshot();
   createJSONFile(accessibilityJsonFile, screenshot);
}

async function performUseCases() {
      const {browser, page} = await startBrowser();
      /**Opening page Url*/
      await page.goto(siteUrl);

      await page.pdf({path: 'result.pdf', format: 'A2'});
      
      /**Scraping Page For Link Url and Labels*/
      await fetchLinks(page);

      /**Submitting a form*/
      await submitForm(page);
      /** Accessibility Test */
      // await checkAccessibility(page);
      /**Closing browser */
      await browser.close();
}

initialize();
performUseCases();