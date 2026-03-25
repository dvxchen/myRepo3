function sum(a, b) {
  cy.visit("https://www.baidu.com");
  return a + b;
}
test('1 + 2 = 3', () => {
  expect(sum(1, 2)).toBe(3);
});
