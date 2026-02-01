#!/usr/bin/env python3
"""
预下载 YOLOv8n 模型文件
在 Docker 构建时运行，避免运行时下载
"""
import os
import sys

def download_model():
    """下载 YOLOv8n 模型到指定目录"""
    model_dir = "/app/models"
    model_name = "yolov8n.pt"
    model_path = os.path.join(model_dir, model_name)

    # 创建模型目录
    os.makedirs(model_dir, exist_ok=True)

    # 检查模型是否已存在
    if os.path.exists(model_path):
        print(f"✓ Model already exists: {model_path}")
        return True

    try:
        print(f"Downloading YOLOv8n model to {model_path}...")
        from ultralytics import YOLO

        # 加载模型（会自动下载）
        model = YOLO(model_name)

        # 复制到目标位置
        import shutil
        shutil.copy(model_name, model_path)

        # 清理临时文件
        if os.path.exists(model_name):
            os.remove(model_name)

        print(f"✓ Model downloaded successfully: {model_path}")
        print(f"  File size: {os.path.getsize(model_path) / 1024 / 1024:.2f} MB")
        return True

    except Exception as e:
        print(f"✗ Failed to download model: {e}")
        print("  Model will be downloaded on first use")
        return False

if __name__ == "__main__":
    success = download_model()
    sys.exit(0 if success else 1)
