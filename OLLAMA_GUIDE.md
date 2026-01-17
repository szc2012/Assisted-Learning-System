# Ollama AI 问答功能使用指南

## 概述

本项目集成了Ollama AI问答功能，使用Qwen2.5 0.5B模型，支持完全离线使用。您可以将整个项目文件夹复制到任何电脑，安装依赖后即可使用AI问答功能。

## 功能特点

- ✅ **完全离线**：无需网络连接即可使用
- ✅ **轻量级**：模型大小仅约300MB
- ✅ **快速响应**：本地运行，响应速度快
- ✅ **多平台支持**：支持Windows、macOS、Linux
- ✅ **一键安装**：自动下载和配置Ollama

## 快速开始

### Windows用户

1. **运行安装程序**
   ```
   右键点击 windows_installer.bat → 选择"以管理员身份运行"
   ```

2. **选择安装Ollama**
   - 在安装过程中，脚本会询问是否下载Ollama和模型
   - 选择"是"开始下载
   - 等待下载完成（可能需要几分钟）

3. **启动程序**
   - 双击 `start.bat` 启动程序
   - 在浏览器中访问 http://127.0.0.1:3000
   - 点击"AI问答"标签页

### macOS/Linux用户

1. **安装Python依赖**
   ```bash
   python3 -m venv venv
   source venv/bin/activate  # macOS/Linux
   pip install -r requirements.txt
   ```

2. **下载Ollama和模型**
   ```bash
   python3 install_ollama.py
   ```
   选择选项3（全部下载）

3. **启动程序**
   ```bash
   python3 app.py
   ```
   在浏览器中访问 http://127.0.0.1:3000

## 手动安装Ollama

如果自动安装失败，可以手动安装：

### 1. 下载Ollama

运行安装脚本：
```bash
python3 install_ollama.py
```

选择选项1（下载Ollama）

### 2. 下载模型

运行安装脚本：
```bash
python3 install_ollama.py
```

选择选项2（下载模型），或直接指定模型：
```bash
python3 install_ollama.py model qwen2.5:0.5b
```

### 3. 验证安装

启动程序后，访问AI问答页面，尝试发送消息。如果收到AI回复，说明安装成功。

## 使用方法

### 基本使用

1. **选择模型**
   - 在AI问答页面，从下拉菜单中选择模型
   - 默认使用 `qwen2.5:0.5b`

2. **输入问题**
   - 在文本框中输入您的问题
   - 支持中文和英文
   - 可以询问各种问题

3. **发送消息**
   - 点击"发送"按钮
   - 或按Enter键发送（Shift+Enter换行）

4. **查看回复**
   - AI回复会显示在聊天区域
   - 可以继续对话

### 清空对话

点击"清空对话"按钮可以清除所有聊天记录，重新开始对话。

## 常见问题

### 1. Ollama下载失败

**问题**：下载Ollama时出现错误

**解决方案**：
- 检查网络连接
- 尝试手动下载Ollama：
  - Windows: https://github.com/ollama/ollama/releases/download/v0.5.7/ollama-windows-amd64.zip
  - macOS: https://github.com/ollama/ollama/releases/download/v0.5.7/ollama-darwin-arm64
  - Linux: https://github.com/ollama/ollama/releases/download/v0.5.7/ollama-linux-amd64
- 将下载的文件放到项目目录的 `ollama` 文件夹中

### 2. 模型下载失败

**问题**：下载qwen2.5:0.5b模型时出现错误

**解决方案**：
- 检查网络连接
- 确保Ollama服务已启动
- 尝试重新下载：
  ```bash
  python3 install_ollama.py model qwen2.5:0.5b
  ```

### 3. AI无响应

**问题**：发送消息后AI没有回复

**解决方案**：
- 检查Ollama服务是否运行
- 确保模型已下载
- 查看浏览器控制台是否有错误信息
- 重启程序

### 4. 响应速度慢

**问题**：AI回复速度很慢

**解决方案**：
- 检查电脑性能
- 关闭其他占用资源的程序
- 考虑使用更小的模型

## 高级配置

### 更换模型

如果您想使用其他模型，可以：

1. **下载新模型**
   ```bash
   python3 install_ollama.py model [模型名称]
   ```

2. **修改前端配置**
   编辑 `templates/index.html`，在AI问答部分添加新模型选项：
   ```html
   <select id="ai-model">
       <option value="qwen2.5:0.5b">Qwen2.5 0.5B</option>
       <option value="qwen2.5:1.5b">Qwen2.5 1.5B</option>
   </select>
   ```

### 调整Ollama配置

Ollama的配置文件位于：
- Windows: `%USERPROFILE%\.ollama\models`
- macOS/Linux: `~/.ollama/models`

您可以手动管理模型文件。

## 技术细节

### Ollama架构

Ollama是一个本地运行的大语言模型框架，特点：
- 本地运行，无需网络
- 支持多种模型
- 提供REST API接口
- 跨平台支持

### Qwen2.5 0.5B模型

Qwen2.5是阿里巴巴开发的开源大语言模型：
- 参数量：0.5B（5亿参数）
- 模型大小：约300MB
- 语言支持：中文、英文
- 适用场景：日常问答、文本生成、翻译等

### API接口

项目提供以下API端点：

- `GET /api/ai/status` - 检查AI服务状态
- `POST /api/ai/chat` - 发送聊天消息
- `GET /api/ai/models` - 获取可用模型列表

## 系统要求

### 最低配置

- **操作系统**：Windows 7+、macOS 10.15+、Linux
- **内存**：4GB RAM
- **硬盘空间**：1GB可用空间
- **CPU**：支持AVX2指令集

### 推荐配置

- **操作系统**：Windows 10+、macOS 11+、Linux
- **内存**：8GB RAM
- **硬盘空间**：2GB可用空间
- **CPU**：多核处理器

## 性能优化

### 提升响应速度

1. **使用SSD**：将Ollama模型文件放在SSD上
2. **增加内存**：更多内存可以提升性能
3. **关闭其他程序**：释放系统资源
4. **使用更小的模型**：选择参数量更少的模型

### 减少内存占用

1. **使用更小的模型**：如qwen2.5:0.5b
2. **调整模型参数**：修改Ollama配置
3. **定期清理缓存**：删除不使用的模型

## 安全性

### 数据隐私

- 所有AI处理在本地完成
- 不会上传任何数据到云端
- 完全保护您的隐私

### 模型安全

- 使用官方发布的模型
- 定期更新模型版本
- 不要使用来源不明的模型

## 故障排除

### 查看日志

如果遇到问题，可以查看：
1. 程序运行日志（命令行窗口）
2. 浏览器控制台（F12）
3. Ollama日志（如果单独运行）

### 重置Ollama

如果需要完全重置Ollama：

1. 停止程序
2. 删除 `ollama` 文件夹
3. 重新运行 `install_ollama.py`

### 联系支持

如果以上方法都无法解决问题，请：
1. 记录错误信息
2. 描述操作步骤
3. 提供系统信息（操作系统、Python版本等）

## 更新日志

### v1.0.0
- 集成Ollama AI问答功能
- 支持qwen2.5:0.5b模型
- 一键安装脚本
- 完全离线使用
- 跨平台支持

## 许可证

本项目遵循MIT许可证。

Ollama和Qwen模型遵循各自的开源许可证。

## 参考资源

- [Ollama官方文档](https://ollama.com/docs)
- [Qwen模型文档](https://github.com/QwenLM/Qwen)
- [Python Ollama库](https://github.com/ollama/ollama-python)

---

**提示**：首次使用建议在良好的网络环境下下载Ollama和模型，下载完成后即可完全离线使用。