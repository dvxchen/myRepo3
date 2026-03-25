// sum.test.js（测试文件，必须以 .test.js 结尾）
// 定义一个简单的测试函数
function sum(a, b) {
  return a + b;
}

// 编写测试用例
test('1 + 2 应该等于 3', () => {
  expect(sum(1, 2)).toBe(3);
});
