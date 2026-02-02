@echo off
REM PhotoEnglish - Frontend Build Script (Windows)
REM 用于构建前端静态文件

echo ============================================
echo  PhotoEnglish - Frontend Build Script
echo ============================================
echo.

REM 检查 Node.js 是否安装
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Node.js is not installed
    echo Please install Node.js from https://nodejs.org/
    exit /b 1
)

echo [OK] Node.js version:
node --version
echo [OK] npm version:
npm --version
echo.

REM 进入前端目录
cd /d "%~dp0frontend"

REM 安装依赖
echo [Step 1/2] Installing dependencies...
call npm install
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] npm install failed
    exit /b 1
)

REM 构建前端
echo.
echo [Step 2/2] Building frontend...
call npm run build
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] npm run build failed
    exit /b 1
)

REM 检查构建结果
if exist "dist" (
    echo.
    echo ============================================
    echo [SUCCESS] Frontend build completed!
    echo ============================================
    echo Output directory: %CD%\dist
    echo.
    dir dist\
) else (
    echo.
    echo [ERROR] Build failed - dist directory not found
    exit /b 1
)
