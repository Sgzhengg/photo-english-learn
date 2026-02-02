#!/bin/bash
# PhotoEnglish - Frontend Build Script
# 用于构建前端静态文件

set -e

echo "🚀 Building PhotoEnglish Frontend..."
echo ""

# 检查 Node.js 是否安装
if ! command -v node &> /dev/null; then
    echo "❌ Error: Node.js is not installed"
    echo "Please install Node.js from https://nodejs.org/"
    exit 1
fi

echo "✓ Node.js version: $(node --version)"
echo "✓ npm version: $(npm --version)"
echo ""

# 进入前端目录
cd "$(dirname "$0")/frontend"

# 安装依赖
echo "📦 Installing dependencies..."
npm install

# 构建前端
echo "🔨 Building frontend..."
npm run build

# 检查构建结果
if [ -d "dist" ]; then
    echo ""
    echo "✅ Frontend build completed successfully!"
    echo "📁 Output directory: $(pwd)/dist"
    echo ""
    echo "Build artifacts:"
    ls -lh dist/
else
    echo ""
    echo "❌ Build failed - dist directory not found"
    exit 1
fi
