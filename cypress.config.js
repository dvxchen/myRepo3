const { defineConfig } = require("cypress");

module.exports = defineConfig({
  e2e: {
    specPattern: "cypress/e2e/**/*.cy.js",
    video: false,
    // 关键：禁用支持文件，消除提示
    supportFile: false
  },
  chromeWebSecurity: false,
  headless: true
});
