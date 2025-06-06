#!/usr/bin/env node

import fs from 'fs-extra';
import path from 'path';

// 创建测试用的SVG文件
const createTestSVG = async () => {
  const testDir = './test-images';
  await fs.ensureDir(testDir);
  
  const svgContent = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="100" height="100" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <circle cx="50" cy="50" r="40" stroke="black" stroke-width="3" fill="red" />
  <text x="50" y="55" font-family="Arial" font-size="14" text-anchor="middle" fill="white">TEST</text>
</svg>`;
  
  await fs.writeFile(path.join(testDir, 'test-circle.svg'), svgContent);
  
  const rectSvg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="200" height="100" viewBox="0 0 200 100" xmlns="http://www.w3.org/2000/svg">
  <rect x="10" y="10" width="180" height="80" stroke="blue" stroke-width="2" fill="yellow" />
  <text x="100" y="55" font-family="Arial" font-size="16" text-anchor="middle" fill="black">RECTANGLE</text>
</svg>`;
  
  await fs.writeFile(path.join(testDir, 'test-rect.svg'), rectSvg);
  
  console.log('✓ 测试SVG文件已创建在 ./test-images/ 目录');
};

// 创建测试目录结构
const createTestStructure = async () => {
  const dirs = [
    './test-images/input',
    './test-images/output',
    './test-images/batch-input',
    './test-images/batch-output'
  ];
  
  for (const dir of dirs) {
    await fs.ensureDir(dir);
  }
  
  console.log('✓ 测试目录结构已创建');
};

// 主测试函数
const runTests = async () => {
  try {
    console.log('🧪 开始创建测试环境...');
    
    await createTestStructure();
    await createTestSVG();
    
    console.log('\n📋 测试环境创建完成！');
    console.log('\n可以使用以下测试用例：');
    console.log('\n1. 单个文件转换测试：');
    console.log('   输入: ./test-images/test-circle.svg');
    console.log('   输出: ./test-images/output/test-circle.png');
    console.log('   格式: png');
    
    console.log('\n2. 批量转换测试：');
    console.log('   输入目录: ./test-images/');
    console.log('   输出目录: ./test-images/batch-output/');
    console.log('   格式: png');
    console.log('   模式: *.svg');
    
    console.log('\n3. 图片信息获取测试：');
    console.log('   图片路径: ./test-images/test-circle.svg');
    
    console.log('\n🚀 现在可以启动 MCP 服务器进行测试：');
    console.log('   npm start');
    
  } catch (error) {
    console.error('❌ 测试环境创建失败:', error.message);
  }
};

runTests();