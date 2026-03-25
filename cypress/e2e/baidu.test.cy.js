// cypress/e2e/baidu.test.cy.js（正确的 Cypress 测试文件）
describe('访问百度首页', () => {
  it('应该能正常打开百度', () => {
    // Cypress 的 cy 命令，此时会被正确识别
    cy.visit('https://www.baidu.com');
    // 验证页面标题包含「百度」
    cy.title().should('include', '百度');
  });
});
