# Ollama 快速故障排除指南

## 问题：无法连接到Ollama

如果您看到以下错误信息：
```
错误: Failed to connect to Ollama. Please check that Ollama is downloaded, running and accessible.
```

## 解决方案

### 方法一：自动安装（推荐）

运行Ollama安装脚本：

```bash
python3 install_ollama.py 3
```

这将自动：
1. 下载Ollama
2. 下载qwen2.5:0.5b模型
3. 配置完成

### 方法二：手动安装

#### 步骤1：下载Ollama

```bash
python3 install_ollama.py 1
```

#### 步骤2：下载模型

```bash
python3 install_ollama.py 2
```

#### 步骤3：验证安装

检查Ollama是否已安装：

```bash
ls -la ollama/
```

应该看到：
- `ollama` (macOS/Linux) 或 `ollama.exe` (Windows)

#### 步骤4：启动程序

```bash
python3 app.py
```

然后在浏览器中访问 http://127.0.0.1:3000，点击"AI问答"标签页。

### 方法三：使用系统Ollama（如果已安装）

如果您已经在系统中安装了Ollama：

#### macOS
```bash
brew install ollama
ollama pull qwen2.5:0.5b
```

#### Windows
1. 访问 https://ollama.com/download
2. 下载并安装Ollama
3. 打开命令提示符，运行：
   ```
   ollama pull qwen2.5:0.5b
   ```

#### Linux
```bash
curl -fsSL https://ollama.com/install.sh | sh
ollama pull qwen2.5:0.5b
```

## 验证Ollama是否正常工作

### 检查Ollama版本

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

如果Ollama正常工作，应该会收到AI的回复。

## 常见问题

### Q1: 下载速度慢怎么办？

**A:** 可以使用镜像源或手动下载：

1. 手动下载Ollama：
   - macOS: https://github.com/ollama/ollama/releases/download/v0.5.7/ollama-darwin-arm64
   - Windows: https://github.com/ollama/ollama/releases/download/v0.5.7/ollama-windows-amd64.zip

2. 将下载的文件放到项目目录的 `ollama` 文件夹中

### Q2: 模型下载失败

**A:** 尝试以下方法：

1. 检查网络连接
2. 使用系统Ollama（方法三）
3. 手动下载模型：
   ```bash
   ollama pull qwen2.5:0.5b
   ```

### Q3: macOS提示需要macOS 14+

**A:** 如果您的macOS版本低于14，可以：

1. 使用旧版本的Ollama
2. 或者使用系统Ollama（方法三）

### Q4: 权限错误

**A:** 给Ollama添加执行权限：

```bash
chmod +x ollama/ollama
```

### Q5: 端口被占用

**A:** Ollama默认使用11434端口，如果被占用：

1. 停止其他Ollama进程：
   ```bash
   pkill ollama
   ```

2. 或者修改Ollama配置使用其他端口

## 重置Ollama

如果以上方法都不行，可以完全重置：

```bash
# 停止程序
pkill -f "python3 app.py"

# 删除Ollama
rm -rf ollama/

# 重新安装
python3 install_ollama.py 3
```

## 获取帮助

如果问题仍然存在：

1. 查看详细日志：
   ```bash
   python3 app.py
   ```

2. 检查Ollama日志：
   ```bash
   ollama logs
   ```

3. 参考 [OLLAMA_GUIDE.md](OLLAMA_GUIDE.md) 获取更多详细信息

## 最小化安装（仅测试）

如果您只是想快速测试AI功能，可以使用系统Ollama：

```bash
# 1. 安装Ollama（如果还没安装）
brew install ollama  # macOS
# 或访问 https://ollama.com/download 下载其他平台

# 2. 下载模型
ollama pull qwen2.5:0.5b

# 3. 启动程序
python3 app.py
```

这样可以跳过项目内的Ollama安装，直接使用系统安装的Ollama。

## 系统要求

- **macOS**: 10.15+ (项目内Ollama) 或 14+ (官方Ollama)
- **Windows**: 7+
- **Linux**: 任意主流发行版
- **Python**: 3.8+
- **内存**: 至少4GB RAM
- **硬盘空间**: 至少1GB可用空间

## 快速检查清单

在联系支持之前，请检查：

- [ ] Python版本是否为3.8或更高
- [ ] 是否已安装所有依赖：`pip install -r requirements.txt`
- [ ] Ollama是否已安装：`ls -la ollama/`
- [ ] 模型是否已下载：`ollama list`
- [ ] 程序是否正在运行：`python3 app.py`
- [ ] 防火墙是否允许11434端口
- [ ] 是否有足够的磁盘空间

---

**提示**：大多数连接问题都可以通过运行 `python3 install_ollama.py 3` 解决。