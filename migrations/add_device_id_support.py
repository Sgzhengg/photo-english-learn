#!/usr/bin/env python3
"""
添加设备ID支持 - 数据库迁移脚本
用于在Zeabur等云环境中执行数据库迁移
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
    print("🔄 开始执行数据库迁移：添加设备ID支持...")

    async with async_engine.begin() as conn:
        try:
            # 检查device_id列是否已存在
            result = await conn.execute(text(
                "SHOW COLUMNS FROM users LIKE 'device_id'"
            ))
            device_id_exists = result.fetchone() is not None

            if not device_id_exists:
                print("📝 添加 device_id 列...")
                await conn.execute(text(
                    "ALTER TABLE users ADD COLUMN device_id VARCHAR(255) UNIQUE DEFAULT NULL"
                ))
                await conn.execute(text(
                    "CREATE INDEX idx_device_id ON users(device_id)"
                ))
                print("✅ device_id 列添加成功")
            else:
                print("ℹ️  device_id 列已存在，跳过")

            # 检查is_anonymous列是否已存在
            result = await conn.execute(text(
                "SHOW COLUMNS FROM users LIKE 'is_anonymous'"
            ))
            is_anonymous_exists = result.fetchone() is not None

            if not is_anonymous_exists:
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
                "SHOW COLUMNS FROM users"
            ))
            columns = [row[0] for row in result.fetchall()]
            print(f"📊 当前users表的列: {', '.join(columns)}")

            if 'device_id' in columns and 'is_anonymous' in columns:
                print("🎉 所有必需的列都已存在，迁移成功！")
                return True
            else:
                print("❌ 迁移可能未完全成功，请检查")
                return False

        except Exception as e:
            print(f"❌ 迁移失败: {str(e)}")
            import traceback
            traceback.print_exc()
            return False


if __name__ == "__main__":
    success = asyncio.run(migrate())
    sys.exit(0 if success else 1)
