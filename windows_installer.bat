@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

title 在线出题软件 - 一键安装程序

echo.
echo ========================================
echo    在线出题软件 - 一键安装程序
echo ========================================
echo.

REM 设置项目目录
set "PROJECT_DIR=%~dp0"
set "VENV_DIR=%PROJECT_DIR%venv"
set "PYTHON_VERSION=3.11.7"
set "PYTHON_URL=https://www.python.org/ftp/python/%PYTHON_VERSION%/python-%PYTHON_VERSION%-amd64.exe"
set "PYTHON_INSTALLER=%TEMP%\python-installer.exe"

REM 检查Python是否已安装
echo [1/5] 检查Python环境...
python --version >nul 2>&1
if %errorlevel% equ 0 (
    echo ✓ Python已安装
    for /f "tokens=2" %%i in ('python --version 2^>^&1') do set "PYTHON_VERSION_INSTALLED=%%i"
    echo   当前版本: !PYTHON_VERSION_INSTALLED!
) else (
    echo ✗ Python未安装，正在下载并安装...
    echo.
    
    REM 检查是否有管理员权限
    net session >nul 2>&1
    if %errorlevel% neq 0 (
        echo 警告: 建议以管理员身份运行此脚本以安装Python
        echo 如果安装失败，请右键点击此文件选择"以管理员身份运行"
        echo.
    )
    
    REM 下载Python安装程序
    echo 正在下载Python %PYTHON_VERSION%...
    echo 下载地址: %PYTHON_URL%
    echo.
    
    REM 使用PowerShell下载
    powershell -Command "& {Invoke-WebRequest -Uri '%PYTHON_URL%' -OutFile '%PYTHON_INSTALLER%' -UseBasicParsing}"
    
    if not exist "%PYTHON_INSTALLER%" (
        echo ✗ Python下载失败，请检查网络连接
        echo.
        echo 您可以手动下载Python安装程序:
        echo %PYTHON_URL%
        echo.
        echo 下载后请重新运行此脚本
        pause
        exit /b 1
    )
    
    echo ✓ Python下载完成
    echo.
    
    REM 安装Python
    echo 正在安装Python %PYTHON_VERSION%...
    echo 请等待安装完成...
    echo.
    
    "%PYTHON_INSTALLER%" /quiet InstallAllUsers=1 PrependPath=1 Include_test=0
    
    REM 等待安装完成
    timeout /t 30 /nobreak >nul
    
    REM 刷新环境变量
    refreshenv >nul 2>&1
    
    REM 再次检查Python
    python --version >nul 2>&1
    if %errorlevel% equ 0 (
        echo ✓ Python安装成功
    ) else (
        echo ✗ Python安装可能失败，请手动安装后重新运行此脚本
        pause
        exit /b 1
    )
    
    REM 清理安装文件
    if exist "%PYTHON_INSTALLER%" del "%PYTHON_INSTALLER%"
)

echo.
echo [2/5] 检查pip...
python -m pip --version >nul 2>&1
if %errorlevel% equ 0 (
    echo ✓ pip已安装
) else (
    echo ✗ pip未安装，正在安装...
    python -m ensurepip --upgrade
    python -m pip install --upgrade pip
    echo ✓ pip安装完成
)

echo.
echo [3/5] 创建虚拟环境...
if exist "%VENV_DIR%" (
    echo ✓ 虚拟环境已存在
    choice /C YN /M "是否重新创建虚拟环境"
    if !errorlevel! equ 1 (
        echo 正在删除旧虚拟环境...
        rmdir /s /q "%VENV_DIR%"
        echo 正在创建新虚拟环境...
        python -m venv "%VENV_DIR%"
        echo ✓ 虚拟环境创建成功
    )
) else (
    echo 正在创建虚拟环境...
    python -m venv "%VENV_DIR%"
    echo ✓ 虚拟环境创建成功
)

echo.
echo [4/5] 安装项目依赖...
if exist "%PROJECT_DIR%requirements.txt" (
    echo 正在安装依赖包...
    call "%VENV_DIR%\Scripts\activate.bat"
    python -m pip install --upgrade pip
    pip install -r "%PROJECT_DIR%requirements.txt" -i https://pypi.tuna.tsinghua.edu.cn/simple
    
    if %errorlevel% equ 0 (
        echo ✓ 依赖安装成功
    ) else (
        echo ✗ 依赖安装失败
        pause
        exit /b 1
    )
    call "%VENV_DIR%\Scripts\deactivate.bat"
) else (
    echo ✗ requirements.txt文件不存在
    pause
    exit /b 1
)

echo.
echo [5/6] 创建启动脚本...
echo @echo off > "%PROJECT_DIR%start.bat"
echo chcp 65001 ^>nul >> "%PROJECT_DIR%start.bat"
echo title 在线出题软件 >> "%PROJECT_DIR%start.bat"
echo echo 正在启动在线出题软件... >> "%PROJECT_DIR%start.bat"
echo echo. >> "%PROJECT_DIR%start.bat"
echo call "%VENV_DIR%\Scripts\activate.bat" >> "%PROJECT_DIR%start.bat"
echo python "%PROJECT_DIR%app.py" >> "%PROJECT_DIR%start.bat"
echo call "%VENV_DIR%\Scripts\deactivate.bat" >> "%PROJECT_DIR%start.bat"
echo pause >> "%PROJECT_DIR%start.bat"
echo ✓ 启动脚本创建成功

echo.
echo [6/6] 安装Ollama AI模型...
echo.
echo Ollama是一个本地AI模型，支持离线使用
echo 模型大小: 约300MB
echo.
choice /C YN /M "是否下载Ollama和qwen2.5:0.5b模型"
if !errorlevel! equ 1 (
    echo.
    echo 正在检查Python脚本...
    if exist "%PROJECT_DIR%install_ollama.py" (
        echo 正在下载Ollama和模型...
        echo 这可能需要较长时间，请耐心等待...
        echo.
        
        call "%VENV_DIR%\Scripts\activate.bat"
        python "%PROJECT_DIR%install_ollama.py" 3
        call "%VENV_DIR%\Scripts\deactivate.bat"
        
        if %errorlevel% equ 0 (
            echo ✓ Ollama和模型下载完成
        ) else (
            echo ✗ Ollama下载失败，您可以稍后手动运行 install_ollama.py
        )
    ) else (
        echo ✗ install_ollama.py文件不存在
        echo 请确保项目文件完整
    )
) else (
    echo.
    echo 您可以稍后运行 install_ollama.py 下载Ollama
)

echo.
echo ========================================
echo    安装完成！
echo ========================================
echo.
echo 项目目录: %PROJECT_DIR%
echo 虚拟环境: %VENV_DIR%
echo.
echo 使用方法:
echo   1. 双击 start.bat 启动程序
echo   2. 在浏览器中访问 http://127.0.0.1:3000
echo   3. 如需停止程序，请在命令行窗口按 Ctrl+C
echo.
echo 注意事项:
echo   - 确保防火墙允许3000端口访问
echo   - 如需局域网访问，请使用 http://[你的IP地址]:3000
echo   - 首次运行可能需要几秒钟启动时间
echo.

choice /C YN /M "是否立即启动程序"
if !errorlevel! equ 1 (
    echo.
    echo 正在启动程序...
    echo.
    start "" "%PROJECT_DIR%start.bat"
    echo 程序已在新窗口中启动
    echo 请在浏览器中访问 http://127.0.0.1:3000
) else (
    echo.
    echo 您可以稍后双击 start.bat 启动程序
)

echo.
echo 按任意键退出...
pause >nul