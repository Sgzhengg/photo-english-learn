#!/usr/bin/env python3
"""
修复匿名用户登录问题 - 数据库迁移脚本
主要修复：允许 password_hash 字段为 NULL
"""
import sys
import os
from pathlib import Path

# 添加项目根目录到Python路径
sys.path.insert(0, str(Path(__file__).parent.parent))

import asyncio
from sqlalchemy import text
from shared.database.database import async_engine


async def migrate():
    """执行数据库迁移"""
    print("🔄 开始执行数据库迁移：修复password_hash字段...")

    async with async_engine.begin() as conn:
        try:
            # 1. 修改 password_hash 为允许 NULL
            print("📝 修改 password_hash 字段为允许 NULL...")
            await conn.execute(text(
                "ALTER TABLE users ALTER COLUMN password_hash DROP NOT NULL"
            ))
            print("✅ password_hash 字段修改成功")

            # 2. 检查并添加 is_anonymous 字段
            result = await conn.execute(text(
                "SELECT column_name FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'is_anonymous'"
            ))
            has_is_anonymous = result.fetchone() is not None

            if not has_is_anonymous:
                print("📝 添加 is_anonymous 列...")
                await conn.execute(text(
                    "ALTER TABLE users ADD COLUMN is_anonymous INT DEFAULT 0"
                ))
                print("✅ is_anonymous 列添加成功")
            else:
                print("ℹ️  is_anonymous 列已存在，跳过")

            print("✅ 数据库迁移完成！")

            # 验证迁移结果
            result = await conn.execute(text(
                "SELECT column_name, data_type, is_nullable FROM information_schema.columns WHERE table_name = 'users' ORDER BY ordinal_position"
            ))
            columns = result.fetchall()

            print("\n📊 当前users表结构:")
            for col in columns:
                nullable = "NULL" if col.is_nullable == "YES" else "NOT NULL"
                print(f"  - {col.column_name}: {col.data_type} {nullable}")

            return True

        except Exception as e:
            print(f"❌ 迁移失败: {str(e)}")
            import traceback
            traceback.print_exc()
            return False


if __name__ == "__main__":
    success = asyncio.run(migrate())
    sys.exit(0 if success else 1)
