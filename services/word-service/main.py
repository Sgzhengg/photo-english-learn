"""
单词服务 - 单词管理、生词库、标签系统
"""
import sys
from pathlib import Path
import logging

# 添加项目根目录到 Python 路径（支持 Zeabur 部署）
sys.path.insert(0, str(Path(__file__).parent.parent))

from fastapi import FastAPI, Depends, HTTPException, status, Query
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, or_, and_
from typing import Annotated, List, Optional
from datetime import datetime

from shared.database.models import (
    User, Word, UserWord, Tag, UserWordResponse, WordResponse,
    WordCreate, UserWordCreate, Tag as TagModel, ReviewRecord
)
from shared.database.database import get_async_db
from shared.utils.auth import get_current_user, get_current_user_optional
from shared.utils.response import success_response
from shared.utils.cache import cached, CachePolicy
from shared.word.dictionary import DictionaryAPI

logger = logging.getLogger(__name__)

# 初始化 FastAPI 应用
app = FastAPI(
    title="Word Service",
    description="单词服务 - 单词管理、生词库、标签系统",
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

# 初始化词典 API
dictionary = DictionaryAPI()


@app.get("/", tags=["Health"])
async def root():
    """健康检查"""
    return success_response(data={"message": "Word Service is running", "service": "word"})


@app.get("/search/{query}", response_model=List[WordResponse], tags=["Words"])
async def search_words(
    query: str,
    limit: int = Query(10, ge=1, le=50),
    db: AsyncSession = Depends(get_async_db)
):
    """
    搜索单词（全局搜索，不限制用户）

    - **query**: 搜索关键词（英文或中文）
    - **limit**: 返回结果数量
    """
    result = await db.execute(
        select(Word).where(
            or_(
                Word.english_word.contains(query),
                Word.chinese_meaning.contains(query)
            )
        ).limit(limit)
    )
    words = result.scalars().all()

    return [WordResponse.model_validate(w) for w in words]


@app.get("/lookup/{english_word}", response_model=WordResponse, tags=["Words"])
async def lookup_word(
    english_word: str,
    db: AsyncSession = Depends(get_async_db)
):
    """
    查询单词（如果数据库中没有，会从词典 API 获取并保存）

    - **english_word**: 英文单词

    使用缓存策略：单词查询结果缓存 24 小时
    """
    # 先查数据库
    result = await db.execute(
        select(Word).where(Word.english_word == english_word.lower())
    )
    word = result.scalar_one_or_none()

    if word:
        logger.info(f"单词从数据库获取: {english_word}")
        return WordResponse.model_validate(word)

    # 从词典 API 获取
    logger.info(f"从词典 API 获取单词: {english_word}")
    word_data = await dictionary.lookup(english_word)
    if not word_data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="单词不存在"
        )

    # 保存到数据库
    new_word = Word(**word_data)
    db.add(new_word)
    await db.commit()
    await db.refresh(new_word)

    # 尝试缓存到 Redis
    try:
        from shared.utils.cache import get_cache
        cache = get_cache()
        if cache and await cache.is_available():
            cache_key = f"word_lookup:{english_word.lower()}"
            await cache.set(cache_key, WordResponse.model_validate(new_word).model_dump(), CachePolicy.WORD_LOOKUP_TTL)
            logger.info(f"单词已缓存: {english_word}")
    except Exception as e:
        logger.warning(f"缓存单词失败: {e}")

    return WordResponse.model_validate(new_word)


@app.get("/vocabulary/tags", response_model=List[dict], tags=["Tags"])
async def get_vocabulary_tags(
    db: AsyncSession = Depends(get_async_db)
):
    """
    获取所有标签（/vocabulary/tags 别名）
    """
    return await get_tags(db)


@app.get("/tags/list", response_model=List[dict], tags=["Tags"])
async def get_tags(
    db: AsyncSession = Depends(get_async_db)
):
    """
    获取所有标签

    使用缓存策略：标签列表缓存 24 小时
    """
    # 尝试从缓存获取
    try:
        from shared.utils.cache import get_cache
        cache = get_cache()
        if cache and await cache.is_available():
            cache_key = "tags_list"
            cached_tags = await cache.get(cache_key)
            if cached_tags:
                logger.info("标签列表从缓存获取")
                return cached_tags
    except Exception as e:
        logger.debug(f"读取标签缓存失败: {e}")

    # 从数据库获取
    result = await db.execute(select(TagModel))
    tags = result.scalars().all()

    tags_list = [
        {
            "tag_id": tag.tag_id,
            "tag_name": tag.tag_name,
            "description": tag.description,
            "color": tag.color
        } for tag in tags
    ]

    # 缓存结果
    try:
        cache = get_cache()
        if cache and await cache.is_available():
            await cache.set("tags_list", tags_list, CachePolicy.TAGS_LIST_TTL)
            logger.info("标签列表已缓存")
    except Exception as e:
        logger.debug(f"缓存标签列表失败: {e}")

    return tags_list


@app.get("/list", response_model=List[UserWordResponse], tags=["Words"])
async def get_word_list(
    skip: int = Query(0, ge=0, description="跳过的记录数"),
    limit: int = Query(20, ge=1, le=100, description="返回的记录数"),
    tag_id: Optional[int] = Query(None, description="按标签筛选"),
    search: Optional[str] = Query(None, description="搜索单词"),
    current_user: Annotated[User, Depends(get_current_user)],
    db: AsyncSession = Depends(get_async_db)
):
    """
    获取用户的生词列表

    - **skip**: 跳过的记录数（分页）
    - **limit**: 返回的记录数（最大 100）
    - **tag_id**: 按标签筛选（可选）
    - **search**: 搜索单词（可选，支持英文或中文模糊搜索）
    """
    query = select(UserWord).where(UserWord.user_id == current_user.user_id)

    # 标签筛选
    if tag_id is not None:
        query = query.where(UserWord.tag_id == tag_id)

    # 搜索
    if search:
        query = query.join(Word).where(
            or_(
                Word.english_word.contains(search),
                Word.chinese_meaning.contains(search)
            )
        )

    query = query.order_by(UserWord.created_at.desc()).offset(skip).limit(limit)
    result = await db.execute(query)
    user_words = result.scalars().all()

    # 加载关联数据
    response = []
    for uw in user_words:
        await db.refresh(uw, ["word", "tag"])

        # 查询复习记录
        review_result = await db.execute(
            select(ReviewRecord).where(
                and_(
                    ReviewRecord.user_id == current_user.user_id,
                    ReviewRecord.word_id == uw.word_id
                )
            )
        )
        review_record = review_result.scalar_one_or_none()

        # 计算总复习次数
        total_correct = review_record.total_correct if review_record else 0
        total_wrong = review_record.total_wrong if review_record else 0
        review_count = total_correct + total_wrong

        response.append(UserWordResponse(
            id=uw.id,
            user_id=uw.user_id,
            word_id=uw.word_id,
            scene_id=uw.scene_id,
            tag_id=uw.tag_id,
            created_at=uw.created_at,
            word=WordResponse.model_validate(uw.word) if uw.word else None,
            tag={"tag_id": uw.tag.tag_id, "tag_name": uw.tag.tag_name, "color": uw.tag.color} if uw.tag else None,
            total_correct=total_correct,
            total_wrong=total_wrong,
            review_count=review_count
        ))

    return response


@app.post("/add", response_model=UserWordResponse, tags=["Words"])
async def add_word(
    word_data: UserWordCreate,
    current_user: Annotated[User, Depends(get_current_user)],
    db: AsyncSession = Depends(get_async_db)
):
    """
    添加生词到生词库（性能优化版）

    - **word_id**: 单词 ID
    - **scene_id**: 来源场景 ID（可选）
    - **tag_id**: 标签 ID（默认为 1 - 生词）
    - **chinese_meaning**: 中文释义（可选，来自 vision-service）
    - **phonetic_us**: 美式音标（可选，来自 vision-service）
    - **phonetic_uk**: 英式音标（可选，来自 vision-service）
    - **example_sentence**: 例句（可选，来自 vision-service）
    - **example_translation**: 例句翻译（可选，来自 vision-service）

    需要用户登录认证
    """
    # 检查是否已存在
    result = await db.execute(
        select(UserWord).where(
            and_(
                UserWord.user_id == current_user.user_id,
                UserWord.word_id == word_data.word_id
            )
        )
    )
    existing = result.scalar_one_or_none()

    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="该单词已在生词库中"
        )

    # 如果提供了单词详情，更新数据库中的单词记录
    if word_data.chinese_meaning or word_data.phonetic_us:
        try:
            word_result = await db.execute(select(Word).where(Word.word_id == word_data.word_id))
            word = word_result.scalar_one_or_none()

            if word:
                # 更新单词详情
                if word_data.chinese_meaning:
                    word.chinese_meaning = word_data.chinese_meaning
                if word_data.phonetic_us:
                    word.phonetic_us = word_data.phonetic_us
                if word_data.phonetic_uk:
                    word.phonetic_uk = word_data.phonetic_uk
                if word_data.example_sentence:
                    word.example_sentence = word_data.example_sentence
                if word_data.example_translation:
                    word.example_translation = word_data.example_translation
                logger.info(f"✅ Updated word {word.word_id} with vision-service data")
        except Exception as e:
            logger.warning(f"Failed to update word details (non-critical): {e}")

    # 创建生词记录
    new_user_word = UserWord(
        user_id=current_user.user_id,
        word_id=word_data.word_id,
        scene_id=word_data.scene_id,
        tag_id=word_data.tag_id or 1
    )
    db.add(new_user_word)

    # 创建复习记录（不立即提交，合并到主事务）
    try:
        from shared.word.review import create_review_record
        await create_review_record(db, current_user.user_id, word_data.word_id, commit=False)
        logger.info(f"Created review record for user {current_user.user_id}, word {word_data.word_id}")
    except Exception as e:
        logger.warning(f"Failed to create review record (non-critical): {e}")

    # 一次性提交所有更改（单词更新、生词记录、复习记录）
    await db.commit()

    # 刷新以获取生成的ID和关联数据
    await db.refresh(new_user_word, ["word", "tag"])

    return UserWordResponse(
        id=new_user_word.id,
        user_id=new_user_word.user_id,
        word_id=new_user_word.word_id,
        scene_id=new_user_word.scene_id,
        tag_id=new_user_word.tag_id,
        created_at=new_user_word.created_at,
        word=WordResponse.model_validate(new_user_word.word) if new_user_word.word else None,
        tag={"tag_id": new_user_word.tag.tag_id, "tag_name": new_user_word.tag.tag_name, "color": new_user_word.tag.color} if new_user_word.tag else None,
        total_correct=0,  # 新添加的单词，还没有复习记录
        total_wrong=0,
        review_count=0
    )


@app.get("/{user_word_id}", response_model=UserWordResponse, tags=["Words"])
async def get_word_detail(
    user_word_id: int,
    current_user: Annotated[User, Depends(get_current_user)],
    db: AsyncSession = Depends(get_async_db)
):
    """
    获取用户生词记录的单词详情

    - **user_word_id**: 用户生词记录 ID（UserWord.id）

    返回完整的单词信息，包括中文释义、音标等
    """
    # 先查找用户生词记录
    result = await db.execute(
        select(UserWord).where(
            and_(
                UserWord.id == user_word_id,
                UserWord.user_id == current_user.user_id
            )
        )
    )
    user_word = result.scalar_one_or_none()

    if not user_word:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="生词记录不存在"
        )

    # 加载关联的单词和标签数据
    await db.refresh(user_word, ["word", "tag"])

    if not user_word.word:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="单词数据不存在"
        )

    # 查询复习记录
    review_result = await db.execute(
        select(ReviewRecord).where(
            and_(
                ReviewRecord.user_id == current_user.user_id,
                ReviewRecord.word_id == user_word.word_id
            )
        )
    )
    review_record = review_result.scalar_one_or_none()

    # 计算总复习次数
    total_correct = review_record.total_correct if review_record else 0
    total_wrong = review_record.total_wrong if review_record else 0
    review_count = total_correct + total_wrong

    # 返回完整的用户生词响应
    return UserWordResponse(
        id=user_word.id,
        user_id=user_word.user_id,
        word_id=user_word.word_id,
        scene_id=user_word.scene_id,
        tag_id=user_word.tag_id,
        created_at=user_word.created_at,
        word=WordResponse.model_validate(user_word.word),
        tag={"tag_id": user_word.tag.tag_id, "tag_name": user_word.tag.tag_name, "color": user_word.tag.color} if user_word.tag else None,
        total_correct=total_correct,
        total_wrong=total_wrong,
        review_count=review_count
    )


@app.put("/{word_id}/tag", response_model=dict, tags=["Words"])
async def update_word_tag(
    word_id: int,
    tag_id: int,
    current_user: Annotated[User, Depends(get_current_user)],
    db: AsyncSession = Depends(get_async_db)
):
    """
    更新生词的标签

    - **word_id**: 用户生词记录 ID
    - **tag_id**: 新的标签 ID
    """
    result = await db.execute(
        select(UserWord).where(
            and_(
                UserWord.id == word_id,
                UserWord.user_id == current_user.user_id
            )
        )
    )
    user_word = result.scalar_one_or_none()

    if not user_word:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="生词记录不存在"
        )

    user_word.tag_id = tag_id
    await db.commit()

    return success_response(data={"message": "标签更新成功"})


@app.delete("/{word_id}", response_model=dict, tags=["Words"])
async def delete_word(
    word_id: int,
    current_user: Annotated[User, Depends(get_current_user)],
    db: AsyncSession = Depends(get_async_db)
):
    """
    从生词库中删除单词

    - **word_id**: 用户生词记录 ID

    同时删除对应的复习记录，保持数据一致性
    """
    result = await db.execute(
        select(UserWord).where(
            and_(
                UserWord.id == word_id,
                UserWord.user_id == current_user.user_id
            )
        )
    )
    user_word = result.scalar_one_or_none()

    if not user_word:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="生词记录不存在"
        )

    # 保存 word_id 用于删除复习记录
    word_id_to_delete = user_word.word_id

    # 删除生词记录
    await db.delete(user_word)

    # 同时删除对应的复习记录（保持数据一致性）
    try:
        from shared.database.models import ReviewRecord
        review_result = await db.execute(
            select(ReviewRecord).where(
                and_(
                    ReviewRecord.user_id == current_user.user_id,
                    ReviewRecord.word_id == word_id_to_delete
                )
            )
        )
        review_records = review_result.scalars().all()

        # 删除所有匹配的复习记录
        for record in review_records:
            await db.delete(record)

        logger.info(f"删除了 {len(review_records)} 条复习记录")
    except Exception as e:
        logger.warning(f"删除复习记录失败（非关键错误）: {e}")

    await db.commit()

    return success_response(data={"message": "删除成功"})


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8004)
