"""
数据库迁移脚本：将 users.avatar_url 字段从 VARCHAR(512) 改为 TEXT

原因：
- 原字段限制 512 字符，无法存储完整的 base64 图片数据
- base64 编码的图片通常有数万到数十万字符
- 改为 TEXT 类型后可存储最大 1GB 数据

使用方法：
1. 确保设置了 DATABASE_URL 环境变量
2. 运行此脚本：python migrations/migrate_avatar_url.py
"""

import asyncio
import os
import sys
from pathlib import Path

# 添加项目根目录到 Python 路径
project_root = Path(__file__).parent.parent
sys.path.insert(0, str(project_root))

from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy import text


async def migrate():
    """执行迁移"""
    database_url = os.getenv("DATABASE_URL")

    if not database_url:
        print("❌ 错误：未设置 DATABASE_URL 环境变量")
        print("请先设置：export DATABASE_URL=your_database_url")
        sys.exit(1)

    print(f"🔗 连接数据库...")

    # 创建异步引擎
    engine = create_async_engine(database_url, echo=True)

    # 创建会话
    async_session = sessionmaker(
        engine, class_=AsyncSession, expire_on_commit=False
    )

    try:
        async with async_session() as session:
            # 检查当前字段类型
            print("\n📋 检查当前 avatar_url 字段类型...")
            result = await session.execute(text("""
                SELECT column_name, data_type, character_maximum_length
                FROM information_schema.columns
                WHERE table_name = 'users' AND column_name = 'avatar_url'
            """))

            current_type = result.fetchone()

            if current_type:
                print(f"当前类型：{current_type[1]}")
                if current_type[2]:
                    print(f"当前最大长度：{current_type[2]} 字符")

            # 执行迁移
            print("\n🔄 开始迁移...")

            try:
                await session.execute(text("""
                    ALTER TABLE users ALTER COLUMN avatar_url TYPE TEXT
                """))

                await session.commit()

                print("✅ 迁移成功！")

                # 验证迁移结果
                print("\n📋 验证迁移结果...")
                result = await session.execute(text("""
                    SELECT column_name, data_type, character_maximum_length
                    FROM information_schema.columns
                    WHERE table_name = 'users' AND column_name = 'avatar_url'
                """))

                new_type = result.fetchone()
                print(f"新类型：{new_type[1]}")
                print(f"字符最大长度：{new_type[2] or '无限制 (TEXT类型)'}")

                print("\n✅ 迁移完成！现在可以上传和显示头像了。")

            except Exception as e:
                await session.rollback()
                print(f"❌ 迁移失败：{e}")
                print("可能原因：字段已经是 TEXT 类型，或其他数据库错误")
                raise

    except Exception as e:
        print(f"\n❌ 发生错误：{e}")
        sys.exit(1)

    finally:
        await engine.dispose()


if __name__ == "__main__":
    print("=" * 60)
    print("用户头像字段迁移脚本")
    print("=" * 60)
    print()

    asyncio.run(migrate)
