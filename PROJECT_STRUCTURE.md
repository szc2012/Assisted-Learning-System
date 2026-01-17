# 在线出题软件 - 项目结构说明

## 项目概述

这是一个功能完整的在线出题系统，支持数学题生成、古诗默写、英语默写和AI智能问答功能。系统支持在线练习和Word文档导出，并集成了Ollama AI实现完全离线的智能问答。

## 项目结构

```
app/
├── app.py                      # Flask后端主程序
├── requirements.txt            # Python依赖包列表
├── windows_installer.bat       # Windows一键安装脚本
├── install_ollama.py           # Ollama和模型下载脚本
├── start.sh                    # macOS/Linux启动脚本
├── README_WINDOWS.md           # Windows安装和使用指南
├── OLLAMA_GUIDE.md            # Ollama AI功能使用指南
├── .gitignore                  # Git忽略文件配置
│
├── data/                       # 数据目录
│   ├── math_config.json        # 数学题配置文件
│   ├── poetry.json             # 古诗数据文件
│   ├── english.json            # 英语词汇数据文件
│   └── *.docx                  # 生成的Word文档（运行时）
│
├── templates/                  # HTML模板目录
│   └── index.html              # 主页面模板
│
└── static/                     # 静态资源目录
    ├── css/
    │   └── style.css           # 样式文件
    └── js/
        └── app.js              # 前端JavaScript代码
```

## 核心文件说明

### 后端文件

#### [app.py](app.py)
Flask后端主程序，包含：
- 数学题生成API
- 古诗默写API
- 英语默写API
- Word文档导出功能
- AI问答API（Ollama集成）
- 练习报告生成功能

**主要API端点：**
- `GET /` - 主页面
- `GET /api/math/config` - 获取数学题配置
- `POST /api/generate/math` - 生成数学题
- `POST /api/download/math` - 下载数学题Word文档
- `GET /api/poetry/list` - 获取古诗列表
- `POST /api/generate/poetry` - 生成古诗默写题
- `POST /api/download/poetry` - 下载古诗默写Word文档
- `GET /api/english/units` - 获取英语单元列表
- `POST /api/generate/english` - 生成英语默写题
- `POST /api/download/english` - 下载英语默写Word文档
- `POST /api/check/answers` - 检查答案
- `POST /api/download/report` - 下载练习报告
- `GET /api/ai/status` - 检查AI服务状态
- `POST /api/ai/chat` - AI问答
- `GET /api/ai/models` - 获取可用AI模型

#### [requirements.txt](requirements.txt)
Python依赖包列表：
```
Flask==3.0.0          # Web框架
python-docx==1.1.0    # Word文档生成
ollama==0.4.7         # Ollama AI集成
```

### 安装脚本

#### [windows_installer.bat](windows_installer.bat)
Windows一键安装脚本，自动完成：
1. 检测和安装Python
2. 检测和安装pip
3. 创建虚拟环境
4. 安装项目依赖
5. 创建启动脚本
6. 下载和安装Ollama AI模型

#### [install_ollama.py](install_ollama.py)
Ollama和模型下载脚本，支持：
- 自动检测操作系统
- 下载对应平台的Ollama
- 下载qwen2.5:0.5b模型
- 跨平台支持（Windows/macOS/Linux）

### 前端文件

#### [templates/index.html](templates/index.html)
主页面HTML模板，包含：
- 数学题生成界面
- 古诗默写界面
- 英语默写界面
- AI问答界面
- 在线练习界面

#### [static/css/style.css](static/css/style.css)
样式文件，包含：
- 响应式布局
- 美观的UI设计
- 聊天界面样式
- 移动端适配

#### [static/js/app.js](static/js/app.js)
前端JavaScript代码，包含：
- 标签页切换
- 数学题生成和下载
- 古诗默写生成和下载
- 英语默写生成和下载
- 在线练习功能
- AI问答功能
- 答案检查功能

### 数据文件

#### [data/math_config.json](data/math_config.json)
数学题配置文件，结构：
```json
{
  "grade_levels": [
    {
      "id": "1-2",
      "name": "1-2年级",
      "categories": [
        {
          "id": "addition_within_20",
          "name": "20以内加减法",
          "types": [
            {
              "id": "oral_calculation",
              "name": "口算",
              "examples": ["8+5", "13-4"]
            }
          ]
        }
      ]
    }
  ]
}
```

#### [data/poetry.json](data/poetry.json)
古诗数据文件，结构：
```json
[
  {
    "id": "poem_001",
    "name": "古诗标题",
    "author": "作者",
    "content": ["第一句", "第二句", "第三句", "第四句"]
  }
]
```

#### [data/english.json](data/english.json)
英语词汇数据文件，结构：
```json
[
  {
    "unit": "Unit 1",
    "words": [
      {
        "english": "hello",
        "chinese": "你好"
      }
    ]
  }
]
```

### 文档文件

#### [README_WINDOWS.md](README_WINDOWS.md)
Windows安装和使用指南，包含：
- 快速开始指南
- 手动安装步骤
- 详细使用说明
- Word导出格式说明
- 常见问题解答
- 数据导入指南

#### [OLLAMA_GUIDE.md](OLLAMA_GUIDE.md)
Ollama AI功能使用指南，包含：
- 功能特点介绍
- 快速开始指南
- 手动安装步骤
- 使用方法说明
- 常见问题解答
- 高级配置说明
- 技术细节

## 功能模块

### 1. 数学题生成
- 支持1-2年级、3-4年级、5-6年级
- 多种题型：口算、笔算、应用题等
- 自动生成题目和答案
- 支持在线练习和Word导出

### 2. 古诗默写
- 支持多选古诗
- 生成上下句默写题
- 支持在线练习和Word导出
- 楷体字体，两列布局

### 3. 英语默写
- 支持单元选择
- 支持中译英和英译汉
- 支持在线练习和Word导出
- Times New Roman字体，三列布局

### 4. AI智能问答
- 集成Ollama AI
- 使用qwen2.5:0.5b模型
- 完全离线使用
- 支持中英文问答
- 聊天界面交互

### 5. 在线练习
- 实时答案检查
- 正确率统计
- 练习报告生成
- Word格式导出

## 部署说明

### Windows部署
1. 复制整个项目文件夹到目标电脑
2. 右键点击`windows_installer.bat`，选择"以管理员身份运行"
3. 按照提示完成安装
4. 双击`start.bat`启动程序
5. 在浏览器访问http://127.0.0.1:3000

### macOS/Linux部署
1. 复制整个项目文件夹到目标电脑
2. 运行安装命令：
   ```bash
   python3 -m venv venv
   source venv/bin/activate
   pip install -r requirements.txt
   ```
3. 下载Ollama（可选）：
   ```bash
   python3 install_ollama.py
   ```
4. 启动程序：
   ```bash
   python3 app.py
   ```
5. 在浏览器访问http://127.0.0.1:3000

## 离线使用

项目支持完全离线使用：

1. **首次安装需要网络**：下载Python依赖和Ollama模型
2. **安装完成后可离线**：所有功能在本地运行
3. **AI功能完全离线**：Ollama模型在本地运行，无需网络

## 系统要求

### 最低配置
- 操作系统：Windows 7+、macOS 10.15+、Linux
- Python：3.8+
- 内存：4GB RAM
- 硬盘空间：2GB可用空间

### 推荐配置
- 操作系统：Windows 10+、macOS 11+、Linux
- Python：3.11+
- 内存：8GB RAM
- 硬盘空间：5GB可用空间

## 特色功能

1. **一键安装**：Windows用户只需双击运行安装脚本
2. **完全离线**：安装完成后无需网络连接
3. **美观界面**：现代化的UI设计，响应式布局
4. **智能AI**：集成Ollama实现本地AI问答
5. **多格式导出**：支持Word文档导出，格式规范
6. **在线练习**：实时检查答案，生成练习报告

## 扩展性

项目设计具有良好的扩展性：

1. **添加新题型**：修改`math_config.json`添加新的数学题型
2. **添加新数据**：在`data/`目录添加新的JSON数据文件
3. **更换AI模型**：下载其他Ollama模型并修改配置
4. **自定义样式**：修改`style.css`自定义界面样式
5. **添加新功能**：在`app.py`添加新的API端点

## 技术栈

- **后端**：Flask（Python Web框架）
- **前端**：HTML5 + CSS3 + JavaScript
- **文档生成**：python-docx
- **AI集成**：Ollama + Qwen2.5
- **部署**：跨平台支持

## 许可证

本项目遵循MIT许可证。

## 联系方式

如有问题或建议，欢迎反馈。