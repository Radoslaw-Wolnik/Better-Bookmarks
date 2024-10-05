const puppeteer = require('puppeteer');
const path = require('path');

let browser;
let page;

const EXTENSION_PATH = path.join(__dirname, '..');
const EXTENSION_ID = 'your-extension-id-here'; // Replace with your actual extension ID

jest.setTimeout(30000); // Increase timeout for slower operations

beforeAll(async () => {
  browser = await puppeteer.launch({
    headless: false,
    args: [
      `--disable-extensions-except=${EXTENSION_PATH}`,
      `--load-extension=${EXTENSION_PATH}`,
    ],
  });
});

afterAll(async () => {
  await browser.close();
});

beforeEach(async () => {
  page = await browser.newPage();
});

afterEach(async () => {
  await page.close();
});

// General Add-on Tests
describe('General Add-on Tests', () => {
  test('Add-on loads correctly', async () => {
    await page.goto(`moz-extension://${EXTENSION_ID}/popup/popup.html`);
    const title = await page.$eval('h1', el => el.textContent);
    expect(title).toBe('Enhanced Bookmarks Manager');
  });
});

// Import and run all your test suites
require('./bookmarks.test.js');
require('./sessions.test.js');