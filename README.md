# Image Converter MCP Server

一个功能强大的图片转换 MCP (Model Context Protocol) 服务器，支持多种图片格式转换、智能压缩优化和批量处理。

## 🚀 功能特性

### 基础功能
- **多格式支持**: PNG, JPG/JPEG, ICO, WebP, AVIF, TIFF, BMP
- **单文件转换**: 高质量的单个图片格式转换
- **批量转换**: 支持目录批量处理，可递归处理子目录
- **图片信息获取**: 获取图片的详细信息（格式、尺寸、大小等）

### 高级功能
- **智能压缩优化**: 自动选择最佳压缩参数
- **渐进式 JPEG**: 支持渐进式 JPEG 输出
- **图片分析**: 分析图片特征并提供优化建议
- **文件大小预测**: 转换前预测输出文件大小
- **网页优化**: 一键优化图片用于网页显示
- **尺寸调整**: 支持转换时调整图片尺寸

## 📦 安装

```bash
# 克隆项目
git clone <https://github.com/zhaoxi7109/image-converter-mcp-server.git>
cd image-converter-mcp-server

# 安装依赖
npm install
```

## 🛠️ 使用方法

### 作为 MCP 服务器运行

```bash
npm start
```

### 配置 MCP 客户端

在你的 MCP 客户端配置文件中添加：

```json
{
  "mcpServers": {
    "image-converter": {
      "command": "node",
      "args": ["path/to/image-converter-mcp-server/index.js"],
      "env": {}
    }
  }
}
```

## 可用工具

### 1. convert_image - 单个图片转换

将单个图片转换为指定格式。

**参数：**
- `inputPath` (必需): 输入图片文件路径
- `outputPath` (必需): 输出图片文件路径
- `format` (必需): 目标格式 (png/jpg/jpeg/ico)
- `quality` (可选): JPEG质量 (1-100，默认80)
- `width` (可选): 输出宽度
- `height` (可选): 输出高度

**示例：**
```json
{
  "inputPath": "./input/logo.svg",
  "outputPath": "./output/logo.png",
  "format": "png",
  "width": 256,
  "height": 256
}
```

### 2. batch_convert_images - 批量图片转换

批量转换目录中的图片文件。

**参数：**
- `inputDir` (必需): 输入目录路径
- `outputDir` (必需): 输出目录路径
- `format` (必需): 目标格式 (png/jpg/jpeg/ico)
- `pattern` (可选): 文件匹配模式 (默认 "*.*")
- `quality` (可选): JPEG质量 (1-100，默认80)
- `width` (可选): 输出宽度
- `height` (可选): 输出高度
- `recursive` (可选): 是否递归处理子目录 (默认false)

**示例：**
```json
{
  "inputDir": "./images/svg",
  "outputDir": "./images/png",
  "format": "png",
  "pattern": "*.svg",
  "recursive": true
}
```

### 3. get_image_info - 获取图片信息

获取图片的详细元数据信息。

**参数：**
- `imagePath` (必需): 图片文件路径

**示例：**
```json
{
  "imagePath": "./image.png"
}
```

## 支持的输入格式

- SVG (矢量图)
- PNG (便携式网络图形)
- JPG/JPEG (联合图像专家组)
- GIF (图形交换格式)
- WebP (网络图片格式)
- TIFF (标记图像文件格式)
- BMP (位图)
- ICO (图标格式)

## 支持的输出格式

- PNG - 无损压缩，支持透明度
- JPG/JPEG - 有损压缩，适合照片
- ICO - Windows图标格式

## 使用场景

1. **网站开发**: 将 SVG 图标转换为 PNG 格式用于兼容性
2. **应用开发**: 批量生成不同尺寸的应用图标
3. **图片优化**: 调整图片质量和尺寸以优化文件大小
4. **格式标准化**: 将混合格式的图片统一转换为特定格式

## 技术栈

- **Node.js**: 运行环境
- **Sharp**: 高性能图片处理库
- **to-ico**: ICO格式转换
- **MCP SDK**: Model Context Protocol 支持
- **fs-extra**: 增强的文件系统操作
- **glob**: 文件模式匹配

## 注意事项

1. 确保有足够的磁盘空间进行批量转换
2. ICO 格式转换可能需要更多处理时间
3. 大尺寸图片转换时请耐心等待
4. 建议在转换前备份原始文件

## 错误处理

服务器包含完善的错误处理机制：
- 文件不存在检查
- 格式支持验证
- 批量处理中的单个文件错误不会影响其他文件
- 详细的错误信息反馈

## 许可证

MIT License