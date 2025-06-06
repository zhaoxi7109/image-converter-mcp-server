import sharp from 'sharp';
import fs from 'fs-extra';
import path from 'path';

/**
 * 图片优化助手类
 * 提供智能压缩建议和格式推荐
 */
export class ImageOptimizer {
  
  /**
   * 分析图片并提供优化建议
   * @param {string} imagePath - 图片路径
   * @returns {Object} 优化建议
   */
  static async analyzeImage(imagePath) {
    try {
      const metadata = await sharp(imagePath).metadata();
      const stats = await fs.stat(imagePath);
      const fileSizeKB = stats.size / 1024;
      
      const analysis = {
        currentFormat: metadata.format,
        width: metadata.width,
        height: metadata.height,
        channels: metadata.channels,
        hasAlpha: metadata.channels === 4,
        fileSizeKB: Math.round(fileSizeKB * 100) / 100,
        recommendations: []
      };
      
      // 基于图片特征提供格式建议
      if (analysis.hasAlpha) {
        analysis.recommendations.push({
          format: 'png',
          reason: '图片包含透明通道，PNG格式最适合',
          priority: 'high'
        });
        analysis.recommendations.push({
          format: 'webp',
          reason: 'WebP支持透明度且压缩率更高',
          priority: 'medium'
        });
      } else {
        // 照片类图片
        if (metadata.width > 800 || metadata.height > 600) {
          analysis.recommendations.push({
            format: 'jpeg',
            reason: '大尺寸照片，JPEG压缩效果好',
            priority: 'high',
            suggestedQuality: 85
          });
          analysis.recommendations.push({
            format: 'webp',
            reason: 'WebP在保持质量的同时文件更小',
            priority: 'high',
            suggestedQuality: 80
          });
          analysis.recommendations.push({
            format: 'avif',
            reason: 'AVIF提供最佳压缩率（需要浏览器支持）',
            priority: 'medium',
            suggestedQuality: 75
          });
        } else {
          // 小图标或简单图形
          analysis.recommendations.push({
            format: 'png',
            reason: '小尺寸图形，PNG无损压缩适合',
            priority: 'high'
          });
          analysis.recommendations.push({
            format: 'webp',
            reason: 'WebP在小图片上也有不错的压缩效果',
            priority: 'medium'
          });
        }
      }
      
      // 文件大小建议
      if (fileSizeKB > 1000) {
        analysis.recommendations.push({
          type: 'compression',
          suggestion: '文件较大，建议启用高级压缩优化',
          priority: 'high'
        });
      }
      
      if (fileSizeKB > 500 && (metadata.width > 1920 || metadata.height > 1080)) {
        analysis.recommendations.push({
          type: 'resize',
          suggestion: `建议调整尺寸到合适大小，当前${metadata.width}x${metadata.height}可能过大`,
          priority: 'medium',
          suggestedWidth: Math.min(1920, metadata.width),
          suggestedHeight: Math.min(1080, metadata.height)
        });
      }
      
      return analysis;
    } catch (error) {
      throw new Error(`图片分析失败: ${error.message}`);
    }
  }
  
  /**
   * 预测转换后的文件大小
   * @param {string} imagePath - 原图片路径
   * @param {string} targetFormat - 目标格式
   * @param {number} quality - 质量设置
   * @returns {Object} 预测结果
   */
  static async predictFileSize(imagePath, targetFormat, quality = 80) {
    try {
      const metadata = await sharp(imagePath).metadata();
      const originalStats = await fs.stat(imagePath);
      const originalSizeKB = originalStats.size / 1024;
      
      // 基于经验的压缩率估算
      const compressionRatios = {
        png: 0.8,  // PNG通常比原图小20%
        jpeg: quality > 90 ? 0.7 : quality > 70 ? 0.4 : 0.25,
        webp: quality > 90 ? 0.6 : quality > 70 ? 0.3 : 0.2,
        avif: quality > 90 ? 0.5 : quality > 70 ? 0.25 : 0.15,
        tiff: 1.2,  // TIFF通常比原图大
        bmp: 3.0,   // BMP无压缩，通常很大
        ico: 0.5    // ICO通常较小
      };
      
      const ratio = compressionRatios[targetFormat] || 1.0;
      const predictedSizeKB = Math.round(originalSizeKB * ratio * 100) / 100;
      
      return {
        originalSizeKB: Math.round(originalSizeKB * 100) / 100,
        predictedSizeKB,
        compressionRatio: Math.round((1 - ratio) * 100),
        savingsKB: Math.round((originalSizeKB - predictedSizeKB) * 100) / 100
      };
    } catch (error) {
      throw new Error(`文件大小预测失败: ${error.message}`);
    }
  }
  
  /**
   * 获取格式特定的最佳质量建议
   * @param {string} format - 图片格式
   * @param {string} useCase - 使用场景 (web, print, thumbnail)
   * @returns {Object} 质量建议
   */
  static getQualityRecommendation(format, useCase = 'web') {
    const recommendations = {
      web: {
        jpeg: { quality: 85, progressive: true },
        webp: { quality: 80, effort: 6 },
        avif: { quality: 75, effort: 6 },
        png: { compressionLevel: 9, optimize: true }
      },
      print: {
        jpeg: { quality: 95, progressive: false },
        webp: { quality: 90, effort: 6 },
        avif: { quality: 85, effort: 9 },
        png: { compressionLevel: 6, optimize: true }
      },
      thumbnail: {
        jpeg: { quality: 75, progressive: false },
        webp: { quality: 70, effort: 4 },
        avif: { quality: 65, effort: 4 },
        png: { compressionLevel: 9, optimize: true }
      }
    };
    
    return recommendations[useCase]?.[format] || { quality: 80 };
  }
}