"""
数据库初始化脚本 - 通过 API 执行
"""
from fastapi import Depends, HTTPException
from sqlalchemy import text
from shared.database.database import get_async_db, async_engine
import logging

logger = logging.getLogger(__name__)

async def initialize_database():
    """初始化数据库表和索引"""

    # 从 schema.sql 读取 SQL 语句（简化版本）
    sql_commands = [
        # 1. 创建 tags 表
        """
        CREATE TABLE IF NOT EXISTS tags (
            tag_id SERIAL PRIMARY KEY,
            tag_name VARCHAR(50) NOT NULL UNIQUE,
            description VARCHAR(255),
            color VARCHAR(7),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        """,

        # 2. 插入默认标签
        """
        INSERT INTO tags (tag_name, description, color) VALUES
        ('生词', '新学习的单词', '#FF6B6B'),
        ('学习中', '正在复习的单词', '#4ECDC4'),
        ('熟悉', '基本掌握的单词', '#45B7D1'),
        ('掌握', '已经熟练掌握的单词', '#96CEB4')
        ON CONFLICT (tag_name) DO NOTHING;
        """,

        # 3. 创建 words 表（如果不存在）
        """
        CREATE TABLE IF NOT EXISTS words (
            word_id SERIAL PRIMARY KEY,
            english_word VARCHAR(100) NOT NULL UNIQUE,
            chinese_meaning TEXT,
            phonetic_us VARCHAR(50),
            phonetic_uk VARCHAR(50),
            audio_url VARCHAR(512),
            example_sentence TEXT,
            example_translation TEXT,
            image_url VARCHAR(512),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        """,

        # 4. 创建其他核心表
        """
        CREATE TABLE IF NOT EXISTS user_words (
            id SERIAL PRIMARY KEY,
            user_id INT NOT NULL,
            word_id INT NOT NULL,
            scene_id INT,
            tag_id INT DEFAULT 1,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        """,

        # 5. 创建索引
        """
        CREATE INDEX IF NOT EXISTS idx_words_english_word ON words(english_word);
        CREATE INDEX IF NOT EXISTS idx_user_words_user_id ON user_words(user_id);
        """,
    ]

    logger.info("开始初始化数据库...")

    async with async_engine.begin() as conn:
        for i, sql in enumerate(sql_commands):
            try:
                # 移除注释和空行
                clean_sql = '\n'.join(
                    line for line in sql.split('\n')
                    if line.strip() and not line.strip().startswith('--')
                )

                if clean_sql.strip():
                    await conn.execute(text(clean_sql))
                    logger.info(f"✅ 执行 SQL 语句 {i+1}/{len(sql_commands)}")

            except Exception as e:
                logger.warning(f"⚠️  SQL {i+1} 执行失败（可能已存在）: {e}")

    logger.info("数据库初始化完成！")

if __name__ == "__main__":
    import asyncio
    asyncio.run(initialize_database())
