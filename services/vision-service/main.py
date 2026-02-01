"""
视觉服务 - 图像识别、目标检测、场景理解
"""
import sys
from pathlib import Path

# 添加项目根目录到 Python 路径（支持 Zeabur 部署）
sys.path.insert(0, str(Path(__file__).parent.parent))

from fastapi import FastAPI, Depends, HTTPException, status, File, UploadFile, Form
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import Annotated, Optional, List
import base64
import io
import os
from datetime import datetime

from shared.database.models import User, Scene, DetectedObject, SceneCreate, SceneResponse, DetectedObjectCreate, DetectedObjectResponse
from shared.database.database import get_async_db
from shared.utils.auth import get_current_user, get_current_user_optional
from shared.utils.response import success_response
from shared.utils.rate_limit import limit_expensive
from shared.vision.detector import ObjectDetector
from shared.vision.scene_understanding import SceneUnderstanding

# 初始化 FastAPI 应用
app = FastAPI(
    title="Vision Service",
    description="视觉服务 - 图像识别、目标检测、场景理解",
    version="1.0.0"
)

# CORS 配置
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",  # Vite 默认端口
        "http://localhost:3000",  # 其他常用端口
        "http://localhost:5174",  # 备用端口
        "http://127.0.0.1:5173",
        "http://127.0.0.1:3000",
        "*",  # 开发环境允许所有来源
    ],
    allow_credentials=False,  # 使用 False 时可以用 "*"
    allow_methods=["*"],
    allow_headers=["*"],
)

# 初始化 AI 模型
detector = ObjectDetector()
scene_understanding = SceneUnderstanding()


@app.get("/", tags=["Health"])
async def root():
    """健康检查"""
    return success_response(data={"message": "Vision Service is running", "service": "vision"})


@app.post("/photo/recognize", tags=["Vision"])
@limit_expensive(max_requests=10, window_seconds=60)
async def recognize_photo(
    file: UploadFile = File(...),
    current_user: Annotated[Optional[User], Depends(get_current_user_optional)] = None,
    db: AsyncSession = Depends(get_async_db)
):
    """
    拍照识别单词（前端专用接口）

    - **file**: 上传的图片文件

    返回：
    - 识别出的单词列表
    - 场景描述（英文）
    - 场景翻译（中文）

    限流：每个用户/IP 每分钟最多 10 次
    """
    import logging
    logger = logging.getLogger(__name__)

    try:
        # 读取图片数据
        image_data = await file.read()
        logger.info(f"收到图片识别请求，大小: {len(image_data)} 字节")

        # 使用目标检测模型检测物体
        logger.info("开始检测物体...")
        detections = detector.detect_objects(image_data)
        logger.info(f"检测到 {len(detections)} 个物体")

        # 生成场景描述（英文句子 + 中文翻译）
        # 首先生成基础描述用于上下文
        base_description = scene_understanding.generate_description(image_data, detections, language="zh")
        logger.info(f"基础场景描述: {base_description}")

        # 提取检测到的物体英文名称
        objects = [det.get('english_word', det['name']) for det in detections]

        # 生成英文学习句子和中文翻译
        sentence_result = scene_understanding.generate_sentence(
            scene_description=base_description,
            objects=objects,
            difficulty="beginner"
        )

        description = sentence_result["sentence"]  # 英文句子
        translation = sentence_result["translation"]  # 中文翻译

        logger.info(f"英文句子: {description}")
        logger.info(f"中文翻译: {translation}")

        # 将检测结果转换为前端期望的单词格式
        words = []
        for idx, det in enumerate(detections):
            words.append({
                "id": f"word-{idx}",
                "word": det.get('english_word', det['name']),
                "phonetic": f"/{det['name']}/",  # 简化的音标
                "definition": det['name'],  # 中文名称作为释义
                "pronunciationUrl": "",  # TODO: 使用 TTS 服务生成发音
                "isSaved": False,
                "positionInSentence": idx
            })

        # 获取用户 ID（如果已登录）
        user_id = "anonymous"
        if current_user:
            user_id = str(current_user.user_id)

        return success_response(data={
            "photo": {
                "id": f"photo-{datetime.now().timestamp()}",
                "userId": user_id,
                "imageUrl": f"data:{file.content_type};base64,{base64.b64encode(image_data).decode('utf-8')}",
                "thumbnailUrl": f"data:{file.content_type};base64,{base64.b64encode(image_data).decode('utf-8')}",
                "capturedAt": datetime.now().isoformat(),
                "location": "识别成功",
                "status": "completed"
            },
            "words": words,
            "sceneDescription": description,
            "sceneTranslation": translation
        })

    except Exception as e:
        logger.error(f"图片识别失败: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"图片识别失败: {str(e)}"
        )


@app.post("/analyze", response_model=SceneResponse, tags=["Vision"])
@limit_expensive(max_requests=10, window_seconds=60)  # 图片分析限流：10 次/分钟
async def analyze_scene(
    image: UploadFile = File(...),
    description: Optional[str] = Form(None),
    current_user: Annotated[Optional[User], Depends(get_current_user_optional)] = None,
    db: AsyncSession = Depends(get_async_db)
):
    """
    分析场景照片

    - **image**: 上传的图片文件
    - **description**: 场景描述（可选）

    返回：
    - 检测到的物体列表（包含位置、置信度）
    - 场景描述

    限流：每个用户/IP 每分钟最多 10 次
    """
    import logging
    logger = logging.getLogger(__name__)

    try:
        # 读取图片数据
        image_data = await image.read()
        logger.info(f"收到图片分析请求，大小: {len(image_data)} 字节")

        # 上传图片到对象存储（这里简化为 base64，实际应使用 MinIO/S3）
        # TODO: 集成 MinIO 或 S3
        image_base64 = base64.b64encode(image_data).decode('utf-8')
        image_url = f"data:{image.content_type};base64,{image_base64}"

        # 使用目标检测模型检测物体
        logger.info("开始检测物体...")
        detections = detector.detect_objects(image_data)
        logger.info(f"检测到 {len(detections)} 个物体")

        # 获取用户 ID（如果已登录）
        user_id = 1
        if current_user:
            user_id = current_user.user_id
            logger.info(f"用户已登录: {current_user.username}")
        else:
            logger.info("用户未登录，使用默认用户 ID: 1")

        # 创建场景记录
        new_scene = Scene(
            user_id=user_id,
            image_url=image_url,
            description=description or scene_understanding.generate_description(image_data, detections)
        )
        db.add(new_scene)
        await db.commit()
        await db.refresh(new_scene)
        logger.info(f"创建场景记录: scene_id={new_scene.scene_id}")

        # 保存检测到的物体
        detected_objects = []
        for det in detections:
            obj = DetectedObject(
                scene_id=new_scene.scene_id,
                object_name=det['name'],
                english_word=det['english_word'],
                confidence=det['confidence'],
                bounding_box=det.get('bbox')
            )
            db.add(obj)
            detected_objects.append(obj)

        await db.commit()
        await db.refresh(new_scene)
        logger.info(f"保存了 {len(detected_objects)} 个物体")

        return SceneResponse(
            scene_id=new_scene.scene_id,
            user_id=new_scene.user_id,
            image_url=new_scene.image_url,
            description=new_scene.description,
            created_at=new_scene.created_at,
            detected_objects=[
                DetectedObjectResponse(
                    object_id=obj.object_id,
                    scene_id=obj.scene_id,
                    object_name=obj.object_name,
                    english_word=obj.english_word,
                    confidence=obj.confidence,
                    bounding_box=obj.bounding_box
                ) for obj in detected_objects
            ]
        )
    except Exception as e:
        logger.error(f"图片分析失败: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"图片分析失败: {str(e)}"
        )


@app.get("/objects/{scene_id}", response_model=List[DetectedObjectResponse], tags=["Vision"])
async def get_scene_objects(
    scene_id: int,
    current_user: Annotated[User, Depends(get_current_user)],
    db: AsyncSession = Depends(get_async_db)
):
    """
    获取场景中的物体列表

    - **scene_id**: 场景 ID
    """
    # 获取场景
    result = await db.execute(select(Scene).where(Scene.scene_id == scene_id))
    scene = result.scalar_one_or_none()

    if not scene:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="场景不存在"
        )

    # 验证权限
    if scene.user_id != current_user.user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="无权访问该场景"
        )

    # 获取检测到的物体
    result = await db.execute(
        select(DetectedObject).where(DetectedObject.scene_id == scene_id)
    )
    objects = result.scalars().all()

    return [
        DetectedObjectResponse(
            object_id=obj.object_id,
            scene_id=obj.scene_id,
            object_name=obj.object_name,
            english_word=obj.english_word,
            confidence=obj.confidence,
            bounding_box=obj.bounding_box
        ) for obj in objects
    ]


@app.get("/scenes", response_model=List[SceneResponse], tags=["Vision"])
async def list_scenes(
    skip: int = 0,
    limit: int = 20,
    current_user: Annotated[Optional[User], Depends(get_current_user_optional)] = None,
    db: AsyncSession = Depends(get_async_db)
):
    """
    获取用户的场景列表

    - **skip**: 跳过的记录数
    - **limit**: 返回的记录数
    """
    query = select(Scene)
    if current_user:
        query = query.where(Scene.user_id == current_user.user_id)

    query = query.order_by(Scene.created_at.desc()).offset(skip).limit(limit)
    result = await db.execute(query)
    scenes = result.scalars().all()

    return [
        SceneResponse(
            scene_id=scene.scene_id,
            user_id=scene.user_id,
            image_url=scene.image_url,
            description=scene.description,
            created_at=scene.created_at
        ) for scene in scenes
    ]


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8003)
