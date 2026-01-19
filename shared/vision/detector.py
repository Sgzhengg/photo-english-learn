"""
物体检测模块
使用 YOLOv8 进行目标检测
"""
from typing import List, Dict, Any, Optional
import numpy as np
from PIL import Image
import io


class ObjectDetector:
    """物体检测器"""

    def __init__(self, model_name: str = "yolov8n"):
        """
        初始化检测器

        Args:
            model_name: 模型名称 (yolov8n, yolov8s, yolov8m, yolov8l, yolov8x)
        """
        self.model = None
        self.model_name = model_name
        self._load_model()

    def _load_model(self):
        """加载模型"""
        try:
            from ultralytics import YOLO
            self.model = YOLO(f"{self.model_name}.pt")
        except ImportError:
            # 如果没有安装 ultralytics，使用 mock 数据
            print("Warning: ultralytics not installed, using mock detector")
            self.model = None

    def detect_objects(
        self,
        image_data: bytes,
        confidence_threshold: float = 0.3,
        iou_threshold: float = 0.5
    ) -> List[Dict[str, Any]]:
        """
        检测图像中的物体

        Args:
            image_data: 图像二进制数据
            confidence_threshold: 置信度阈值
            iou_threshold: IOU 阈值

        Returns:
            检测结果列表，每个包含:
            - name: 物体名称
            - english_word: 英文单词
            - confidence: 置信度
            - bbox: 边界框 [x, y, width, height]
        """
        if self.model is None:
            return self._mock_detect(image_data)

        # 将图像数据转换为 PIL Image
        image = Image.open(io.BytesIO(image_data))

        # 进行推理
        results = self.model(
            image,
            conf=confidence_threshold,
            iou=iou_threshold,
            verbose=False
        )

        detections = []
        img_width, img_height = image.size

        for result in results:
            boxes = result.boxes
            for box in boxes:
                cls_id = int(box.cls[0])
                confidence = float(box.conf[0])
                xyxy = box.xyxy[0].tolist()

                # 获取类别名称
                class_name = self.model.names[cls_id]

                # 转换边界框格式 (xyxy -> xywh)
                x, y, x2, y2 = xyxy
                bbox = {
                    "x": x / img_width,
                    "y": y / img_height,
                    "width": (x2 - x) / img_width,
                    "height": (y2 - y) / img_height
                }

                detections.append({
                    "name": class_name,
                    "english_word": self._translate_to_english(class_name),
                    "confidence": confidence,
                    "bbox": bbox
                })

        return detections

    def _translate_to_english(self, class_name: str) -> str:
        """
        将类别名称翻译为英文单词

        Args:
            class_name: 类别名称

        Returns:
            英文单词
        """
        # YOLOv8 的类别名称已经是英文，直接返回
        # 如果需要中英文映射，可以在这里添加
        return class_name.capitalize()

    def _mock_detect(self, image_data: bytes) -> List[Dict[str, Any]]:
        """
        Mock 检测器（用于测试）

        Returns一些常见物体的 mock 数据
        """
        mock_objects = [
            {"name": "person", "english_word": "Person", "confidence": 0.95, "bbox": {"x": 0.3, "y": 0.2, "width": 0.3, "height": 0.6}},
            {"name": "cup", "english_word": "Cup", "confidence": 0.88, "bbox": {"x": 0.6, "y": 0.5, "width": 0.15, "height": 0.2}},
            {"name": "laptop", "english_word": "Laptop", "confidence": 0.92, "bbox": {"x": 0.1, "y": 0.3, "width": 0.4, "height": 0.3}},
            {"name": "book", "english_word": "Book", "confidence": 0.85, "bbox": {"x": 0.7, "y": 0.6, "width": 0.2, "height": 0.15}},
            {"name": "bottle", "english_word": "Bottle", "confidence": 0.90, "bbox": {"x": 0.5, "y": 0.4, "width": 0.1, "height": 0.25}},
        ]
        # 随机返回 2-4 个物体
        import random
        return random.sample(mock_objects, k=random.randint(2, 4))


class GroundingDINODetector:
    """Grounding DINO 检测器 - 支持文本提示的检测"""

    def __init__(self):
        """初始化 Grounding DINO 检测器"""
        self.model = None
        self._load_model()

    def _load_model(self):
        """加载模型"""
        try:
            from groundingdino.util.inference import load_model, load_image, predict, annotate
            from groundingdino.util import box_ops
            self.model = load_model(...)
        except ImportError:
            print("Warning: groundingdino not installed")

    def detect_with_text(
        self,
        image_data: bytes,
        text_prompt: str,
        box_threshold: float = 0.35,
        text_threshold: float = 0.25
    ) -> List[Dict[str, Any]]:
        """
        使用文本提示检测物体

        Args:
            image_data: 图像数据
            text_prompt: 文本提示 (例如: "cup . book . bottle")
            box_threshold: 边界框阈值
            text_threshold: 文本阈值

        Returns:
            检测结果
        """
        # TODO: 实现 Grounding DINO 检测
        pass
