import { ImageConverterServer } from './index.js';
import path from 'path';
import fs from 'fs-extra';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 创建服务器实例
const server = new ImageConverterServer();

async function testAdvancedFeatures() {
  console.log('🚀 开始测试高级图片处理功能...');
  
  const testImagePath = path.join(__dirname, 'test-images', 'test-circle.svg');
  const outputDir = path.join(__dirname, 'test-images', 'advanced-output');
  
  // 确保输出目录存在
  await fs.ensureDir(outputDir);
  
  try {
    // 1. 测试图片分析功能
    console.log('\n📊 测试图片分析功能...');
    const analysisResult = await server.analyzeImage({ imagePath: testImagePath });
    console.log(analysisResult.content[0].text);
    
    // 2. 测试文件大小预测
    console.log('\n📏 测试文件大小预测...');
    const predictionResult = await server.predictFileSize({
      imagePath: testImagePath,
      targetFormat: 'webp',
      quality: 80
    });
    console.log(predictionResult.content[0].text);
    
    // 3. 测试网页优化功能
    console.log('\n🌐 测试网页优化功能...');
    const webOptimizedPath = path.join(outputDir, 'web-optimized.webp');
    const webOptResult = await server.optimizeForWeb({
      inputPath: testImagePath,
      outputPath: webOptimizedPath,
      maxWidth: 800,
      maxHeight: 600
    });
    console.log(webOptResult.content[0].text);
    
    // 4. 测试新格式转换
    console.log('\n🎨 测试新格式转换...');
    
    // WebP 格式
    const webpPath = path.join(outputDir, 'test-webp.webp');
    await server.convertImage({
      inputPath: testImagePath,
      outputPath: webpPath,
      format: 'webp',
      quality: 85,
      optimize: true
    });
    console.log(`✅ WebP 转换完成: ${webpPath}`);
    
    // AVIF 格式
    const avifPath = path.join(outputDir, 'test-avif.avif');
    await server.convertImage({
      inputPath: testImagePath,
      outputPath: avifPath,
      format: 'avif',
      quality: 75,
      optimize: true
    });
    console.log(`✅ AVIF 转换完成: ${avifPath}`);
    
    // TIFF 格式
    const tiffPath = path.join(outputDir, 'test-tiff.tiff');
    await server.convertImage({
      inputPath: testImagePath,
      outputPath: tiffPath,
      format: 'tiff',
      optimize: true
    });
    console.log(`✅ TIFF 转换完成: ${tiffPath}`);
    
    // BMP 格式（实际输出为 PNG）
    const bmpPath = path.join(outputDir, 'test-bmp.png');
    await server.convertImage({
      inputPath: testImagePath,
      outputPath: bmpPath,
      format: 'bmp'
    });
    console.log(`✅ BMP 格式转换完成（输出为 PNG）: ${bmpPath}`);
    
    // 5. 测试高质量 JPEG 转换（带渐进式）
    console.log('\n📸 测试高质量 JPEG 转换...');
    const jpegPath = path.join(outputDir, 'test-progressive.jpg');
    await server.convertImage({
      inputPath: testImagePath,
      outputPath: jpegPath,
      format: 'jpg',
      quality: 95,
      optimize: true,
      progressive: true
    });
    console.log(`✅ 渐进式 JPEG 转换完成: ${jpegPath}`);
    
    // 6. 检查所有生成的文件
    console.log('\n📁 检查生成的文件...');
    const files = await fs.readdir(outputDir);
    console.log('生成的文件列表:');
    for (const file of files) {
      const filePath = path.join(outputDir, file);
      const stats = await fs.stat(filePath);
      console.log(`  - ${file} (${Math.round(stats.size / 1024)} KB)`);
    }
    
    console.log('\n🎉 所有高级功能测试完成！');
    
  } catch (error) {
    console.error('❌ 测试过程中出现错误:', error.message);
  }
}

// 运行测试
testAdvancedFeatures().catch(console.error);