"""
简化版测试脚本 - 直接测试 Zeabur 部署的各个服务
不通过 API Gateway，直接访问各个服务
"""
import asyncio
import time
import httpx
import json

# 各个服务的 Zeabur 地址（从 Gateway /health 获取）
SERVICES = {
    "auth": "https://photo-english-learn-auth-service.zeabur.app",
    "word": "https://word-service.zeabur.app",
    "vision": "https://vision-service.zeabur.app",
    "practice": "https://practice-service.zeabur.app",
    "tts": "https://tts-service.zeabur.app",
}

TEST_RESULTS = []


def log_result(test_name: str, passed: bool, details: str = ""):
    """记录测试结果"""
    result = {"test": test_name, "passed": passed, "details": details}
    TEST_RESULTS.append(result)
    status = "✅ PASS" if passed else "❌ FAIL"
    print(f"{status} - {test_name}")
    if details:
        print(f"   {details}")


async def test_service_health():
    """测试服务健康状态"""
    print("\n" + "="*60)
    print("🧪 测试 1: 服务健康检查")
    print("="*60)

    async with httpx.AsyncClient(timeout=10.0) as client:
        for service_name, service_url in SERVICES.items():
            try:
                response = await client.get(service_url)
                status = response.status_code == 200
                log_result(
                    f"{service_name.upper()} Service",
                    status,
                    f"状态码: {response.status_code}"
                )
            except Exception as e:
                log_result(
                    f"{service_name.upper()} Service",
                    False,
                    f"连接失败: {str(e)[:60]}"
                )


async def test_cache_performance():
    """测试 Redis 缓存性能"""
    print("\n" + "="*60)
    print("🧪 测试 2: Redis 缓存性能")
    print("="*60)

    try:
        word_service_url = SERVICES["word"]
        word = "laptop"

        async with httpx.AsyncClient(timeout=30.0) as client:
            # 第一次查询（从数据库）
            print(f"\n1️⃣ 第一次查询 '{word}' (应该从数据库)...")
            start = time.time()
            response1 = await client.get(f"{word_service_url}/lookup/{word}")
            time1 = (time.time() - start) * 1000

            if response1.status_code != 200:
                log_result("缓存功能 - 第一次查询", False, f"HTTP {response1.status_code}")
                return

            data1 = response1.json()
            log_result("缓存功能 - 第一次查询", True, f"响应时间: {time1:.1f}ms")

            # 等待一下
            await asyncio.sleep(0.5)

            # 第二次查询（应该从缓存）
            print(f"\n2️⃣ 第二次查询 '{word}' (应该从缓存)...")
            start = time.time()
            response2 = await client.get(f"{word_service_url}/lookup/{word}")
            time2 = (time.time() - start) * 1000

            if response2.status_code == 200:
                data2 = response2.json()
                log_result("缓存功能 - 第二次查询", True, f"响应时间: {time2:.1f}ms")

                # 比较速度
                if time2 < time1:
                    speedup = time1 / time2
                    log_result(
                        "缓存加速效果",
                        True,
                        f"缓存命中时速度提升 {speedup:.1f}x ({time1:.1f}ms → {time2:.1f}ms)"
                    )
                else:
                    log_result(
                        "缓存加速效果",
                        False,
                        f"缓存未加速 ({time1:.1f}ms → {time2:.1f}ms)"
                    )

            # 第三次查询（确认缓存）
            await asyncio.sleep(0.5)
            print(f"\n3️⃣ 第三次查询 '{word}' (确认缓存持续)...")
            start = time.time()
            response3 = await client.get(f"{word_service_url}/lookup/{word}")
            time3 = (time.time() - start) * 1000

            if response3.status_code == 200:
                log_result("缓存功能 - 第三次查询", True, f"响应时间: {time3:.1f}ms")

    except Exception as e:
        log_result("缓存功能", False, f"错误: {str(e)}")


async def test_rate_limiting():
    """测试请求限流"""
    print("\n" + "="*60)
    print("🧪 测试 3: 请求限流（注册端点）")
    print("="*60)

    try:
        auth_service_url = SERVICES["auth"]

        async with httpx.AsyncClient(timeout=60.0) as client:
            print("\n快速发送 15 次注册请求（限制: 10 次/分钟）...")

            rate_limited = False
            for i in range(15):
                response = await client.post(
                    f"{auth_service_url}/register",
                    json={
                        "username": f"testuser{i}",
                        "email": f"test{i}@example.com",
                        "password": "password123"
                    }
                )

                if response.status_code == 429:
                    rate_limited = True
                    log_result(
                        "请求限流",
                        True,
                        f"✅ 在第 {i+1} 次请求时触发限流 (HTTP 429)"
                    )
                    break

                # 打印进度
                if (i + 1) % 5 == 0:
                    print(f"  已发送 {i+1} 次请求...")

                # 避免请求过快
                await asyncio.sleep(0.2)

            if not rate_limited:
                log_result(
                    "请求限流",
                    False,
                    "发送了 15 次请求但未触发限流"
                )

    except Exception as e:
        log_result("请求限流", False, f"错误: {str(e)}")


async def test_database_queries():
    """测试数据库查询性能"""
    print("\n" + "="*60)
    print("🧪 测试 4: 数据库查询性能")
    print("="*60)

    try:
        word_service_url = SERVICES["word"]

        async with httpx.AsyncClient(timeout=30.0) as client:

            # 测试标签列表（应该很快）
            print("\n1️⃣ 测试标签列表查询...")
            start = time.time()
            response = await client.get(f"{word_service_url}/tags/list")
            time_taken = (time.time() - start) * 1000

            if response.status_code == 200:
                data = response.json()
                # Word Service 直接返回列表，不是包装格式
                if isinstance(data, list):
                    tags = data
                else:
                    tags = data.get("data", [])
                log_result(
                    "标签列表查询",
                    True,
                    f"响应时间: {time_taken:.1f}ms, 返回 {len(tags)} 个标签"
                )
            else:
                log_result(
                    "标签列表查询",
                    False,
                    f"HTTP 状态码: {response.status_code}"
                )

            # 测试单词搜索
            print("\n2️⃣ 测试单词搜索...")
            start = time.time()
            response = await client.get(f"{word_service_url}/search/cup")
            time_taken = (time.time() - start) * 1000

            if response.status_code == 200:
                log_result(
                    "单词搜索查询",
                    True,
                    f"响应时间: {time_taken:.1f}ms"
                )
            else:
                log_result(
                    "单词搜索查询",
                    False,
                    f"HTTP 状态码: {response.status_code}"
                )

    except Exception as e:
        log_result("数据库查询", False, f"错误: {str(e)}")


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
        print("\n❌ 失败的测试:")
        for result in TEST_RESULTS:
            if not result["passed"]:
                print(f"  - {result['test']}")
                if result['details']:
                    print(f"    {result['details']}")

    print("\n" + "="*60)

    # 保存到文件
    with open("test_results_simple.json", "w", encoding="utf-8") as f:
        json.dump(TEST_RESULTS, f, ensure_ascii=False, indent=2)
    print(f"\n📄 详细结果已保存到: test_results_simple.json")


async def main():
    """主测试函数"""
    print("="*60)
    print("🚀 后端优化效果测试（直接访问服务）")
    print("="*60)
    print(f"\n开始时间: {time.strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"测试环境: Zeabur 部署")

    # 运行测试
    await test_service_health()
    await test_cache_performance()
    await test_database_queries()
    await test_rate_limiting()

    # 打印总结
    print_summary()


if __name__ == "__main__":
    print("\n⚠️  注意事项:")
    print("1. 此脚本直接测试 Zeabur 上的各个服务")
    print("2. 不通过 API Gateway，避免路由问题")
    print("3. 确保所有服务正在运行")
    print("4. 限流测试会发送多次请求\n")

    input("按回车键开始测试...")

    asyncio.run(main())
