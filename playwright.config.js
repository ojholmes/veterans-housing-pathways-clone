// @ts-check
/** @type {import('@playwright/test').PlaywrightTestConfig} */
module.exports = {
  use: { headless: true, viewport: { width: 390, height: 844 } },
  testDir: 'e2e'
};
