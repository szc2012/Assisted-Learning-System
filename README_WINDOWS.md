# 在线出题软件 - 安装指南

## 快速开始

### 方法一：一键安装（Windows）

1. **下载项目文件**
   - 将所有项目文件复制到Windows电脑的某个文件夹中
   - 确保包含以下文件：
     - `app.py`
     - `requirements.txt`
     - `windows_installer.bat`
     - `data/` 文件夹
     - `templates/` 文件夹
     - `static/` 文件夹

2. **运行安装程序**
   - 右键点击 `windows_installer.bat`
   - 选择"以管理员身份运行"
   - 按照屏幕提示完成安装

3. **启动程序**
   - 安装完成后，双击 `start.bat` 启动程序
   - 在浏览器中访问 http://127.0.0.1:3000

### 方法二：手动安装（macOS/Linux）

#### 1. 安装Python依赖

```bash
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

#### 2. 安装系统Ollama（推荐）

```bash
# macOS
brew install ollama

# Linux
curl -fsSL https://ollama.com/install.sh | sh
```

#### 3. 下载AI模型

```bash
ollama pull qwen2.5:0.5b
```

#### 4. 启动程序

```bash
python3 app.py
```

**提示**：首次运行 `ollama pull` 会下载约300MB的模型文件，需要几分钟时间。

## 使用说明

### 数学题生成

- 选择年级（1-2年级、3-4年级、5-6年级）
- 选择类别（加减法、乘除法、混合运算等）
- 选择题型（口算、笔算、应用题等）
- 设置题目数量
- 点击"生成题目"进行在线练习
- 点击"下载Word"导出题目

### 古诗默写

- 选择要练习的古诗
- 可以多选
- 点击"生成题目"进行在线练习
- 点击"下载Word"导出题目

### 英语默写
- 选择单元
- 选择练习类型（中译英、英译汉）
- 点击"生成题目"进行在线练习
- 点击"下载Word"导出题目

### AI智能问答

- 选择AI模型（默认使用qwen2.5:0.5b）
- 在文本框中输入问题
- 点击"发送"或按Enter键发送消息
- AI会即时回复您的提问
- 支持完全离线使用
- 可以清空对话重新开始

**注意**：首次使用需要下载Ollama和AI模型（约300MB），安装程序会提示您是否下载。详细使用说明请参考 [OLLAMA_GUIDE.md](OLLAMA_GUIDE.md)。

## Word导出格式

### 数学题
- 字体：Times New Roman
- 字号：4号
- 行间距：1.5倍
- 布局：五栏

### 古诗默写
- 字体：楷体
- 字号：4号
- 行间距：1.5倍
- 布局：两列

### 英语默写
- 字体：Times New Roman
- 字号：5号
- 行间距：1.5倍
- 布局：三列

## 常见问题

### 1. 端口被占用

如果3000端口被占用，可以修改 `app.py` 中的端口号：

```python
if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=3001)  # 改为其他端口
```

### 2. 无法访问局域网

确保防火墙允许3000端口访问：

1. 打开"Windows Defender 防火墙"
2. 点击"高级设置"
3. 点击"入站规则"
4. 点击"新建规则"
5. 选择"端口"，输入3000
6. 选择"允许连接"
7. 完成规则创建

### 3. Python安装失败

- 检查网络连接
- 尝试手动下载Python安装程序
- 确保以管理员身份运行安装脚本

### 4. 依赖安装失败

- 检查网络连接
- 尝试更换pip源：
  ```bash
  pip config set global.index-url https://pypi.tuna.tsinghua.edu.cn/simple
  ```

## 数据导入

### 数学题配置

编辑 `data/math_config.json` 文件，按照现有格式添加新的题目类型。

### 古诗数据

编辑 `data/poetry.json` 文件，按照以下格式添加古诗：

```json
{
  "id": "poem_001",
  "title": "古诗标题",
  "author": "作者",
  "content": [
    "第一句",
    "第二句",
    "第三句",
    "第四句"
  ]
}
```

### 英语词汇

编辑 `data/english.json` 文件，按照以下格式添加词汇：

```json
{
  "unit": "Unit 1",
  "words": [
    {
      "english": "hello",
      "chinese": "你好"
    }
  ]
}
```

## 技术支持

如遇到问题，请检查：

1. Python版本是否为3.8或更高
2. 所有依赖包是否正确安装
3. 数据文件是否完整
4. 防火墙设置是否正确

## 系统要求

- 操作系统：Windows 7/8/10/11
- Python：3.8或更高版本
- 内存：至少2GB
- 硬盘空间：至少500MB
- 网络：首次安装需要网络连接

## 更新日志

### v1.0.0
- 支持数学题生成（1-6年级）
- 支持古诗默写
- 支持英语默写
- 支持Word导出
- 支持在线练习
- 一键安装脚本