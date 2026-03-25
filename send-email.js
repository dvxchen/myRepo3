// send-email.js - 支持 Cypress 失败详情解析
const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');

// 读取环境变量
const config = {
  // 邮箱配置
  host: process.env.EMAIL_HOST,
  port: parseInt(process.env.EMAIL_PORT || '465'),
  user: process.env.EMAIL_USER,
  pass: process.env.EMAIL_PASSWORD,
  to: process.env.EMAIL_TO,
  // GitHub 信息
  repo: process.env.GITHUB_REPOSITORY,
  runId: process.env.GITHUB_RUN_ID,
  trigger: process.env.GITHUB_EVENT_NAME,
  jobStatus: process.env.JOB_STATUS,
  // Cypress 测试结果文件路径
  cypressReportPath: './cypress/results/test-results.json'
};

// 第一步：读取并解析 Cypress 测试报告
let cypressResult = {
  total: 0,
  passed: 0,
  failed: 0,
  failures: [] // 存储失败用例详情
};
try {
  if (fs.existsSync(config.cypressReportPath)) {
    const reportContent = fs.readFileSync(config.cypressReportPath, 'utf8');
    const report = JSON.parse(reportContent);
    
    // 统计测试用例数量
    cypressResult.total = report.tests || 0;
    cypressResult.passed = report.passes || 0;
    cypressResult.failed = report.failures || 0;
    
    // 提取失败用例详情
    if (report.failures && report.failures > 0 && report.testsuites) {
      report.testsuites.forEach(suite => {
        if (suite.testcases) {
          suite.testcases.forEach(testcase => {
            if (testcase.failures && testcase.failures.length > 0) {
              cypressResult.failures.push({
                name: testcase.name, // 用例名称
                error: testcase.failures[0].message || '未知错误' // 失败原因
              });
            }
          });
        }
      });
    }
  }
} catch (e) {
  console.warn('⚠️ 读取 Cypress 报告失败：', e.message);
}

// 第二步：验证邮箱配置
if (!config.host || !config.user || !config.pass || !config.to) {
  console.error('❌ 缺少邮箱配置！请检查 GitHub Secrets。');
  process.exit(1);
}

// 第三步：构建邮件内容
const statusText = config.jobStatus === 'success' ? '✅ 测试成功' : '❌ 测试失败';
const triggerText = {
  schedule: '定时任务',
  push: '代码推送',
  workflow_dispatch: '手动触发'
}[config.trigger] || '未知触发';
const runUrl = `https://github.com/${config.repo}/actions/runs/${config.runId}`;

// 构建失败详情 HTML（如果有失败用例）
let failureDetails = '';
if (cypressResult.failed > 0) {
  failureDetails = `
    <div style="margin: 10px 0; padding: 10px; background: #f8d7da; border-radius: 4px;">
      <h4>❌ 失败用例详情（共 ${cypressResult.failed} 个）：</h4>
      <ul style="margin: 0; padding-left: 20px; color: #721c24;">
        ${cypressResult.failures.map(fail => `
          <li>
            <strong>用例名称：</strong>${fail.name}<br>
            <strong>失败原因：</strong>${fail.error}
          </li>
        `).join('')}
      </ul>
    </div>
  `;
}

// 第四步：配置 SMTP 传输器
const transporter = nodemailer.createTransport({
  host: config.host,
  port: config.port,
  secure: true,
  auth: {
    user: config.user,
    pass: config.pass
  }
});

// 第五步：定义邮件选项
const mailOptions = {
  from: `GitHub Actions <${config.user}>`,
  to: config.to,
  subject: `【Cypress 测试】${config.repo} - ${statusText}（通过：${cypressResult.passed}/${cypressResult.total}）`,
  html: `
    <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto;">
      <h2 style="color: #333;">Cypress 端到端测试结果通知</h2>
      <hr style="border: 1px solid #eee;">
      <p><strong>仓库名称：</strong>${config.repo}</p>
      <p><strong>运行状态：</strong>${statusText}</p>
      <p><strong>触发方式：</strong>${triggerText}</p>
      <p><strong>测试统计：</strong>总用例 ${cypressResult.total} · 通过 ${cypressResult.passed} · 失败 ${cypressResult.failed}</p>
      <p><strong>运行日志：</strong><a href="${runUrl}" target="_blank">点击查看完整日志</a></p>
      <p><strong>发送时间：</strong>${new Date().toLocaleString('zh-CN')}</p>
      
      ${failureDetails} <!-- 失败详情（有失败才显示） -->
      
      <div style="margin-top: 20px; font-size: 12px; color: #999;">
        此邮件由 GitHub Actions 自动发送，无需回复。
      </div>
    </div>
  `
};

// 第六步：发送邮件
transporter.sendMail(mailOptions, (error, info) => {
  if (error) {
    console.error(`❌ 邮件发送失败：${error.message}`);
    process.exit(1);
  }
  console.log(`✅ 邮件发送成功！响应：${info.response}`);
  process.exit(0);
});
