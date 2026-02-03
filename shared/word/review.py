"""
复习系统 - 基于艾宾浩斯遗忘曲线
"""
from datetime import datetime, timedelta, timezone
from typing import List, Optional
from sqlalchemy import select, and_
from sqlalchemy.ext.asyncio import AsyncSession

from shared.database.models import ReviewRecord, Word


def utc_now():
    """获取当前时间（不带时区，匹配数据库 TIMESTAMP WITHOUT TIME ZONE）"""
    return datetime.now()


# 艾宾浩斯遗忘曲线间隔（分钟）
EBBINGHAUS_INTERVALS = [
    5,          # 5 分钟后
    30,         # 30 分钟后
    720,        # 12 小时后
    1440,       # 1 天后
    2880,       # 2 天后
    4320,       # 3 天后
    10080,      # 7 天后
    20160,      # 14 天后
    43200,      # 30 天后
]


async def create_review_record(
    db: AsyncSession,
    user_id: int,
    word_id: int,
    level: int = 0
) -> ReviewRecord:
    """
    创建复习记录（如果已存在则返回现有记录）

    Args:
        db: 数据库会话
        user_id: 用户 ID
        word_id: 单词 ID
        level: 难度等级（0-8，对应艾宾浩斯曲线的 9 个阶段）

    Returns:
        创建或已存在的复习记录
    """
    # 检查是否已存在该用户的该单词复习记录
    result = await db.execute(
        select(ReviewRecord).where(
            and_(
                ReviewRecord.user_id == user_id,
                ReviewRecord.word_id == word_id
            )
        )
    )
    existing_record = result.scalar_one_or_none()

    if existing_record:
        # 记录已存在，直接返回
        return existing_record

    # 创建新记录
    now = utc_now()

    # 计算下次复习时间
    # level=0 时立即可以复习，后续级别按照艾宾浩斯曲线
    if level == 0:
        # 新添加的单词立即可用
        next_review_time = now
    elif level < len(EBBINGHAUS_INTERVALS):
        interval_minutes = EBBINGHAUS_INTERVALS[level]
        next_review_time = now + timedelta(minutes=interval_minutes)
    else:
        # 已达到最高级别，设置一个很长的间隔
        next_review_time = now + timedelta(days=90)

    record = ReviewRecord(
        user_id=user_id,
        word_id=word_id,
        level=level,
        next_review_time=next_review_time,
        total_correct=0,
        total_wrong=0
    )

    db.add(record)
    await db.commit()
    await db.refresh(record)

    return record


async def get_due_reviews(
    db: AsyncSession,
    user_id: int,
    limit: int = 20
) -> List[ReviewRecord]:
    """
    获取到期的复习记录

    Args:
        db: 数据库会话
        user_id: 用户 ID
        limit: 返回数量限制

    Returns:
        到期需要复习的记录列表
    """
    now = utc_now()

    result = await db.execute(
        select(ReviewRecord)
        .where(
            and_(
                ReviewRecord.user_id == user_id,
                ReviewRecord.next_review_time <= now
            )
        )
        .order_by(ReviewRecord.next_review_time.asc())
        .limit(limit)
    )

    return result.scalars().all()


async def submit_review_result(
    db: AsyncSession,
    user_id: int,
    word_id: int,
    is_correct: bool
) -> ReviewRecord:
    """
    提交复习结果

    Args:
        db: 数据库会话
        user_id: 用户 ID
        word_id: 单词 ID
        is_correct: 是否正确

    Returns:
        更新后的复习记录
    """
    result = await db.execute(
        select(ReviewRecord).where(
            and_(
                ReviewRecord.user_id == user_id,
                ReviewRecord.word_id == word_id
            )
        )
    )
    record = result.scalar_one_or_none()

    if not record:
        # 如果记录不存在，创建一个
        return await create_review_record(db, user_id, word_id)

    now = utc_now()

    if is_correct:
        record.total_correct += 1
        # 升级：增加等级
        record.level = min(record.level + 1, len(EBBINGHAUS_INTERVALS) - 1)
    else:
        record.total_wrong += 1
        # 降级：降低等级（但不会低于 0）
        record.level = max(record.level - 1, 0)

    # 重新计算下次复习时间
    interval_minutes = EBBINGHAUS_INTERVALS[record.level]
    record.next_review_time = now + timedelta(minutes=interval_minutes)

    await db.commit()
    await db.refresh(record)

    return record


async def get_review_progress(
    db: AsyncSession,
    user_id: int
) -> dict:
    """
    获取复习进度统计

    Args:
        db: 数据库会话
        user_id: 用户 ID

    Returns:
        复习进度数据
    """
    now = utc_now()

    # 获取待复习数量
    result = await db.execute(
        select(ReviewRecord).where(
            and_(
                ReviewRecord.user_id == user_id,
                ReviewRecord.next_review_time <= now
            )
        )
    )
    pending_count = len(result.all())

    # 获取总复习记录数
    result = await db.execute(
        select(ReviewRecord).where(ReviewRecord.user_id == user_id)
    )
    all_records = result.scalars().all()
    total_count = len(all_records)

    # 计算总正确数和错误数
    total_correct = sum(r.total_correct for r in all_records)
    total_wrong = sum(r.total_wrong for r in all_records)

    return {
        "pending_review_count": pending_count,
        "total_words_count": total_count,
        "total_correct": total_correct,
        "total_wrong": total_wrong
    }
