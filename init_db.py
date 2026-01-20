"""
数据库初始化脚本 - 独立版本
直接执行 SQL 初始化数据库
"""
import asyncio
import os
from sqlalchemy import text

# 添加项目路径
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent))

from shared.database.database import async_engine

async def init_database():
    """初始化数据库"""

    print("🚀 开始初始化数据库...")

    async with async_engine.begin() as conn:
        # 1. 创建 tags 表
        print("\n1️⃣ 创建 tags 表...")
        try:
            await conn.execute(text("""
                CREATE TABLE IF NOT EXISTS tags (
                    tag_id SERIAL PRIMARY KEY,
                    tag_name VARCHAR(50) NOT NULL UNIQUE,
                    description VARCHAR(255),
                    color VARCHAR(7),
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                );
            """))
            print("✅ tags 表创建成功")
        except Exception as e:
            print(f"⚠️  tags 表已存在或创建失败: {e}")

        # 2. 插入默认标签
        print("\n2️⃣ 插入默认标签...")
        try:
            await conn.execute(text("""
                INSERT INTO tags (tag_name, description, color) VALUES
                ('生词', '新学习的单词', '#FF6B6B'),
                ('学习中', '正在复习的单词', '#4ECDC4'),
                ('熟悉', '基本掌握的单词', '#45B7D1'),
                ('掌握', '已经熟练掌握的单词', '#96CEB4')
                ON CONFLICT (tag_name) DO NOTHING;
            """))
            print("✅ 默认标签插入成功")
        except Exception as e:
            print(f"⚠️  标签已存在或插入失败: {e}")

        # 3. 验证表创建
        print("\n3️⃣ 验证表结构...")
        result = await conn.execute(text("""
            SELECT table_name
            FROM information_schema.tables
            WHERE table_schema = 'public'
            AND table_name IN ('tags', 'words', 'user_words')
            ORDER BY table_name;
        """))

        tables = [row[0] for row in result]
        print(f"✅ 当前数据库中的表: {', '.join(tables)}")

        if 'tags' in tables:
            # 查询标签数量
            count_result = await conn.execute(text("SELECT COUNT(*) FROM tags"))
            tag_count = count_result.scalar()
            print(f"✅ tags 表中有 {tag_count} 个标签")
        else:
            print("❌ tags 表不存在")

    print("\n✅ 数据库初始化完成！")

if __name__ == "__main__":
    asyncio.run(init_database())
