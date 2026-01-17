# Ollama AI 快速开始指南

## 🎯 最简单的方法（推荐）

### 步骤1：安装系统Ollama

```bash
brew install ollama
```

### 步骤2：下载模型

```bash
ollama pull qwen2.5:0.5b
```

### 步骤3：启动程序

```bash
cd /Users/szc/app
python3 app.py
```

### 步骤4：使用AI问答

在浏览器中访问 http://127.0.0.1:3000，点击"AI问答"标签页。

---

## 📦 方法二：使用项目内Ollama

如果您想完全离线使用，可以下载Ollama到项目内：

### 步骤1：下载Ollama

```bash
cd /Users/szc/app
python3 install_ollama.py 1
```

### 步骤2：下载模型

```bash
cd /Users/szc/app
python3 download_model.py
```

### 步骤3：启动程序

```bash
cd /Users/szc/app
python3 app.py
```

---

## ✅ 验证安装

### 检查系统Ollama

```bash
ollama --version
```

### 检查已安装的模型

```bash
ollama list
```

应该看到 `qwen2.5:0.5b` 在列表中。

### 测试Ollama

```bash
ollama run qwen2.5:0.5b "你好"
```

---

## 🚀 快速开始

### 一键安装（系统Ollama）

```bash
brew install ollama && ollama pull qwen2.5:0.5b
```

### 启动程序

```bash
cd /Users/szc/app && python3 app.py
```

### 访问应用

在浏览器中打开：http://127.0.0.1:3000

---

## 📝 重要说明

### 为什么需要Ollama？

- `pip install ollama` 只是Python客户端库
- 需要Ollama服务进程来运行AI模型
- 需要qwen2.5:0.5b模型文件（约300MB）

### 两种安装方式对比

| 特性 | 系统Ollama | 项目内Ollama |
|------|-------------|-------------|
| 安装难度 | 简单 | 复杂 |
| 首次联网 | 需要 | 需要 |
| 安装后离线 | 是 | 是 |
| 更新 | 简单 | 需要重新下载 |
| 推荐度 | ⭐⭐⭐⭐ | ⭐⭐ |

**推荐使用系统Ollama**，因为：
1. 安装更简单：只需一个命令
2. 更新更方便：`brew upgrade ollama`
3. 无权限问题：系统安装不需要特殊权限
4. 官方支持：Ollama官方推荐的方式

---

## 🔧 故障排除

### 问题：无法连接到Ollama

**解决方案1：检查Ollama是否运行**

```bash
ps aux | grep ollama
```

如果没有进程，启动Ollama：

```bash
ollama serve
```

**解决方案2：检查模型是否下载**

```bash
ollama list
```

如果没有qwen2.5:0.5b，下载模型：

```bash
ollama pull qwen2.5:0.5b
```

**解决方案3：重启程序**

停止程序（Ctrl+C），然后重新启动：

```bash
python3 app.py
```

---

## 📊 系统要求

### 最低配置

- **操作系统**：macOS 10.15+、Windows 7+、Linux
- **Python**：3.8+
- **内存**：4GB RAM
- **硬盘空间**：2GB可用空间

### 推荐配置

- **操作系统**：macOS 11+、Windows 10+、Linux
- **Python**：3.11+
- **内存**：8GB RAM
- **硬盘空间**：5GB可用空间

---

## 💡 提示

1. **首次安装需要网络**：下载Ollama和模型需要网络连接
2. **安装完成后可离线**：所有AI处理在本地完成
3. **模型大小**：约300MB，下载可能需要几分钟
4. **响应速度**：取决于电脑性能，通常1-3秒
5. **多模型支持**：可以下载多个模型，如 `ollama pull llama2`

---

## 🎓 使用示例

### 数学题辅导

```
用户：如何教孩子20以内的加减法？
AI：对于20以内的加减法，可以使用以下方法：
1. 凑十法：将两个数凑成10，再计算
2. 破十法：从10中减去一个数
3. 数数法：使用手指或物品辅助数数
4. 游戏化：通过游戏让孩子在玩中学
```

### 古诗解释

```
用户：解释"床前明月光"的意思
AI：这句诗出自李白的《静夜思》。
"床前明月光"的意思是：明亮的月光洒在床前。
整首诗表达了诗人在静夜思念故乡的情感。
```

### 英语学习

```
用户：如何提高英语听力？
AI：提高英语听力的方法：
1. 每天坚持听15-30分钟
2. 选择适合自己水平的材料
3. 听不懂的地方反复听
4. 跟读模仿发音
5. 做听力笔记和总结
```

---

## 📚 更多资源

- [Ollama官方文档](https://ollama.com/docs)
- [Qwen模型文档](https://github.com/QwenLM/Qwen)
- [Hugging Face模型库](https://huggingface.co/models)
- [项目主文档](README_WINDOWS.md)

---

## ❓ 常见问题

### Q1: 可以使用其他模型吗？

A：可以！下载其他模型：

```bash
ollama pull llama2
ollama pull mistral
ollama pull codellama
```

### Q2: 如何更换模型？

A：在前端界面的模型选择下拉框中选择其他模型。

### Q3: 模型可以删除吗？

A：可以，删除不使用的模型释放空间：

```bash
ollama rm qwen2.5:0.5b
```

### Q4: 如何查看模型大小？

A：查看已安装模型的大小：

```bash
ollama list
```

---

**祝您使用愉快！** 🎉