"""
练习服务 - 短句生成、复习系统、学习记录
"""
import sys
from pathlib import Path

# 添加项目根目录到 Python 路径（支持 Zeabur 部署）
sys.path.insert(0, str(Path(__file__).parent.parent))

from fastapi import FastAPI, Depends, HTTPException, status, Query
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_
from typing import Annotated, List, Optional
from datetime import datetime

from shared.database.models import (
    User, Scene, SceneSentence, ReviewRecord, Word,
    SceneSentenceCreate, SceneSentenceResponse, ReviewRecordResponse
)
from shared.database.database import get_async_db
from shared.utils.auth import get_current_user
from shared.utils.response import success_response
from shared.vision.scene_understanding import SceneUnderstanding
from shared.word.review import (
    get_due_reviews, submit_review_result, get_review_progress
)

# 初始化 FastAPI 应用
app = FastAPI(
    title="Practice Service",
    description="练习服务 - 短句生成、复习系统、学习记录",
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

# 初始化场景理解器
scene_understanding = SceneUnderstanding()


@app.get("/", tags=["Health"])
async def root():
    """健康检查"""
    return success_response(data={"message": "Practice Service is running", "service": "practice"})


@app.post("/practice/generate", response_model=SceneSentenceResponse, tags=["Practice"])
async def generate_sentence(
    scene_id: int,
    current_user: Annotated[User, Depends(get_current_user)],
    db: AsyncSession = Depends(get_async_db),
    difficulty: str = Query("beginner", description="难度: beginner, intermediate, advanced")
):
    """
    基于场景生成有趣的英语短句

    - **scene_id**: 场景 ID
    - **difficulty**: 难度等级 (beginner, intermediate, advanced)

    需要用户登录认证，场景必须属于当前用户
    """
    # 获取场景
    result = await db.execute(
        select(Scene).where(
            and_(
                Scene.scene_id == scene_id,
                Scene.user_id == current_user.user_id
            )
        )
    )
    scene = result.scalar_one_or_none()

    if not scene:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="场景不存在或无权访问"
        )

    # 获取场景中的物体
    from shared.database.models import DetectedObject
    result = await db.execute(
        select(DetectedObject).where(DetectedObject.scene_id == scene_id)
    )
    objects = result.scalars().all()
    object_names = [obj.english_word for obj in objects]

    # 生成短句
    sentence_data = scene_understanding.generate_sentence(
        scene.description or "",
        object_names,
        difficulty
    )

    # 保存短句
    new_sentence = SceneSentence(
        scene_id=scene_id,
        sentence_text=sentence_data["sentence"],
        sentence_translation=sentence_data.get("translation", "")
    )
    db.add(new_sentence)
    await db.commit()
    await db.refresh(new_sentence)

    # TODO: 生成 TTS 音频
    # audio_url = await tts_service.synthesize(sentence_data["sentence"])
    # new_sentence.audio_url = audio_url
    # await db.commit()

    return SceneSentenceResponse.model_validate(new_sentence)


@app.get("/practice/sentences/{scene_id}", response_model=List[SceneSentenceResponse], tags=["Practice"])
async def get_scene_sentences(
    scene_id: int,
    current_user: Annotated[User, Depends(get_current_user)],
    db: AsyncSession = Depends(get_async_db)
):
    """
    获取场景的所有短句

    - **scene_id**: 场景 ID
    - 需要用户登录认证，场景必须属于当前用户
    """
    # 先检查场景是否属于当前用户
    scene_result = await db.execute(
        select(Scene).where(
            and_(
                Scene.scene_id == scene_id,
                Scene.user_id == current_user.user_id
            )
        )
    )
    scene = scene_result.scalar_one_or_none()

    if not scene:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="场景不存在或无权访问"
        )

    result = await db.execute(
        select(SceneSentence).where(SceneSentence.scene_id == scene_id)
    )
    sentences = result.scalars().all()

    return [SceneSentenceResponse.model_validate(s) for s in sentences]


@app.get("/practice/review", response_model=List[ReviewRecordResponse], tags=["Practice"])
async def get_review_list(
    current_user: Annotated[User, Depends(get_current_user)],
    db: AsyncSession = Depends(get_async_db),
    limit: int = Query(20, ge=1, le=100, description="返回数量")
):
    """
    获取待复习的单词列表

    基于艾宾浩斯遗忘曲线，返回需要复习的单词
    需要用户登录认证
    """
    import logging
    logger = logging.getLogger(__name__)

    try:
        logger.info(f"获取用户 {current_user.username} 的复习列表，限制 {limit} 条")
        records = await get_due_reviews(db, current_user.user_id, limit)
        logger.info(f"找到 {len(records)} 条待复习记录")

        # 加载单词信息
        response = []
        for record in records:
            await db.refresh(record, ["word"])
            response.append(ReviewRecordResponse(
                record_id=record.record_id,
                user_id=record.user_id,
                word_id=record.word_id,
                level=record.level,
                next_review_time=record.next_review_time,
                total_correct=record.total_correct,
                total_wrong=record.total_wrong,
                word=record.word
            ))

        return response
    except Exception as e:
        logger.error(f"获取复习列表失败: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"获取复习列表失败: {str(e)}"
        )


@app.post("/practice/review/{word_id}", response_model=dict, tags=["Practice"])
async def submit_review(
    word_id: int,
    is_correct: bool,
    current_user: Annotated[User, Depends(get_current_user)],
    db: AsyncSession = Depends(get_async_db)
):
    """
    提交复习结果

    - **word_id**: 单词 ID
    - **is_correct**: 回答是否正确
    """
    record = await submit_review_result(
        db, current_user.user_id, word_id, is_correct
    )

    return success_response(data={
        "message": "复习记录已更新",
        "level": record.level,
        "next_review_time": record.next_review_time.isoformat()
    })


@app.get("/practice/progress", tags=["Practice"])
async def get_progress(
    current_user: Annotated[User, Depends(get_current_user)],
    db: AsyncSession = Depends(get_async_db)
):
    """
    获取复习进度统计

    返回：
    - pending_review_count: 待复习数量
    - total_words_count: 总单词数
    - total_correct: 总正确次数
    - total_wrong: 总错误次数
    """
    import logging
    logger = logging.getLogger(__name__)

    try:
        logger.info(f"获取用户 {current_user.username} 的学习进度")
        progress = await get_review_progress(db, current_user.user_id)
        logger.info(f"学习进度: {progress}")
        return success_response(data=progress)
    except Exception as e:
        logger.error(f"获取学习进度失败: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"获取学习进度失败: {str(e)}"
        )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8005)
