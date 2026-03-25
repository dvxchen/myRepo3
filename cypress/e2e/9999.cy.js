describe('Test', { testIsolation: false }, () => {
  before(() => {
    cy.clearCookies();
   });
  it('9999Test', () => {
   cy.visit("https://www.baidu.com");
   cy.wait(10000);
 
  });
});
