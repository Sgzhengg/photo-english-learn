"""
后端优化效果测试脚本
测试 Redis 缓存和请求限流功能
"""
import asyncio
import time
import httpx
import json
from typing import Dict, Any

# 配置
BASE_URL = "https://photo-english-learn-api-gateway.zeabur.app"  # 你的 API Gateway 地址（Zeabur 自动 HTTPS）
# 或直接测试单个服务：
# BASE_URL = "http://localhost:8004"  # Word Service

TEST_RESULTS = []


def log_result(test_name: str, passed: bool, details: str = ""):
    """记录测试结果"""
    result = {
        "test": test_name,
        "passed": passed,
        "details": details
    }
    TEST_RESULTS.append(result)
    status = "✅ PASS" if passed else "❌ FAIL"
    print(f"{status} - {test_name}")
    if details:
        print(f"   {details}")


async def test_cache_performance():
    """测试 Redis 缓存性能"""
    print("\n" + "="*60)
    print("🧪 测试 1: Redis 缓存性能")
    print("="*60)

    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            word = "cup"

            # 第一次查询（应该从数据库）
            start = time.time()
            response1 = await client.get(f"{BASE_URL}/word/lookup/{word}")
            time1 = (time.time() - start) * 1000

            # 第二次查询（应该从缓存）
            start = time.time()
            response2 = await client.get(f"{BASE_URL}/word/lookup/{word}")
            time2 = (time.time() - start) * 1000

            # 第三次查询（确认缓存）
            start = time.time()
            response3 = await client.get(f"{BASE_URL}/word/lookup/{word}")
            time3 = (time.time() - start) * 1000

            success = (
                response1.status_code == 200 and
                response2.status_code == 200 and
                response3.status_code == 200
            )

            if success:
                log_result(
                    "缓存功能",
                    True,
                    f"第一次: {time1:.1f}ms, 第二次: {time2:.1f}ms, 第三次: {time3:.1f}ms"
                )

                # 缓存应该显著更快
                if time2 < time1 * 0.8 or time3 < time1 * 0.8:
                    log_result(
                        "缓存加速效果",
                        True,
                        f"缓存命中时速度提升 {(time1/time2):.1f}x"
                    )
                else:
                    log_result(
                        "缓存加速效果",
                        False,
                        "缓存可能未命中或效果不明显"
                    )
            else:
                log_result(
                    "缓存功能",
                    False,
                    f"HTTP 状态码: {response1.status_code}"
                )

    except Exception as e:
        log_result("缓存功能", False, f"错误: {str(e)}")


async def test_rate_limiting():
    """测试请求限流"""
    print("\n" + "="*60)
    print("🧪 测试 2: 请求限流")
    print("="*60)

    try:
        async with httpx.AsyncClient(timeout=60.0) as client:
            # 测试登录限流（20 次/分钟）
            print("\n测试登录端点限流（应该限制在 20 次/分钟）...")

            success_count = 0
            rate_limited = False

            for i in range(25):  # 尝试 25 次
                response = await client.post(
                    f"{BASE_URL}/auth/login",
                    json={"username": "test", "password": "wrong"}
                )

                if response.status_code == 429:
                    rate_limited = True
                    log_result(
                        "请求限流",
                        True,
                        f"在第 {i+1} 次请求时触发限流 (429 Too Many Requests)"
                    )
                    break

                if response.status_code == 401:  # 登录失败是预期的
                    success_count += 1

                # 避免请求过快
                await asyncio.sleep(0.1)

            if not rate_limited:
                log_result(
                    "请求限流",
                    False,
                    f"发送了 25 次请求但未触发限流（可能限流未配置或限制太宽松）"
                )

    except Exception as e:
        log_result("请求限流", False, f"错误: {str(e)}")


async def test_database_queries():
    """测试数据库查询性能"""
    print("\n" + "="*60)
    print("🧪 测试 3: 数据库查询性能")
    print("="*60)

    try:
        async with httpx.AsyncClient(timeout=30.0) as client:

            # 测试标签列表（应该很快）
            start = time.time()
            response = await client.get(f"{BASE_URL}/word/tags/list")
            time_taken = (time.time() - start) * 1000

            if response.status_code == 200:
                log_result(
                    "标签列表查询",
                    True,
                    f"响应时间: {time_taken:.1f}ms"
                )

                # 检查数据
                data = response.json()
                if data.get("code") == 0 and "data" in data:
                    tags = data["data"]
                    log_result(
                        "标签数据结构",
                        True,
                        f"返回 {len(tags)} 个标签"
                    )
                else:
                    log_result(
                        "标签数据结构",
                        False,
                        "响应格式不符合预期"
                    )
            else:
                log_result(
                    "标签列表查询",
                    False,
                    f"HTTP 状态码: {response.status_code}"
                )

    except Exception as e:
        log_result("数据库查询", False, f"错误: {str(e)}")


async def test_service_health():
    """测试服务健康状态"""
    print("\n" + "="*60)
    print("🧪 测试 4: 服务健康检查")
    print("="*60)

    services = [
        ("Auth Service", f"{BASE_URL}/auth/"),
        ("Word Service", f"{BASE_URL}/word/"),
        ("Vision Service", f"{BASE_URL}/vision/"),
        ("Practice Service", f"{BASE_URL}/practice/"),
        ("TTS Service", f"{BASE_URL}/tts/"),
    ]

    async with httpx.AsyncClient(timeout=10.0) as client:
        for service_name, url in services:
            try:
                response = await client.get(url)
                status = response.status_code == 200
                log_result(
                    f"{service_name} 健康检查",
                    status,
                    f"状态码: {response.status_code}"
                )
            except Exception as e:
                log_result(
                    f"{service_name} 健康检查",
                    False,
                    f"连接失败: {str(e)[:50]}"
                )


def print_summary():
    """打印测试总结"""
    print("\n" + "="*60)
    print("📊 测试总结")
    print("="*60)

    total = len(TEST_RESULTS)
    passed = sum(1 for r in TEST_RESULTS if r["passed"])
    failed = total - passed

    print(f"\n总计: {total} 个测试")
    print(f"✅ 通过: {passed} 个")
    print(f"❌ 失败: {failed} 个")
    print(f"通过率: {(passed/total*100):.1f}%")

    if failed > 0:
        print("\n失败的测试:")
        for result in TEST_RESULTS:
            if not result["passed"]:
                print(f"  - {result['test']}")
                if result['details']:
                    print(f"    {result['details']}")

    print("\n" + "="*60)

    # 保存到文件
    with open("optimization_test_results.json", "w", encoding="utf-8") as f:
        json.dump(TEST_RESULTS, f, ensure_ascii=False, indent=2)
    print(f"\n详细结果已保存到: optimization_test_results.json")


async def main():
    """主测试函数"""
    print("="*60)
    print("🚀 后端优化效果测试")
    print("="*60)
    print(f"\n测试目标: {BASE_URL}")
    print(f"开始时间: {time.strftime('%Y-%m-%d %H:%M:%S')}")

    # 运行测试
    await test_service_health()
    await test_cache_performance()
    await test_database_queries()
    await test_rate_limiting()

    # 打印总结
    print_summary()


if __name__ == "__main__":
    print("\n⚠️  注意事项:")
    print("1. 确保 API Gateway 和所有服务正在运行")
    print("2. 确保 Redis 正在运行且已配置 REDIS_URL")
    print("3. 某些测试需要多次请求来验证缓存效果")
    print("4. 限流测试会发送多次请求，可能需要几秒钟\n")

    input("按回车键开始测试...")

    asyncio.run(main())
