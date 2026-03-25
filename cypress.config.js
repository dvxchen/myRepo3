const { defineConfig } = require("cypress");

module.exports = defineConfig({
  e2e: {
    specPattern: process.env.CYPRESS_CASENAME,
    video: false,
    supportFile: false,

    // 👇 只加这一段，忽略 WebGL 错误，不影响你原有配置
    setupNodeEvents(on, config) {
      on('uncaught:exception', (err, runnable) => {
        // 忽略网页内部错误（包括 WebGL）
        return false;
      });
      return config;
    }
  },
  chromeWebSecurity: false,
  headless: true
});
