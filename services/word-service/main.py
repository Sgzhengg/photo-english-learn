"""
单词服务 - 单词管理、生词库、标签系统
"""
import sys
from pathlib import Path

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
    WordCreate, UserWordCreate, Tag as TagModel
)
from shared.database.database import get_async_db
from shared.utils.auth import get_current_user, get_current_user_optional
from shared.utils.response import success_response
from shared.word.dictionary import DictionaryAPI

# 初始化 FastAPI 应用
app = FastAPI(
    title="Word Service",
    description="单词服务 - 单词管理、生词库、标签系统",
    version="1.0.0"
)

# CORS 配置
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
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
    """
    # 先查数据库
    result = await db.execute(
        select(Word).where(Word.english_word == english_word.lower())
    )
    word = result.scalar_one_or_none()

    if word:
        return WordResponse.model_validate(word)

    # 从词典 API 获取
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

    return WordResponse.model_validate(new_word)


@app.get("/tags/list", response_model=List[dict], tags=["Tags"])
async def get_tags(
    db: AsyncSession = Depends(get_async_db)
):
    """
    获取所有标签
    """
    result = await db.execute(select(TagModel))
    tags = result.scalars().all()

    return [
        {
            "tag_id": tag.tag_id,
            "tag_name": tag.tag_name,
            "description": tag.description,
            "color": tag.color
        } for tag in tags
    ]


@app.get("/list", response_model=List[UserWordResponse], tags=["Words"])
async def get_word_list(
    skip: int = Query(0, ge=0, description="跳过的记录数"),
    limit: int = Query(20, ge=1, le=100, description="返回的记录数"),
    tag_id: Optional[int] = Query(None, description="按标签筛选"),
    search: Optional[str] = Query(None, description="搜索单词"),
    current_user: Annotated[Optional[User], Depends(get_current_user_optional)] = None,
    db: AsyncSession = Depends(get_async_db)
):
    """
    获取用户的生词列表

    - **skip**: 跳过的记录数（分页）
    - **limit**: 返回的记录数（最大 100）
    - **tag_id**: 按标签筛选（可选）
    - **search**: 搜索单词（可选，支持英文或中文模糊搜索）
    """
    if not current_user:
        return []
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
        response.append(UserWordResponse(
            id=uw.id,
            user_id=uw.user_id,
            word_id=uw.word_id,
            scene_id=uw.scene_id,
            tag_id=uw.tag_id,
            created_at=uw.created_at,
            word=WordResponse.model_validate(uw.word) if uw.word else None,
            tag={"tag_id": uw.tag.tag_id, "tag_name": uw.tag.tag_name, "color": uw.tag.color} if uw.tag else None
        ))

    return response


@app.post("/add", response_model=UserWordResponse, tags=["Words"])
async def add_word(
    word_data: UserWordCreate,
    current_user: Annotated[User, Depends(get_current_user)],
    db: AsyncSession = Depends(get_async_db)
):
    """
    添加生词到生词库

    - **word_id**: 单词 ID
    - **scene_id**: 来源场景 ID（可选）
    - **tag_id**: 标签 ID（默认为 1 - 生词）
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

    # 创建生词记录
    new_user_word = UserWord(
        user_id=current_user.user_id,
        word_id=word_data.word_id,
        scene_id=word_data.scene_id,
        tag_id=word_data.tag_id or 1
    )
    db.add(new_user_word)
    await db.commit()
    await db.refresh(new_user_word)

    # 创建复习记录
    from shared.word.review import create_review_record
    await create_review_record(db, current_user.user_id, word_data.word_id)

    # 加载关联数据
    await db.refresh(new_user_word, ["word", "tag"])

    return UserWordResponse(
        id=new_user_word.id,
        user_id=new_user_word.user_id,
        word_id=new_user_word.word_id,
        scene_id=new_user_word.scene_id,
        tag_id=new_user_word.tag_id,
        created_at=new_user_word.created_at,
        word=WordResponse.model_validate(new_user_word.word) if new_user_word.word else None,
        tag={"tag_id": new_user_word.tag.tag_id, "tag_name": new_user_word.tag.tag_name, "color": new_user_word.tag.color} if new_user_word.tag else None
    )


@app.get("/{word_id}", response_model=WordResponse, tags=["Words"])
async def get_word_detail(
    word_id: int,
    current_user: Annotated[User, Depends(get_current_user)],
    db: AsyncSession = Depends(get_async_db)
):
    """
    获取单词详情

    - **word_id**: 单词 ID
    """
    result = await db.execute(select(Word).where(Word.word_id == word_id))
    word = result.scalar_one_or_none()

    if not word:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="单词不存在"
        )

    return WordResponse.model_validate(word)


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

    await db.delete(user_word)
    await db.commit()

    return success_response(data={"message": "删除成功"})


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8004)
