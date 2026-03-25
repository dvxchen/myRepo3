const { defineConfig } = require("cypress");

module.exports = defineConfig({
  e2e: {
    specPattern: process.env.CYPRESS_CASENAME,
    video: false,
    supportFile: 'cypress/support/e2e.js' // 开启支持文件
  },
  chromeWebSecurity: false,
  headless: true
});
