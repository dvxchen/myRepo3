// 全局忽略所有网页错误（包括 WebGL）
Cypress.on('uncaught:exception', (err, runnable) => {
  return false
})
