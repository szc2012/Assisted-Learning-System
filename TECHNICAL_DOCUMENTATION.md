# 智能辅助学习系统 - 技术文档

**版本**: v1.2.0  
**作者**: Song Zichen, Quan Hai Middle School  
**最后更新**: 2026-02-04

---

## 目录

1. [系统概述](#1-系统概述)
2. [系统架构](#2-系统架构)
3. [技术栈详解](#3-技术栈详解)
4. [项目结构详解](#4-项目结构详解)
5. [后端API文档](#5-后端api文档)
6. [数据模型设计](#6-数据模型设计)
7. [前端组件详解](#7-前端组件详解)
8. [AI集成详解](#8-ai集成详解)
9. [Word文档生成](#9-word文档生成)
10. [缓存机制](#10-缓存机制)
11. [安全性设计](#11-安全性设计)
12. [部署指南](#12-部署指南)
13. [性能优化](#13-性能优化)
14. [错误处理](#14-错误处理)
15. [扩展指南](#15-扩展指南)
16. [附录](#16-附录)

---

## 1. 系统概述

### 1.1 项目简介

智能辅助学习系统是一款专为初中生设计的在线学习辅助工具，集成了题目生成、在线练习、智能批改、Word导出和AI错题讲解等功能。系统采用现代Web技术栈，提供流畅的用户体验。

### 1.2 核心功能

| 功能模块 | 描述 | 技术实现 |
|---------|------|----------|
| 数学题生成 | 支持1-6年级多种题型 | 后端随机算法生成 |
| 古诗默写 | 支持上下句填空 | JSON数据驱动 |
| 英语默写 | 中英互译练习 | 单元词汇管理 |
| 在线练习 | 实时答题与批改 | 前端实时校验 |
| 练习报告 | Word格式详细报告 | python-docx生成 |
| AI问答 | 智能对话与讲解 | Ollama + Qwen2.5 |

### 1.3 设计原则

- **简洁性**: 界面简洁，操作直观
- **响应式**: 支持桌面端和移动端
- **离线优先**: 本地运行，无需网络
- **可扩展**: 模块化设计，易于扩展

---

## 2. 系统架构

### 2.1 整体架构图

```
┌─────────────────────────────────────────────────────────────────┐
│                         客户端 (Browser)                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐  │
│  │  index.html  │  │ ai_chat.html │  │    static/js/app.js  │  │
│  └──────────────┘  └──────────────┘  └──────────────────────┘  │
│                              │                                   │
│                    ┌─────────▼─────────┐                        │
│                    │   Fetch API       │                        │
│                    └─────────┬─────────┘                        │
└──────────────────────────────┼──────────────────────────────────┘
                               │ HTTP/SSE
┌──────────────────────────────┼──────────────────────────────────┐
│                         Flask Server                            │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │                       app.py                            │    │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────────┐  │    │
│  │  │  题目生成   │  │  Word导出   │  │    AI服务          │  │    │
│  │  │  generate_* │  │  create_*   │  │  ai_chat/explain│  │    │
│  │  └─────────────┘  └─────────────┘  └─────────────────┘  │    │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────────┐  │    │
│  │  │   缓存层    │  │   路由层    │  │    工具函数         │  │    │
│  │  │   cache     │  │  @app.route │  │  set_cell_border│  │    │
│  │  └─────────────┘  └─────────────┘  └─────────────────┘  │    │
│  └─────────────────────────────────────────────────────────┘    │
└──────────────────────────────┼──────────────────────────────────┘
                               │
         ┌─────────────────────┼─────────────────────┐
         │                     │                     │
┌────────▼────────┐  ┌─────────▼─────────┐  ┌───────▼───────┐
│   数据存储层    │  │    文档生成层     │  │   AI服务层         │
│  ┌───────────┐  │  │  ┌─────────────┐  │  │ ┌───────────┐ │
│  │poetry.json│  │  │  │ python-docx │  │  │ │  Ollama   │ │
│  ├───────────┤  │  │  │  Document   │  │  │ │  Server   │ │
│  │english.json│ │  │  │   Table     │  │  │ │ Qwen2.5   │ │
│  ├───────────┤  │  │  │ Paragraph   │  │  │ │  :0.5b    │ │
│  │math_config│  │  │  └─────────────┘  │  │ └───────────┘ │
│  └───────────┘  │  └───────────────────┘  └───────────────┘
└─────────────────┘
```

### 2.2 数据流图

```
用户操作 → 前端事件处理 → API请求 → Flask路由 → 业务逻辑 → 数据处理 → 响应返回 → 前端渲染
    │                                                                            │
    └────────────────────── 用户界面更新 ◄───────────────────────────────────────┘
```

### 2.3 模块依赖关系

```
app.py (主模块)
    ├── flask (Web框架)
    │   ├── render_template (模板渲染)
    │   ├── request (请求处理)
    │   ├── jsonify (JSON响应)
    │   ├── send_file (文件下载)
    │   ├── Response (流式响应)
    │   └── stream_with_context (流式上下文)
    ├── docx (文档生成)
    │   ├── Document (文档对象)
    │   ├── shared (共享样式)
    │   ├── enum.text (文本枚举)
    │   └── oxml (XML操作)
    ├── ollama (AI服务)
    │   ├── list (模型列表)
    │   └── chat (对话接口)
    └── 标准库
        ├── random (随机数)
        ├── json (JSON处理)
        ├── os (文件系统)
        ├── re (正则表达式)
        ├── datetime (日期时间)
        ├── threading (多线程)
        ├── platform (平台信息)
        └── subprocess (子进程)
```

---

## 3. 技术栈详解

### 3.1 后端技术

#### 3.1.1 Python 3.7+

- **版本要求**: Python 3.7 及以上
- **选择理由**: 
  - 语法简洁，开发效率高
  - 丰富的第三方库生态
  - 良好的跨平台支持

#### 3.1.2 Flask 3.0.0

```python
# Flask 应用初始化
from flask import Flask
app = Flask(__name__)

# 路由装饰器
@app.route('/')
def index():
    return render_template('index.html')

# 启动配置
if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=3000)
```

**Flask 核心特性使用**:

| 特性 | 用途 | 示例 |
|-----|------|------|
| `render_template` | 渲染HTML模板 | `render_template('index.html')` |
| `request.json` | 获取JSON请求体 | `data = request.json` |
| `jsonify` | 返回JSON响应 | `return jsonify({'status': 'ok'})` |
| `send_file` | 文件下载 | `return send_file(filepath, as_attachment=True)` |
| `Response` | 自定义响应 | `Response(generate(), mimetype='text/event-stream')` |
| `stream_with_context` | 流式响应上下文 | 保持请求上下文的流式响应 |

#### 3.1.3 python-docx 1.1.0

**文档生成核心代码**:

```python
from docx import Document
from docx.shared import Pt, Inches, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.oxml.ns import qn
from docx.oxml import OxmlElement

# 创建文档
doc = Document()

# 设置页面
section = doc.sections[0]
section.page_height = Inches(11.69)  # A4纸高度
section.page_width = Inches(8.27)    # A4纸宽度
section.left_margin = Inches(0.5)
section.right_margin = Inches(0.5)
section.top_margin = Inches(0.5)
section.bottom_margin = Inches(0.5)

# 添加标题
title_para = doc.add_paragraph()
title_para.alignment = WD_ALIGN_PARAGRAPH.CENTER
title_run = title_para.add_run('标题')
title_run.font.name = 'Times New Roman'
title_run.font.size = Pt(16)
title_run._element.rPr.rFonts.set(qn('w:eastAsia'), '宋体')
title_run.font.bold = True

# 添加表格
table = doc.add_table(rows=5, cols=5)
table.style = 'Table Grid'

# 保存文档
doc.save('output.docx')
```

#### 3.1.4 Ollama 0.4.7

**AI服务集成**:

```python
import ollama

# 获取模型列表
models = ollama.list()

# 同步对话
response = ollama.chat(
    model='qwen2.5:0.5b',
    messages=[{'role': 'user', 'content': '你好'}]
)

# 流式对话
response = ollama.chat(
    model='qwen2.5:0.5b',
    messages=[{'role': 'user', 'content': '请讲解这道题'}],
    stream=True
)
for chunk in response:
    content = chunk.get('message', {}).get('content', '')
    print(content, end='')
```

### 3.2 前端技术

#### 3.2.1 HTML5

**语义化标签使用**:

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>在线出题系统</title>
</head>
<body>
    <div class="container">
        <header>...</header>
        <div class="tabs">...</div>
        <div class="tab-content">...</div>
        <div class="questions-section">...</div>
    </div>
</body>
</html>
```

#### 3.2.2 CSS3

**响应式设计**:

```css
/* 桌面端样式 */
.container {
    max-width: 1200px;
    margin: 0 auto;
}

.questions-container {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 15px;
}

/* 移动端适配 */
@media (max-width: 768px) {
    .tabs {
        flex-direction: column;
    }
    
    .button-group {
        flex-direction: column;
    }
    
    .questions-container {
        grid-template-columns: 1fr;
    }
}
```

**主题色彩系统**:

| 颜色变量 | 十六进制值 | 用途 |
|---------|-----------|------|
| 主色调 | `#667eea` | 按钮、标签、链接 |
| 成功色 | `#28a745` | 正确答案标记 |
| 警告色 | `#ffc107` | AI讲解按钮 |
| 错误色 | `#dc3545` | 错误答案标记 |
| 信息色 | `#17a2b8` | 检查答案按钮 |
| 次要色 | `#6c757d` | 重置按钮 |

#### 3.2.3 JavaScript (ES6+)

**核心函数架构**:

```javascript
// 全局状态管理
let currentQuestions = [];  // 当前题目列表
let currentType = '';       // 当前题型
let wrongAnswers = [];      // 错题列表
let mathConfig = null;      // 数学配置缓存
let aiMessageCounter = 0;   // AI消息计数器

// 初始化
document.addEventListener('DOMContentLoaded', function() {
    initTabs();
    setTimeout(() => {
        loadPoetryList();
        loadEnglishUnits();
        loadMathConfig();
    }, 100);
});

// 异步数据加载
async function loadPoetryList() {
    try {
        const response = await fetch('/api/poetry/list');
        const data = await response.json();
        // 渲染数据...
    } catch (error) {
        console.error('加载失败:', error);
    }
}

// Fetch API 流式读取
async function sendMessage() {
    const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: message, model })
    });
    
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    
    while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        const chunk = decoder.decode(value);
        // 处理SSE数据...
    }
}
```

**Markdown解析器**:

```javascript
function parseMarkdown(text) {
    // 代码块处理
    // 标题处理 (# ## ### ####)
    // 引用块处理 (>)
    // 列表处理 (- * + 1.)
    // 段落处理
    return html;
}

function parseInlineMarkdown(text) {
    // 图片 ![alt](src)
    // 链接 [text](url)
    // 代码 `code`
    // 粗斜体 ***text***
    // 粗体 **text**
    // 斜体 *text*
    // 删除线 ~~text~~
    return result;
}
```

---

## 4. 项目结构详解

### 4.1 目录树

```
app/
├── app.py                           # Flask主应用 (935行)
├── requirements.txt                 # Python依赖 (3个包)
├── start.sh                        # Linux/macOS启动脚本
├── start.bat                       # Windows启动脚本
├── windows_installer.bat           # Windows一键安装脚本
├── README.md                       # 项目说明文档
├── TECHNICAL_DOCUMENTATION.md      # 技术文档(本文档)
├── OLLAMA_GUIDE.md                 # Ollama配置指南
├── OLLAMA_QUICKSTART.md           # Ollama快速入门
├── OLLAMA_TROUBLESHOOTING.md      # Ollama故障排除
├── PROJECT_STRUCTURE.md           # 项目结构说明
│
├── data/                           # 数据目录
│   ├── math_config.json           # 数学题配置 (241行)
│   ├── poetry.json                # 古诗数据 (326行)
│   ├── english.json               # 英语词汇 (588行)
│   └── *.docx                     # 生成的文档文件
│
├── templates/                      # HTML模板目录
│   ├── index.html                 # 主页面 (151行)
│   ├── ai_chat.html               # AI对话页面(旧)
│   └── ai_chat_new.html           # AI对话页面(新)
│
├── static/                         # 静态资源目录
│   ├── css/
│   │   ├── style.css              # 主样式文件 (522行)
│   │   └── ai_chat.css            # AI对话样式
│   └── js/
│       ├── app.js                 # 主JavaScript (1006行)
│       ├── ai_chat.js             # AI对话脚本
│       └── ai_chat.min.js         # 压缩版本
│
├── ollama/                         # 本地Ollama
│   ├── ollama                     # Ollama可执行文件
│   └── models/                    # 模型存储目录
│
└── venv/                           # Python虚拟环境
    └── ...
```

### 4.2 核心文件详解

#### 4.2.1 app.py (后端主文件)

**文件结构**:

```
app.py (935行)
│
├── 第1-17行: 导入声明
│   ├── Flask相关
│   ├── python-docx相关
│   ├── 标准库
│   └── ollama
│
├── 第18-37行: 缓存系统
│   ├── cache = {}
│   ├── cache_expiry = {}
│   ├── get_cached_data()
│   ├── set_cached_data()
│   └── clear_cache()
│
├── 第39行: Flask应用实例
│
├── 第41-62行: Word表格边框工具函数
│   └── set_cell_border()
│
├── 第63-300行: 数学题生成模块
│   ├── generate_math_questions()
│   ├── generate_single_math_question()
│   ├── generate_grade_1_2_question()
│   ├── generate_grade_3_4_question()
│   └── generate_grade_5_6_question()
│
├── 第302-337行: 古诗题生成
│   └── generate_poetry_questions()
│
├── 第339-370行: 英语题生成
│   └── generate_english_questions()
│
├── 第372-538行: Word文档生成
│   ├── create_word_document()
│   └── create_english_word_document()
│
├── 第540-646行: API路由 - 基础功能
│   ├── / (首页)
│   ├── /ai/chat (AI聊天页)
│   ├── /api/math/config
│   ├── /api/poetry/list
│   ├── /api/english/units
│   ├── /api/generate/math
│   ├── /api/generate/poetry
│   ├── /api/generate/english
│   ├── /api/download/math
│   ├── /api/download/poetry
│   └── /api/download/english
│
├── 第648-712行: API路由 - 练习报告
│   └── /api/download/report
│
├── 第714-745行: Ollama进程管理
│   ├── get_ollama_path()
│   ├── start_ollama()
│   └── stop_ollama()
│
├── 第747-932行: API路由 - AI功能
│   ├── /api/ai/status
│   ├── /api/ai/chat (流式)
│   ├── /api/ai/models
│   ├── /api/ai/explain
│   └── /api/ai/explain/stream (流式)
│
└── 第934-935行: 应用启动
    └── app.run()
```

#### 4.2.2 app.js (前端主文件)

**函数清单**:

| 函数名 | 行号 | 功能描述 |
|-------|------|----------|
| `parseMarkdown` | 8-139 | Markdown转HTML |
| `parseInlineMarkdown` | 142-164 | 行内Markdown解析 |
| `initTabs` | 180-214 | 标签页初始化 |
| `loadPoetryList` | 216-237 | 加载古诗列表 |
| `loadEnglishUnits` | 239-256 | 加载英语单元 |
| `loadMathConfig` | 258-269 | 加载数学配置 |
| `loadMathCategories` | 272-288 | 加载数学类别 |
| `loadMathTypes` | 290-308 | 加载数学题型 |
| `generateMath` | 310-349 | 生成数学题 |
| `generatePoetry` | 351-390 | 生成古诗题 |
| `generateEnglish` | 392-429 | 生成英语题 |
| `displayQuestions` | 431-462 | 显示题目 |
| `checkAnswers` | 464-522 | 检查答案 |
| `resetQuestions` | 524-530 | 重置练习 |
| `downloadReport` | 532-573 | 下载报告 |
| `sendMessage` | 575-677 | 发送AI消息 |
| `renderMathJax` | 679-687 | 渲染数学公式 |
| `clearChat` | 689-699 | 清空聊天 |
| `escapeHtml` | 701-705 | HTML转义 |
| `loadAIModels` | 707-731 | 加载AI模型 |
| `downloadMath` | 741-774 | 下载数学题 |
| `downloadPoetry` | 776-809 | 下载古诗题 |
| `downloadEnglish` | 811-842 | 下载英语题 |
| `askAIForSingleQuestion` | 844-913 | 单题AI讲解 |
| `askAIForWrongAnswers` | 916-993 | 批量错题讲解 |
| `closeAIExplainModal` | 996-999 | 关闭讲解弹窗 |

---

## 5. 后端API文档

### 5.1 API概览

| 端点 | 方法 | 描述 | 请求体 | 响应类型 |
|-----|------|------|--------|----------|
| `/` | GET | 首页 | - | HTML |
| `/ai/chat` | GET | AI聊天页 | - | HTML |
| `/api/math/config` | GET | 数学配置 | - | JSON |
| `/api/poetry/list` | GET | 古诗列表 | - | JSON |
| `/api/english/units` | GET | 英语单元 | - | JSON |
| `/api/generate/math` | POST | 生成数学题 | JSON | JSON |
| `/api/generate/poetry` | POST | 生成古诗题 | JSON | JSON |
| `/api/generate/english` | POST | 生成英语题 | JSON | JSON |
| `/api/download/math` | POST | 下载数学Word | JSON | File |
| `/api/download/poetry` | POST | 下载古诗Word | JSON | File |
| `/api/download/english` | POST | 下载英语Word | JSON | File |
| `/api/download/report` | POST | 下载练习报告 | JSON | File |
| `/api/ai/status` | GET | AI服务状态 | - | JSON |
| `/api/ai/models` | GET | AI模型列表 | - | JSON |
| `/api/ai/chat` | POST | AI对话 | JSON | SSE |
| `/api/ai/explain` | POST | 错题讲解 | JSON | JSON |
| `/api/ai/explain/stream` | POST | 流式讲解 | JSON | SSE |

### 5.2 API详细说明

#### 5.2.1 GET /api/math/config

**功能**: 获取数学题配置

**响应示例**:

```json
{
  "grade_levels": [
    {
      "id": "1-2",
      "name": "1-2年级",
      "description": "基础运算（打牢计算根基）",
      "categories": [
        {
          "id": "addition_within_20",
          "name": "20以内加减法",
          "types": [
            {
              "id": "oral_calculation",
              "name": "口算",
              "description": "凑十法、破十法",
              "examples": ["8+5", "13-4"]
            }
          ]
        }
      ]
    }
  ]
}
```

**缓存**: 5分钟

#### 5.2.2 POST /api/generate/math

**功能**: 生成数学题

**请求体**:

```json
{
  "grade_id": "1-2",
  "category_id": "addition_within_20",
  "type_id": "oral_calculation",
  "count": 20
}
```

**响应**:

```json
{
  "questions": [
    {"question": "8 + 5 = ", "answer": 13},
    {"question": "13 - 4 = ", "answer": 9}
  ]
}
```

#### 5.2.3 POST /api/generate/poetry

**功能**: 生成古诗默写题

**请求体**:

```json
{
  "poems": ["野望", "黄鹤楼"],
  "count": 10
}
```

**响应**:

```json
{
  "questions": [
    {
      "question": "东皋薄暮望，__________。",
      "answer": "徙倚欲何依",
      "poem_name": "野望"
    }
  ]
}
```

#### 5.2.4 POST /api/generate/english

**功能**: 生成英语默写题

**请求体**:

```json
{
  "unit": "Unit 1 Where did you go on vacation?",
  "direction": "cn_to_en"
}
```

**响应**:

```json
{
  "questions": [
    {
      "question": "adj. 古代的；古老的",
      "answer": "ancient"
    }
  ]
}
```

#### 5.2.5 POST /api/download/report

**功能**: 下载练习报告

**请求体**:

```json
{
  "type": "math",
  "answers": [
    {
      "question": "8 + 5 = ",
      "user_answer": "13",
      "correct_answer": 13,
      "is_correct": true
    }
  ]
}
```

**响应**: Word文档文件流

**文件名格式**: `练习报告_YYYYMMDD_HHMMSS.docx`

#### 5.2.6 POST /api/ai/chat

**功能**: AI对话（流式响应）

**请求体**:

```json
{
  "question": "请问什么是勾股定理?",
  "model": "qwen2.5:0.5b"
}
```

**响应**: Server-Sent Events (SSE)

```
data: {"content": "勾"}

data: {"content": "股"}

data: {"content": "定理是"}

data: [DONE]
```

**响应头**:

```
Content-Type: text/event-stream
Cache-Control: no-cache
X-Accel-Buffering: no
```

#### 5.2.7 POST /api/ai/explain/stream

**功能**: 单题流式讲解

**请求体**:

```json
{
  "question": "8 + 5 = ",
  "userAnswer": "12",
  "correctAnswer": 13,
  "type": "math"
}
```

**响应**: SSE格式，同上

---

## 6. 数据模型设计

### 6.1 数学配置模型 (math_config.json)

**结构定义**:

```typescript
interface MathConfig {
  grade_levels: GradeLevel[];
}

interface GradeLevel {
  id: string;           // 年级ID: "1-2", "3-4", "5-6"
  name: string;         // 年级名称
  description: string;  // 年级描述
  categories: Category[];
}

interface Category {
  id: string;           // 类别ID
  name: string;         // 类别名称
  types: QuestionType[];
}

interface QuestionType {
  id: string;           // 题型ID
  name: string;         // 题型名称
  description?: string; // 题型描述
  examples?: string[];  // 题目示例
}
```

**年级-类别-题型对应表**:

| 年级 | 类别 | 题型 |
|------|------|------|
| 1-2年级 | 20以内加减法 | 口算、连加、连减、加减混合 |
| 1-2年级 | 100以内加减法 | 口算、笔算 |
| 1-2年级 | 表内乘除法 | 乘法口诀、用口诀求商 |
| 1-2年级 | 简单混合运算 | 同级运算 |
| 3-4年级 | 多位数乘一位数 | 口算、笔算 |
| 3-4年级 | 有余数的除法 | 笔算 |
| 3-4年级 | 两位数乘两位数 | 口算(估算)、笔算 |
| 3-4年级 | 除数是一位数的除法 | 笔算 |
| 3-4年级 | 四则混合运算 | 含括号 |
| 5-6年级 | 小数运算 | 加减法、乘除法 |
| 5-6年级 | 分数运算 | 加减法、乘除法、混合运算 |
| 5-6年级 | 百分数运算 | 互化、应用题相关计算 |
| 5-6年级 | 运算定律应用 | 简算 |

### 6.2 古诗数据模型 (poetry.json)

**结构定义**:

```typescript
interface PoetryData {
  grade: string;           // 年级: "初二上册（部编新版）"
  category: string;        // 分类: "课文背诵篇目"
  contents: ContentGroup[];
}

interface ContentGroup {
  type: string;            // 类型: "诗歌", "散文", "议论文"
  works: Poem[];
}

interface Poem {
  id: number;              // 唯一标识
  name: string;            // 诗名
  author: string;          // 作者
  dynasty: string;         // 朝代
  text: string[] | string; // 诗句数组或全文
}
```

**古诗列表**:

| ID | 名称 | 作者 | 朝代 | 行数 |
|----|------|------|------|------|
| 1 | 野望 | 王绩 | 唐代 | 8 |
| 2 | 黄鹤楼 | 崔颢 | 唐代 | 8 |
| 3 | 使至塞上 | 王维 | 唐代 | 8 |
| 4 | 渡荆门送别 | 李白 | 唐代 | 8 |
| 5 | 钱塘湖春行 | 白居易 | 唐代 | 8 |
| 6 | 庭中有奇树 | 佚名 | 汉代 | 8 |
| 7 | 龟虽寿 | 曹操 | 汉代 | 12 |
| 8 | 赠从弟 | 刘桢 | 汉代 | 8 |
| 9 | 梁甫行 | 曹植 | 三国 | 8 |
| 10 | 饮酒（其五） | 陶渊明 | 东晋 | 10 |
| 11 | 春望 | 杜甫 | 唐代 | 8 |
| 12 | 雁门太守行 | 李贺 | 唐代 | 8 |
| 13 | 赤壁 | 杜牧 | 唐代 | 4 |
| 14 | 渔家傲 | 李清照 | 宋代 | 10 |
| 15 | 浣溪沙 | 晏殊 | 宋代 | 6 |

### 6.3 英语数据模型 (english.json)

**结构定义**:

```typescript
interface EnglishData {
  grade: string;           // 年级: "八年级上册"
  edition: string;         // 版本: "人教版（2025秋版）"
  units: Unit[];
}

interface Unit {
  name: string;            // 单元名称
  words: Word[];
}

interface Word {
  english: string;         // 英文
  chinese: string;         // 中文释义
}
```

**单元词汇统计**:

| 单元 | 单词数 |
|------|--------|
| Unit 1 Where did you go on vacation? | 82 |
| Unit 2 How often do you exercise? | 63 |
| Unit 3 I'm more outgoing than my sister. | 73 |
| Unit 4 What's the best movie theater? | 70 |
| Unit 5 Do you want to watch a game show? | 68 |
| Unit 6 I'm going to study computer science. | 60 |
| Unit 7 Will people have robots? | 67 |
| Unit 8 How do you make a banana milk shake? | 72 |
| **总计** | **555** |

---

## 7. 前端组件详解

### 7.1 页面结构

#### 7.1.1 主页面 (index.html)

```
┌─────────────────────────────────────────────────────────────┐
│                         header                               │
│  ┌───────────────────────────────────────────────────────┐  │
│  │                在线出题系统                            │  │
│  │         支持数学、古诗、英语多种题型                   │  │
│  └───────────────────────────────────────────────────────┘  │
├─────────────────────────────────────────────────────────────┤
│                          tabs                                │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐       │
│  │ 数学题  │ │古诗默写 │ │英语默写 │ │ AI对话  │        │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘       │
├─────────────────────────────────────────────────────────────┤
│                       tab-content                            │
│  ┌───────────────────────────────────────────────────────┐  │
│  │                    设置表单                            │  │
│  │  选择年级: [_____▼]                                   │  │
│  │  选择类别: [_____▼]                                   │  │
│  │  选择题型: [_____▼]                                   │  │
│  │  题目数量: [__20__]                                   │  │
│  │  [生成题目] [下载Word]                                │  │
│  └───────────────────────────────────────────────────────┘  │
├─────────────────────────────────────────────────────────────┤
│                    questions-section                         │
│  ┌───────────────────────────────────────────────────────┐  │
│  │                    在线练习                            │  │
│  │  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐     │  │
│  │  │ 8+5=    │ │ 13-4=   │ │ 6×7=    │ │ 42÷6=   │     │  │
│  │  │ [____]  │ │ [____]  │ │ [____]  │ │ [____]  │     │  │
│  │  └─────────┘ └─────────┘ └─────────┘ └─────────┘     │  │
│  │  [检查答案] [重置]                                    │  │
│  │  ┌───────────────────────────────────────────────┐   │  │
│  │  │  练习结果: 正确 18/20, 正确率 90%              │   │  │
│  │  │  [下载练习报告]                                │   │  │
│  │  └───────────────────────────────────────────────┘   │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### 7.2 CSS组件

#### 7.2.1 按钮组件

```css
/* 基础按钮 */
.btn {
    padding: 12px 30px;
    border: none;
    border-radius: 4px;
    font-size: 16px;
    font-weight: bold;
    cursor: pointer;
    transition: background 0.2s ease;
    flex: 1;
}

/* 按钮变体 */
.btn-primary { background: #667eea; color: white; }
.btn-success { background: #28a745; color: white; }
.btn-info { background: #17a2b8; color: white; }
.btn-secondary { background: #6c757d; color: white; }
.btn-warning { background: linear-gradient(135deg, #f7971e 0%, #ffd200 100%); color: white; }
```

#### 7.2.2 表单组件

```css
/* 输入框 */
.form-group input[type="number"],
.form-group select {
    width: 100%;
    padding: 12px;
    border: 2px solid #e0e0e0;
    border-radius: 8px;
    font-size: 16px;
    transition: border-color 0.3s ease;
}

/* 聚焦状态 */
.form-group input:focus,
.form-group select:focus {
    outline: none;
    border-color: #667eea;
}
```

#### 7.2.3 题目卡片

```css
/* 题目容器 - Grid布局 */
.questions-container {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 15px;
}

/* 题目项 */
.question-item {
    background: #f8f9fa;
    padding: 15px;
    border-radius: 8px;
    border-left: 4px solid #667eea;
}

/* 正确状态 */
.question-item.correct {
    border-left-color: #28a745;
    background: #d4edda;
}

/* 错误状态 */
.question-item.incorrect {
    border-left-color: #dc3545;
    background: #f8d7da;
}
```

### 7.3 JavaScript交互

#### 7.3.1 标签页切换

```javascript
function initTabs() {
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    
    tabBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const tabId = this.getAttribute('data-tab');
            
            // AI对话跳转独立页面
            if (tabId === 'ai') {
                window.location.href = '/ai/chat';
                return;
            }
            
            // 切换激活状态
            tabBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            // 切换内容显示
            tabContents.forEach(tab => tab.style.display = 'none');
            document.getElementById(tabId + '-tab').style.display = 'block';
        });
    });
}
```

#### 7.3.2 答案检查

```javascript
function checkAnswers() {
    let correct = 0;
    wrongAnswers = [];
    
    currentQuestions.forEach((q, index) => {
        const userAnswer = document.getElementById(`answer-${index}`).value.trim();
        const questionDiv = document.getElementById(`question-${index}`);
        const hintDiv = document.getElementById(`hint-${index}`);
        const aiExplainBtn = document.getElementById(`ai-explain-btn-${index}`);
        
        // 判断正确性
        let isCorrect = (currentType === 'math') 
            ? userAnswer === String(q.answer)
            : userAnswer === q.answer;
        
        if (isCorrect) {
            correct++;
            questionDiv.classList.add('correct');
            questionDiv.classList.remove('incorrect');
            hintDiv.style.display = 'none';
            aiExplainBtn.style.display = 'none';
        } else {
            questionDiv.classList.add('incorrect');
            questionDiv.classList.remove('correct');
            hintDiv.innerHTML = `正确答案: ${q.answer}`;
            hintDiv.style.display = 'block';
            aiExplainBtn.style.display = 'inline-block';
            
            wrongAnswers.push({
                question: q.question,
                userAnswer: userAnswer,
                correctAnswer: q.answer,
                index: index
            });
        }
    });
    
    // 显示结果
    const percentage = Math.round((correct / currentQuestions.length) * 100);
    document.getElementById('result-text').innerHTML = `
        共 ${currentQuestions.length} 题，答对 ${correct} 题，答错 ${currentQuestions.length - correct} 题<br>
        正确率: ${percentage}%
    `;
    document.getElementById('result-section').style.display = 'block';
}
```

---

## 8. AI集成详解

### 8.1 Ollama服务架构

```
┌───────────────────────────────────────────────────────────┐
│                    Flask Application                       │
│                                                           │
│  ┌─────────────────┐    ┌─────────────────────────────┐  │
│  │  /api/ai/chat   │───▶│     ollama.chat()           │  │
│  │  /api/ai/explain│    │     stream=True             │  │
│  │  /api/ai/models │    │     model='qwen2.5:0.5b'    │  │
│  └─────────────────┘    └─────────────────────────────┘  │
│                                    │                      │
└────────────────────────────────────│──────────────────────┘
                                     │ HTTP
                                     ▼
┌───────────────────────────────────────────────────────────┐
│                    Ollama Server                           │
│                    (localhost:11434)                       │
│                                                           │
│  ┌─────────────────────────────────────────────────────┐  │
│  │                    Qwen2.5:0.5b                      │  │
│  │                                                      │  │
│  │    参数量: 0.5B                                      │  │
│  │    上下文长度: 32K                                   │  │
│  │    推理速度: ~50 tokens/s                           │  │
│  │    内存占用: ~1GB                                    │  │
│  └─────────────────────────────────────────────────────┘  │
└───────────────────────────────────────────────────────────┘
```

### 8.2 流式响应实现

**后端实现 (app.py)**:

```python
@app.route('/api/ai/chat', methods=['POST'])
def ai_chat():
    data = request.json
    question = data.get('question', '')
    model = data.get('model', 'qwen2.5:0.5b')
    
    if not question:
        return jsonify({'error': '请输入问题'}), 400
    
    def generate():
        try:
            # 调用Ollama流式API
            response = ollama.chat(
                model=model,
                messages=[{'role': 'user', 'content': question}],
                stream=True
            )
            
            # 逐块发送数据
            for chunk in response:
                content = chunk.get('message', {}).get('content', '')
                if content:
                    yield f"data: {json.dumps({'content': content})}\n\n"
            
            yield "data: [DONE]\n\n"
            
        except Exception as e:
            error_msg = str(e)
            if 'Failed to connect' in error_msg:
                yield f"data: {json.dumps({'content': '无法连接到Ollama服务...'})}\n\n"
            else:
                yield f"data: {json.dumps({'content': f'回答失败：{error_msg}'})}\n\n"
            yield "data: [DONE]\n\n"
    
    return Response(
        stream_with_context(generate()),
        mimetype='text/event-stream',
        headers={
            'Cache-Control': 'no-cache',
            'X-Accel-Buffering': 'no'
        }
    )
```

**前端实现 (app.js)**:

```javascript
async function sendMessage() {
    const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: message, model })
    });
    
    if (response.ok) {
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let fullContent = '';
        
        while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            
            const chunk = decoder.decode(value);
            const lines = chunk.split('\n');
            
            for (const line of lines) {
                if (line.startsWith('data: ')) {
                    const data = line.slice(6);
                    
                    if (data === '[DONE]') {
                        // 完成，渲染最终Markdown
                        contentDiv.innerHTML = parseMarkdown(fullContent);
                        break;
                    }
                    
                    try {
                        const json = JSON.parse(data);
                        if (json.content) {
                            fullContent += json.content;
                            // 实时显示文本
                            contentDiv.textContent = fullContent;
                        }
                    } catch (e) {
                        console.error('解析失败:', e);
                    }
                }
            }
        }
    }
}
```

### 8.3 错题讲解Prompt设计

**单题讲解Prompt**:

```python
prompt = f"""请详细讲解以下{subject_name}题目：

题目：{question_text}
学生答案：{user_answer or '未作答'}
正确答案：{correct_answer}

请给出详细的解题思路、知识点分析和正确答案的推导过程。如果学生的答案是错误的，请指出错误原因。"""
```

**批量讲解Prompt**:

```python
prompt = f"""请帮我讲解以下{subject_name}错题，每道题给出详细的解题思路和正确答案：

题目1：{wrong_question_1}
我的答案：{user_answer_1}
正确答案：{correct_answer_1}

题目2：...

请针对每道错题给出详细的讲解，包括解题思路、知识点分析和正确答案的推导过程。"""
```

---

## 9. Word文档生成

### 9.1 文档生成流程

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│  创建文档   │───▶│  设置页面   │───▶│  添加内容   │───▶│  保存文件   │
│  Document() │    │  section    │    │  table/para │    │  doc.save() │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
```

### 9.2 页面设置

```python
section = doc.sections[0]

# A4纸尺寸 (英寸)
section.page_height = Inches(11.69)  # 297mm
section.page_width = Inches(8.27)    # 210mm

# 页边距
section.left_margin = Inches(0.5)    # 12.7mm
section.right_margin = Inches(0.5)
section.top_margin = Inches(0.5)
section.bottom_margin = Inches(0.5)
```

### 9.3 不同题型的文档样式

#### 9.3.1 数学题文档

| 属性 | 值 |
|------|-----|
| 列数 | 5列 |
| 字体 | Times New Roman |
| 中文字体 | 宋体 |
| 字号 | 14pt (4号) |
| 行距 | 1.5倍 |

```python
filepath = create_word_document(
    questions, 
    '数学练习题', 
    cols=5, 
    font_name='Times New Roman', 
    chinese_font='宋体', 
    font_size=14
)
```

#### 9.3.2 古诗题文档

| 属性 | 值 |
|------|-----|
| 列数 | 2列 |
| 字体 | 楷体 |
| 中文字体 | 楷体 |
| 字号 | 14pt |
| 行距 | 1.5倍 |

```python
filepath = create_word_document(
    questions, 
    '古诗默写练习', 
    cols=2, 
    font_name='楷体', 
    chinese_font='楷体'
)
```

#### 9.3.3 英语题文档

| 属性 | 值 |
|------|-----|
| 列数 | 3列 |
| 字体 | Times New Roman |
| 中文字体 | 宋体 |
| 字号 | 10.5pt (5号) |
| 行距 | 1.5倍 |
| 特殊 | 包含答题横线 |

### 9.4 练习报告格式

```python
def download_report():
    # 创建文档
    doc = Document()
    
    # 添加标题
    title = doc.add_heading('练习报告', 0)
    title.alignment = WD_ALIGN_PARAGRAPH.CENTER
    
    # 添加统计信息
    correct_count = sum(1 for a in answers if a.get('is_correct', False))
    total_count = len(answers)
    percentage = round((correct_count / total_count * 100), 1)
    
    summary = doc.add_paragraph()
    summary.add_run(f'共 {total_count} 题，答对 {correct_count} 题，答错 {total_count - correct_count} 题，正确率 {percentage}%')
    summary.alignment = WD_ALIGN_PARAGRAPH.CENTER
    
    # 添加每题详情
    for i, answer in enumerate(answers, 1):
        p = doc.add_paragraph()
        
        # 题号
        p.add_run(f'第 {i} 题：').bold = True
        
        # 题目
        question_run = p.add_run(f'\n题目：{answer.get("question", "")}')
        question_run.font.name = '宋体'
        question_run.font.size = Pt(11)
        
        # 用户答案
        user_run = p.add_run(f'\n你的答案：{answer.get("user_answer", "")}')
        
        # 正确答案
        correct_run = p.add_run(f'\n正确答案：{answer.get("correct_answer", "")}')
        correct_run.font.bold = True
        
        # 结果标记 (带颜色)
        is_correct = answer.get('is_correct', False)
        result_run = p.add_run(f'\n结果：{"✓ 正确" if is_correct else "✗ 错误"}')
        result_run.font.color.rgb = RGBColor(0, 128, 0) if is_correct else RGBColor(255, 0, 0)
        
        # 段落格式
        p.paragraph_format.line_spacing = 1.5
        p.paragraph_format.space_after = Pt(12)
    
    # 保存
    filename = f"练习报告_{datetime.now().strftime('%Y%m%d_%H%M%S')}.docx"
    filepath = os.path.join('data', filename)
    doc.save(filepath)
    
    return send_file(filepath, as_attachment=True)
```

### 9.5 表格边框处理

```python
def set_cell_border(cell, **kwargs):
    """设置单元格边框"""
    tc = cell._tc
    tcPr = tc.get_or_add_tcPr()
    
    # 获取或创建边框元素
    tcBorders = tcPr.first_child_found_in("w:tcBorders")
    if tcBorders is None:
        tcBorders = OxmlElement('w:tcBorders')
        tcPr.append(tcBorders)
    
    # 设置各边框
    for edge in ('left', 'top', 'right', 'bottom', 'insideH', 'insideV'):
        edge_data = kwargs.get(edge)
        if edge_data:
            tag = f'w:{edge}'
            element = tcBorders.find(qn(tag))
            if element is None:
                element = OxmlElement(tag)
                tcBorders.append(element)
            
            # 设置边框属性
            for key in ["sz", "val", "color", "space", "shadow"]:
                if key in edge_data:
                    element.set(qn(f'w:{key}'), str(edge_data[key]))

# 使用示例
set_cell_border(cell, 
    top={"sz": "6", "val": "single", "color": "000000"},
    bottom={"sz": "6", "val": "single", "color": "000000"},
    left={"sz": "6", "val": "single", "color": "000000"},
    right={"sz": "6", "val": "single", "color": "000000"}
)
```

---

## 10. 缓存机制

### 10.1 缓存实现

```python
# 缓存存储
cache = {}
cache_expiry = {}
CACHE_DURATION = timedelta(minutes=5)

def get_cached_data(key):
    """获取缓存数据"""
    if key in cache and datetime.now() < cache_expiry.get(key, datetime.min):
        return cache[key]
    return None

def set_cached_data(key, data):
    """设置缓存数据"""
    cache[key] = data
    cache_expiry[key] = datetime.now() + CACHE_DURATION

def clear_cache():
    """清除所有缓存"""
    cache.clear()
    cache_expiry.clear()
```

### 10.2 缓存使用场景

| 缓存键 | 数据内容 | 过期时间 |
|--------|----------|----------|
| `math_config` | 数学题配置 | 5分钟 |
| `poetry_list` | 古诗列表 | 5分钟 |
| `english_units` | 英语单元 | 5分钟 |

### 10.3 缓存使用示例

```python
@app.route('/api/math/config')
def get_math_config():
    """获取数学配置，使用缓存"""
    cache_key = 'math_config'
    
    # 尝试从缓存获取
    cached_data = get_cached_data(cache_key)
    if cached_data:
        return jsonify(cached_data)
    
    # 缓存未命中，读取文件
    data_file = os.path.join('data', 'math_config.json')
    if os.path.exists(data_file):
        with open(data_file, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        # 写入缓存
        set_cached_data(cache_key, data)
        return jsonify(data)
    
    return jsonify({})
```

---

## 11. 安全性设计

### 11.1 输入验证

```python
# 请求体验证
if not question:
    return jsonify({'error': '请输入问题'}), 400

if not gradeId or not categoryId or not typeId:
    alert('请完整选择年级、类别和题型');
    return;
```

### 11.2 XSS防护

```javascript
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// 用户输入显示时转义
userMessage.innerHTML = `<p>${escapeHtml(message)}</p>`;
```

### 11.3 文件路径安全

```python
# 使用os.path.join避免路径遍历
data_file = os.path.join('data', 'math_config.json')

# 文件名使用时间戳，避免用户输入
filename = f"练习报告_{datetime.now().strftime('%Y%m%d_%H%M%S')}.docx"
filepath = os.path.join('data', filename)
```

### 11.4 错误处理

```python
try:
    response = ollama.chat(model=model, messages=[...])
except Exception as e:
    error_msg = str(e)
    if 'Failed to connect' in error_msg or 'Connection refused' in error_msg:
        # 友好的错误提示，不暴露系统信息
        return jsonify({'error': '无法连接到AI服务'}), 500
    return jsonify({'error': '服务暂时不可用'}), 500
```

---

## 12. 部署指南

### 12.1 环境要求

**硬件要求**:

| 组件 | 最低配置 | 推荐配置 |
|------|----------|----------|
| CPU | 双核 | 四核及以上 |
| 内存 | 2GB | 4GB及以上 |
| 硬盘 | 100MB (不含模型) | 2GB (含模型) |

**软件要求**:

| 软件 | 版本要求 |
|------|----------|
| Python | 3.7+ |
| pip | 最新版本 |
| Ollama | 0.4.7+ |
| 浏览器 | Chrome/Firefox/Safari/Edge (最新版) |

### 12.2 安装步骤

#### 12.2.1 Linux/macOS

```bash
# 1. 克隆项目
git clone <repository-url>
cd app

# 2. 创建虚拟环境
python3 -m venv venv
source venv/bin/activate

# 3. 安装依赖
pip install -r requirements.txt

# 4. 安装Ollama (可选，用于AI功能)
curl -fsSL https://ollama.com/install.sh | sh

# 5. 下载AI模型 (可选)
ollama pull qwen2.5:0.5b

# 6. 启动Ollama服务 (可选)
ollama serve &

# 7. 启动应用
python3 app.py
```

#### 12.2.2 Windows

```cmd
# 1. 下载项目并解压

# 2. 运行一键安装脚本
windows_installer.bat

# 或手动安装:
# 3. 创建虚拟环境
python -m venv venv
venv\Scripts\activate

# 4. 安装依赖
pip install -r requirements.txt

# 5. 启动应用
python app.py
```

### 12.3 配置说明

**端口配置**:

```python
# app.py 最后一行
if __name__ == '__main__':
    app.run(
        debug=True,      # 调试模式 (生产环境设为False)
        host='0.0.0.0',  # 监听地址 (0.0.0.0允许外部访问)
        port=3000        # 端口号
    )
```

**环境变量** (可选):

```bash
# 设置Flask环境
export FLASK_ENV=production
export FLASK_DEBUG=0
```

### 12.4 生产部署建议

**使用Gunicorn (Linux)**:

```bash
pip install gunicorn
gunicorn -w 4 -b 0.0.0.0:3000 app:app
```

**使用Nginx反向代理**:

```nginx
server {
    listen 80;
    server_name example.com;
    
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
    
    # SSE支持
    location /api/ai/ {
        proxy_pass http://127.0.0.1:3000;
        proxy_buffering off;
        proxy_cache off;
        proxy_set_header Connection '';
        proxy_http_version 1.1;
        chunked_transfer_encoding off;
    }
}
```

---

## 13. 性能优化

### 13.1 前端优化

#### 13.1.1 延迟加载

```javascript
document.addEventListener('DOMContentLoaded', function() {
    initTabs();
    
    // 延迟100ms加载数据，优先渲染页面
    setTimeout(() => {
        loadPoetryList();
        loadEnglishUnits();
        loadMathConfig();
    }, 100);
});
```

#### 13.1.2 MathJax懒加载

```javascript
// 只在需要时加载MathJax
window.loadMathJax = function() {
    if (typeof MathJax === 'undefined') {
        // 动态创建script标签
        const script = document.createElement('script');
        script.src = 'https://cdn.bootcdn.net/ajax/libs/mathjax/3.2.2/es5/tex-mml-chtml.js';
        script.async = true;
        document.head.appendChild(script);
    }
};
```

#### 13.1.3 防止重复提交

```javascript
async function generateMath() {
    const generateBtn = document.querySelector('button[onclick="generateMath()"]');
    
    // 禁用按钮防止重复点击
    if (generateBtn) {
        generateBtn.disabled = true;
        generateBtn.textContent = '生成中...';
    }
    
    try {
        // 执行请求...
    } finally {
        // 恢复按钮状态
        if (generateBtn) {
            generateBtn.disabled = false;
            generateBtn.textContent = '生成题目';
        }
    }
}
```

### 13.2 后端优化

#### 13.2.1 数据缓存

- 数学配置、古诗列表、英语单元使用5分钟缓存
- 减少文件IO操作

#### 13.2.2 流式响应

```python
# 使用生成器函数进行流式响应
def generate():
    for chunk in response:
        yield f"data: {json.dumps({'content': chunk})}\n\n"

return Response(stream_with_context(generate()), mimetype='text/event-stream')
```

#### 13.2.3 响应头优化

```python
headers = {
    'Cache-Control': 'no-cache',     # 禁用缓存
    'X-Accel-Buffering': 'no'        # 禁用Nginx缓冲
}
```

---

## 14. 错误处理

### 14.1 前端错误处理

```javascript
async function generateMath() {
    try {
        const response = await fetch('/api/generate/math', {...});
        const data = await response.json();
        // 处理数据
    } catch (error) {
        console.error('生成数学题失败:', error);
        alert('生成题目失败，请重试');
    }
}
```

### 14.2 后端错误处理

```python
@app.route('/api/ai/chat', methods=['POST'])
def ai_chat():
    try:
        # 正常处理
    except Exception as e:
        error_msg = str(e)
        print(f"AI回答失败: {error_msg}")
        
        # 区分错误类型，返回友好提示
        if 'Failed to connect' in error_msg or 'Connection refused' in error_msg:
            yield f"data: {json.dumps({'content': '无法连接到Ollama服务...'})}\n\n"
        else:
            yield f"data: {json.dumps({'content': f'回答失败：{error_msg}'})}\n\n"
```

### 14.3 常见错误及解决方案

| 错误 | 原因 | 解决方案 |
|------|------|----------|
| 端口被占用 | 3000端口已被其他程序使用 | 修改app.py中的端口号 |
| 无法连接Ollama | Ollama服务未启动 | 运行 `ollama serve` |
| 模型未找到 | 未下载AI模型 | 运行 `ollama pull qwen2.5:0.5b` |
| JSON解析失败 | 数据文件格式错误 | 检查JSON文件语法 |
| Word文档打开失败 | Office未安装或文件损坏 | 重新生成或使用其他软件打开 |

---

## 15. 扩展指南

### 15.1 添加新题型

#### 15.1.1 修改数学配置

```json
// data/math_config.json
{
  "grade_levels": [
    {
      "id": "7-9",
      "name": "7-9年级",
      "description": "初中数学",
      "categories": [
        {
          "id": "algebra",
          "name": "代数运算",
          "types": [
            {
              "id": "linear_equation",
              "name": "一元一次方程",
              "examples": ["2x + 3 = 7"]
            }
          ]
        }
      ]
    }
  ]
}
```

#### 15.1.2 添加题目生成函数

```python
# app.py
def generate_grade_7_9_question(category_id, type_id):
    if category_id == 'algebra':
        if type_id == 'linear_equation':
            # 生成 ax + b = c 形式的方程
            a = random.randint(2, 10)
            x = random.randint(1, 10)
            b = random.randint(1, 20)
            c = a * x + b
            return {
                'question': f'{a}x + {b} = {c}',
                'answer': x
            }
    return {'question': '', 'answer': ''}
```

### 15.2 添加新学科

#### 15.2.1 创建数据文件

```json
// data/physics.json
{
  "grade": "初二上册",
  "chapters": [
    {
      "name": "第一章 声现象",
      "formulas": [
        {
          "name": "声速公式",
          "formula": "v = s/t",
          "variables": {
            "v": "声速(m/s)",
            "s": "距离(m)",
            "t": "时间(s)"
          }
        }
      ]
    }
  ]
}
```

#### 15.2.2 添加API路由

```python
@app.route('/api/physics/chapters')
def get_physics_chapters():
    data_file = os.path.join('data', 'physics.json')
    if os.path.exists(data_file):
        with open(data_file, 'r', encoding='utf-8') as f:
            data = json.load(f)
        return jsonify(data.get('chapters', []))
    return jsonify([])
```

#### 15.2.3 添加前端标签页

```html
<!-- templates/index.html -->
<button class="tab-btn" data-tab="physics">物理</button>

<div class="tab-content" id="physics-tab" style="display: none;">
    <!-- 物理题设置表单 -->
</div>
```

### 15.3 集成其他AI模型

```python
# 修改默认模型
@app.route('/api/ai/chat', methods=['POST'])
def ai_chat():
    model = data.get('model', 'llama3:8b')  # 更换模型
    
    response = ollama.chat(
        model=model,
        messages=[{'role': 'user', 'content': question}],
        stream=True
    )
```

**支持的模型**:

| 模型 | 参数量 | 特点 |
|------|--------|------|
| qwen2.5:0.5b | 0.5B | 轻量快速，中文优化 |
| qwen2.5:1.5b | 1.5B | 平衡性能 |
| llama3:8b | 8B | 通用能力强 |
| mistral:7b | 7B | 推理能力强 |

---

## 16. 附录

### 16.1 依赖包版本

```
Flask==3.0.0
python-docx==1.1.0
ollama==0.4.7
```

### 16.2 文件编码

所有文件使用 UTF-8 编码，包括:
- Python源代码 (.py)
- JSON数据文件 (.json)
- HTML模板 (.html)
- CSS样式表 (.css)
- JavaScript脚本 (.js)

### 16.3 代码规范

**Python**:
- PEP 8 代码风格
- 函数使用下划线命名 (snake_case)
- 类使用驼峰命名 (CamelCase)

**JavaScript**:
- ES6+ 语法
- 函数使用驼峰命名 (camelCase)
- 常量使用大写下划线 (UPPER_SNAKE_CASE)

**CSS**:
- BEM命名规范
- 类名使用短横线连接 (kebab-case)

### 16.4 版本历史

| 版本 | 日期 | 主要变更 |
|------|------|----------|
| v1.0.0 | 2026-01-01 | 初始版本：数学题、古诗默写、Word导出 |
| v1.1.0 | 2026-01-10 | 新增英语默写、中英互译 |
| v1.2.0 | 2026-01-15 | 新增练习报告、分数显示、AI问答、错题讲解 |

### 16.5 联系方式

**作者**: Song Zichen  
**学校**: Quan Hai Middle School  
**项目用途**: 学习与教学

---

**文档完成于 2026-02-04**

*本技术文档详细描述了智能辅助学习系统的架构设计、技术实现、API接口、部署方法等内容，供开发者参考和维护使用。*
