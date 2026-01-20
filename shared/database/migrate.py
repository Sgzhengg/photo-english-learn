"""
数据库迁移脚本 - 创建必要的索引
在服务启动时自动执行
"""
import asyncio
import os
from sqlalchemy import text
from shared.database.database import async_engine

async def run_migrations():
    """执行数据库迁移"""

    # 需要创建的索引列表
    migrations = [
        # 用户表索引
        ("idx_users_username", "CREATE INDEX IF NOT EXISTS idx_users_username ON users(username)"),
        ("idx_users_email", "CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)"),

        # 场景表索引
        ("idx_scenes_user_id_created_at", "CREATE INDEX IF NOT EXISTS idx_scenes_user_id_created_at ON scenes(user_id, created_at DESC)"),

        # 检测到的物体索引
        ("idx_detected_objects_scene_id", "CREATE INDEX IF NOT EXISTS idx_detected_objects_scene_id ON detected_objects(scene_id)"),
        ("idx_detected_objects_english_word", "CREATE INDEX IF NOT EXISTS idx_detected_objects_english_word ON detected_objects(english_word)"),

        # 单词表索引
        ("idx_words_english_word", "CREATE INDEX IF NOT EXISTS idx_words_english_word ON words(english_word)"),

        # 用户生词索引
        ("idx_user_words_user_id_word_id", "CREATE INDEX IF NOT EXISTS idx_user_words_user_id_word_id ON user_words(user_id, word_id)"),
        ("idx_user_words_user_id_created_at", "CREATE INDEX IF NOT EXISTS idx_user_words_user_id_created_at ON user_words(user_id, created_at DESC)"),

        # 复习记录索引（重要）
        ("idx_review_records_user_id_next_review", "CREATE INDEX IF NOT EXISTS idx_review_records_user_id_next_review ON review_records(user_id, next_review_time)"),
        ("idx_review_records_next_review_time", "CREATE INDEX IF NOT EXISTS idx_review_records_next_review_time ON review_records(next_review_time)"),

        # 练习记录索引
        ("idx_practice_records_user_id_created_at", "CREATE INDEX IF NOT EXISTS idx_practice_records_user_id_created_at ON practice_records(user_id, created_at DESC)"),
    ]

    print("开始数据库迁移...")

    async with async_engine.begin() as conn:
        for index_name, sql in migrations:
            try:
                await conn.execute(text(sql))
                print(f"✅ 创建索引: {index_name}")
            except Exception as e:
                print(f"⚠️  索引 {index_name} 已存在或创建失败: {e}")

        # 更新表统计信息
        tables = ["users", "scenes", "detected_objects", "words", "user_words",
                 "tags", "scene_sentences", "review_records", "practice_records"]

        for table in tables:
            try:
                await conn.execute(text(f"ANALYZE {table}"))
                print(f"✅ 更新统计: {table}")
            except Exception as e:
                print(f"⚠️  更新统计失败 {table}: {e}")

    print("数据库迁移完成！")

if __name__ == "__main__":
    asyncio.run(run_migrations())
