#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import sharp from 'sharp';
import toIco from 'to-ico';
import fs from 'fs-extra';
import path from 'path';
import { glob } from 'glob';
import { ImageOptimizer } from './optimize-helper.js';

class ImageConverterServer {
  constructor() {
    this.server = new Server(
      {
        name: 'image-converter-mcp-server',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.setupToolHandlers();
  }

  setupToolHandlers() {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          {
            name: 'convert_image',
            description: '将单个图片转换为指定格式（PNG、JPG、JPEG、ICO）',
            inputSchema: {
              type: 'object',
              properties: {
                inputPath: {
                  type: 'string',
                  description: '输入图片文件路径'
                },
                outputPath: {
                  type: 'string',
                  description: '输出图片文件路径'
                },
                format: {
                  type: 'string',
                  enum: ['png', 'jpg', 'jpeg', 'ico', 'webp', 'avif', 'tiff', 'bmp'],
                  description: '目标格式'
                },
                quality: {
                  type: 'number',
                  minimum: 1,
                  maximum: 100,
                  description: '图片质量（1-100，适用于JPEG/WebP/AVIF）',
                  default: 80
                },
                optimize: {
                  type: 'boolean',
                  description: '是否启用智能压缩优化',
                  default: true
                },
                progressive: {
                  type: 'boolean',
                  description: '是否使用渐进式编码（适用于JPEG）',
                  default: false
                },
                width: {
                  type: 'number',
                  description: '输出宽度（可选）'
                },
                height: {
                  type: 'number',
                  description: '输出高度（可选）'
                }
              },
              required: ['inputPath', 'outputPath', 'format']
            }
          },
          {
            name: 'batch_convert_images',
            description: '批量转换图片格式',
            inputSchema: {
              type: 'object',
              properties: {
                inputDir: {
                  type: 'string',
                  description: '输入目录路径'
                },
                outputDir: {
                  type: 'string',
                  description: '输出目录路径'
                },
                format: {
                  type: 'string',
                  enum: ['png', 'jpg', 'jpeg', 'ico', 'webp', 'avif', 'tiff', 'bmp'],
                  description: '目标格式'
                },
                pattern: {
                  type: 'string',
                  description: '文件匹配模式（如 *.svg, *.png）',
                  default: '*.*'
                },
                quality: {
                  type: 'number',
                  minimum: 1,
                  maximum: 100,
                  description: '图片质量（1-100，适用于JPEG/WebP/AVIF）',
                  default: 80
                },
                optimize: {
                  type: 'boolean',
                  description: '是否启用智能压缩优化',
                  default: true
                },
                progressive: {
                  type: 'boolean',
                  description: '是否使用渐进式编码（适用于JPEG）',
                  default: false
                },
                width: {
                  type: 'number',
                  description: '输出宽度（可选）'
                },
                height: {
                  type: 'number',
                  description: '输出高度（可选）'
                },
                recursive: {
                  type: 'boolean',
                  description: '是否递归处理子目录',
                  default: false
                }
              },
              required: ['inputDir', 'outputDir', 'format']
            }
          },
          {
            name: 'get_image_info',
            description: '获取图片信息（格式、尺寸等）',
            inputSchema: {
              type: 'object',
              properties: {
                imagePath: {
                  type: 'string',
                  description: '图片文件路径'
                }
              },
              required: ['imagePath']
            }
          },
          {
            name: 'analyze_image',
            description: '分析图片并提供优化建议',
            inputSchema: {
              type: 'object',
              properties: {
                imagePath: {
                  type: 'string',
                  description: '图片文件路径'
                }
              },
              required: ['imagePath']
            }
          },
          {
            name: 'predict_file_size',
            description: '预测转换后的文件大小',
            inputSchema: {
              type: 'object',
              properties: {
                imagePath: {
                  type: 'string',
                  description: '图片文件路径'
                },
                targetFormat: {
                  type: 'string',
                  enum: ['png', 'jpg', 'jpeg', 'ico', 'webp', 'avif', 'tiff', 'bmp'],
                  description: '目标格式'
                },
                quality: {
                  type: 'number',
                  minimum: 1,
                  maximum: 100,
                  description: '质量设置',
                  default: 80
                }
              },
              required: ['imagePath', 'targetFormat']
            }
          },
          {
            name: 'optimize_for_web',
            description: '针对网页使用优化图片',
            inputSchema: {
              type: 'object',
              properties: {
                inputPath: {
                  type: 'string',
                  description: '输入图片文件路径'
                },
                outputPath: {
                  type: 'string',
                  description: '输出图片文件路径'
                },
                maxWidth: {
                  type: 'number',
                  description: '最大宽度',
                  default: 1920
                },
                maxHeight: {
                  type: 'number',
                  description: '最大高度',
                  default: 1080
                }
              },
              required: ['inputPath', 'outputPath']
            }
          }
        ]
      };
    });

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          case 'convert_image':
            return await this.convertImage(args);
          case 'batch_convert_images':
            return await this.batchConvertImages(args);
          case 'get_image_info':
            return await this.getImageInfo(args);
          case 'analyze_image':
            return await this.analyzeImage(args);
          case 'predict_file_size':
            return await this.predictFileSize(args);
          case 'optimize_for_web':
            return await this.optimizeForWeb(args);
          default:
            throw new Error(`未知工具: ${name}`);
        }
      } catch (error) {
        return {
          content: [
            {
              type: 'text',
              text: `错误: ${error.message}`
            }
          ]
        };
      }
    });
  }

  async convertImage(args) {
    const { inputPath, outputPath, format, quality = 80, width, height, optimize = true, progressive = false } = args;

    // 检查输入文件是否存在
    if (!await fs.pathExists(inputPath)) {
      throw new Error(`输入文件不存在: ${inputPath}`);
    }

    // 确保输出目录存在
    await fs.ensureDir(path.dirname(outputPath));

    let result;

    if (format === 'ico') {
      // 使用 to-ico 库处理 ICO 格式
      const inputBuffer = await fs.readFile(inputPath);
      let processedBuffer = inputBuffer;

      // 如果需要调整尺寸，先用 sharp 处理
      if (width || height) {
        processedBuffer = await sharp(inputBuffer)
          .resize(width, height, { fit: 'contain' })
          .png()
          .toBuffer();
      }

      const icoBuffer = await toIco([processedBuffer]);
      await fs.writeFile(outputPath, icoBuffer);
      result = `成功转换为ICO格式: ${outputPath}`;
    } else {
      // 使用 sharp 处理其他格式
      let sharpInstance = sharp(inputPath);

      // 调整尺寸
      if (width || height) {
        sharpInstance = sharpInstance.resize(width, height, { fit: 'contain' });
      }

      // 设置输出格式和优化选项
      switch (format) {
        case 'png':
          sharpInstance = sharpInstance.png({
            compressionLevel: optimize ? 9 : 6,
            adaptiveFiltering: optimize,
            palette: optimize
          });
          break;
        case 'jpg':
        case 'jpeg':
          sharpInstance = sharpInstance.jpeg({ 
            quality,
            progressive,
            mozjpeg: optimize,
            optimiseScans: optimize,
            overshootDeringing: optimize
          });
          break;
        case 'webp':
          sharpInstance = sharpInstance.webp({
            quality,
            effort: optimize ? 6 : 4,
            smartSubsample: optimize
          });
          break;
        case 'avif':
          sharpInstance = sharpInstance.avif({
            quality,
            effort: optimize ? 9 : 4,
            chromaSubsampling: '4:2:0'
          });
          break;
        case 'tiff':
          sharpInstance = sharpInstance.tiff({
            compression: optimize ? 'lzw' : 'none',
            quality
          });
          break;
        case 'bmp':
          // Sharp 不直接支持 BMP 输出，转换为 PNG 格式
          sharpInstance = sharpInstance.png();
          break;
      }

      await sharpInstance.toFile(outputPath);
      result = `成功转换为${format.toUpperCase()}格式: ${outputPath}`;
    }

    return {
      content: [
        {
          type: 'text',
          text: result
        }
      ]
    };
  }

  async batchConvertImages(args) {
    const { 
      inputDir, 
      outputDir, 
      format, 
      pattern = '*.*', 
      quality = 80, 
      width, 
      height, 
      recursive = false,
      optimize = true,
      progressive = false
    } = args;

    // 检查输入目录是否存在
    if (!await fs.pathExists(inputDir)) {
      throw new Error(`输入目录不存在: ${inputDir}`);
    }

    // 确保输出目录存在
    await fs.ensureDir(outputDir);

    // 构建glob模式
    const globPattern = recursive 
      ? path.join(inputDir, '**', pattern)
      : path.join(inputDir, pattern);

    // 查找匹配的文件
    const files = await glob(globPattern, { nodir: true });
    
    if (files.length === 0) {
      return {
        content: [
          {
            type: 'text',
            text: `未找到匹配的文件: ${globPattern}`
          }
        ]
      };
    }

    const results = [];
    const errors = [];

    for (const file of files) {
      try {
        const relativePath = path.relative(inputDir, file);
        const outputFileName = path.parse(relativePath).name + '.' + format;
        const outputPath = path.join(outputDir, path.dirname(relativePath), outputFileName);

        await this.convertImage({
          inputPath: file,
          outputPath,
          format,
          quality,
          width,
          height,
          optimize,
          progressive
        });

        results.push(`✓ ${file} -> ${outputPath}`);
      } catch (error) {
        errors.push(`✗ ${file}: ${error.message}`);
      }
    }

    const summary = [
      `批量转换完成！`,
      `成功: ${results.length} 个文件`,
      `失败: ${errors.length} 个文件`,
      '',
      '成功的转换:',
      ...results
    ];

    if (errors.length > 0) {
      summary.push('', '失败的转换:', ...errors);
    }

    return {
      content: [
        {
          type: 'text',
          text: summary.join('\n')
        }
      ]
    };
  }

  async getImageInfo(args) {
    const { imagePath } = args;

    if (!await fs.pathExists(imagePath)) {
      throw new Error(`图片文件不存在: ${imagePath}`);
    }

    try {
      const metadata = await sharp(imagePath).metadata();
      const stats = await fs.stat(imagePath);

      const info = {
        文件路径: imagePath,
        格式: metadata.format,
        宽度: metadata.width,
        高度: metadata.height,
        通道数: metadata.channels,
        颜色空间: metadata.space,
        文件大小: `${(stats.size / 1024).toFixed(2)} KB`,
        创建时间: stats.birthtime.toLocaleString(),
        修改时间: stats.mtime.toLocaleString()
      };

      const infoText = Object.entries(info)
        .map(([key, value]) => `${key}: ${value}`)
        .join('\n');

      return {
        content: [
          {
            type: 'text',
            text: `图片信息:\n${infoText}`
          }
        ]
      };
    } catch (error) {
      throw new Error(`无法读取图片信息: ${error.message}`);
    }
  }

  async analyzeImage(args) {
    const { imagePath } = args;

    try {
      const analysis = await ImageOptimizer.analyzeImage(imagePath);
      
      let analysisText = `图片分析结果:\n\n`;
      analysisText += `当前格式: ${analysis.currentFormat}\n`;
      analysisText += `尺寸: ${analysis.width}x${analysis.height}\n`;
      analysisText += `通道数: ${analysis.channels}${analysis.hasAlpha ? ' (包含透明通道)' : ''}\n`;
      analysisText += `文件大小: ${analysis.fileSizeKB} KB\n\n`;
      
      if (analysis.recommendations.length > 0) {
        analysisText += `优化建议:\n`;
        analysis.recommendations.forEach((rec, index) => {
          analysisText += `${index + 1}. `;
          if (rec.format) {
            analysisText += `推荐格式: ${rec.format.toUpperCase()}`;
            if (rec.suggestedQuality) {
              analysisText += ` (质量: ${rec.suggestedQuality})`;
            }
            analysisText += `\n   原因: ${rec.reason}\n`;
          } else {
            analysisText += `${rec.suggestion}\n`;
          }
          analysisText += `   优先级: ${rec.priority}\n\n`;
        });
      }

      return {
        content: [
          {
            type: 'text',
            text: analysisText
          }
        ]
      };
    } catch (error) {
      throw new Error(`图片分析失败: ${error.message}`);
    }
  }

  async predictFileSize(args) {
    const { imagePath, targetFormat, quality = 80 } = args;

    try {
      const prediction = await ImageOptimizer.predictFileSize(imagePath, targetFormat, quality);
      
      const predictionText = `文件大小预测:\n\n` +
        `原始大小: ${prediction.originalSizeKB} KB\n` +
        `预测大小: ${prediction.predictedSizeKB} KB\n` +
        `压缩率: ${prediction.compressionRatio}%\n` +
        `节省空间: ${prediction.savingsKB} KB`;

      return {
        content: [
          {
            type: 'text',
            text: predictionText
          }
        ]
      };
    } catch (error) {
      throw new Error(`文件大小预测失败: ${error.message}`);
    }
  }

  async optimizeForWeb(args) {
    const { inputPath, outputPath, maxWidth = 1920, maxHeight = 1080 } = args;

    try {
      // 分析图片获取优化建议
      const analysis = await ImageOptimizer.analyzeImage(inputPath);
      
      // 确定最佳格式
      let bestFormat = 'jpeg';
      let quality = 85;
      
      if (analysis.hasAlpha) {
        bestFormat = 'webp';
        quality = 80;
      } else if (analysis.width <= 800 && analysis.height <= 600) {
        bestFormat = 'png';
      }
      
      // 计算合适的尺寸
      let targetWidth = analysis.width;
      let targetHeight = analysis.height;
      
      if (analysis.width > maxWidth || analysis.height > maxHeight) {
        const widthRatio = maxWidth / analysis.width;
        const heightRatio = maxHeight / analysis.height;
        const ratio = Math.min(widthRatio, heightRatio);
        
        targetWidth = Math.round(analysis.width * ratio);
        targetHeight = Math.round(analysis.height * ratio);
      }
      
      // 执行优化转换
      await this.convertImage({
        inputPath,
        outputPath,
        format: bestFormat,
        quality,
        width: targetWidth !== analysis.width ? targetWidth : undefined,
        height: targetHeight !== analysis.height ? targetHeight : undefined,
        optimize: true,
        progressive: bestFormat === 'jpeg'
      });
      
      const resultText = `网页优化完成！\n\n` +
        `选择格式: ${bestFormat.toUpperCase()}\n` +
        `质量设置: ${quality}\n` +
        `原始尺寸: ${analysis.width}x${analysis.height}\n` +
        `优化尺寸: ${targetWidth}x${targetHeight}\n` +
        `输出文件: ${outputPath}`;

      return {
        content: [
          {
            type: 'text',
            text: resultText
          }
        ]
      };
    } catch (error) {
      throw new Error(`网页优化失败: ${error.message}`);
    }
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('Image Converter MCP Server 已启动');
  }
}

// 导出类供其他模块使用
export { ImageConverterServer };

// 如果直接运行此文件，启动服务器
if (import.meta.url === `file://${process.argv[1]}`) {
  const server = new ImageConverterServer();
  server.run().catch(console.error);
}