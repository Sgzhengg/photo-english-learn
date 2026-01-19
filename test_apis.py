"""
API 接口测试脚本
测试所有微服务的 API 接口
"""
import asyncio
import sys
from pathlib import Path

# 添加项目根目录到 Python 路径
sys.path.insert(0, str(Path(__file__).parent))

from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from shared.database.models import Base, User
from shared.database.database import get_database_url
import httpx
import json
from datetime import datetime


class APITester:
    """API 测试器"""

    def __init__(self):
        self.base_urls = {
            "auth": "http://localhost:8001",
            "vision": "http://localhost:8003",
            "word": "http://localhost:8004",
            "practice": "http://localhost:8005",
            "tts": "http://localhost:8006",
        }
        self.results = []
        self.auth_token = None
        self.test_user_id = None

    def log_result(self, service, endpoint, method, status, error=None, response_time=0):
        """记录测试结果"""
        result = {
            "service": service,
            "endpoint": endpoint,
            "method": method,
            "status": status,
            "error": error,
            "response_time": round(response_time, 2),
            "timestamp": datetime.now().isoformat()
        }
        self.results.append(result)

        # 打印结果
        status_icon = "✓" if status == "PASS" else "✗"
        print(f"{status_icon} [{service}] {method} {endpoint} - {status} ({response_time:.2f}s)")
        if error:
            print(f"  Error: {error}")

    async def test_health_check(self):
        """测试所有服务的健康检查接口"""
        print("\n=== 测试健康检查接口 ===")
        for service, base_url in self.base_urls.items():
            try:
                start_time = datetime.now()
                async with httpx.AsyncClient() as client:
                    response = await client.get(f"{base_url}/", timeout=5.0)
                    response_time = (datetime.now() - start_time).total_seconds()

                    if response.status_code == 200:
                        self.log_result(service, "/", "GET", "PASS", response_time=response_time)
                    else:
                        self.log_result(service, "/", "GET", "FAIL",
                                      f"Status code: {response.status_code}", response_time)
            except Exception as e:
                self.log_result(service, "/", "GET", "FAIL", str(e))

    async def test_auth_service(self):
        """测试认证服务"""
        print("\n=== 测试认证服务 ===")

        # 测试注册
        try:
            start_time = datetime.now()
            async with httpx.AsyncClient() as client:
                register_data = {
                    "username": f"testuser_{int(datetime.now().timestamp())}",
                    "email": f"test_{int(datetime.now().timestamp())}@example.com",
                    "password": "test123456",
                    "nickname": "测试用户"
                }
                response = await client.post(
                    f"{self.base_urls['auth']}/register",
                    json=register_data,
                    timeout=10.0
                )
                response_time = (datetime.now() - start_time).total_seconds()

                if response.status_code == 200:
                    data = response.json()
                    self.auth_token = data.get("access_token")
                    self.test_user_id = data.get("user", {}).get("user_id")
                    self.log_result("auth", "/register", "POST", "PASS", response_time=response_time)
                else:
                    self.log_result("auth", "/register", "POST", "FAIL",
                                  f"Status code: {response.status_code}, Response: {response.text[:200]}", response_time)
        except Exception as e:
            self.log_result("auth", "/register", "POST", "FAIL", str(e))

        # 测试登录
        try:
            start_time = datetime.now()
            async with httpx.AsyncClient() as client:
                login_data = {
                    "username": "testuser",
                    "password": "test123456"
                }
                response = await client.post(
                    f"{self.base_urls['auth']}/login",
                    json=login_data,
                    timeout=10.0
                )
                response_time = (datetime.now() - start_time).total_seconds()

                if response.status_code in [200, 401]:  # 401 is acceptable if user doesn't exist
                    self.log_result("auth", "/login", "POST", "PASS", response_time=response_time)
                    if response.status_code == 200:
                        data = response.json()
                        self.auth_token = data.get("access_token")
                else:
                    self.log_result("auth", "/login", "POST", "FAIL",
                                  f"Status code: {response.status_code}", response_time)
        except Exception as e:
            self.log_result("auth", "/login", "POST", "FAIL", str(e))

        # 测试获取当前用户信息（需要认证）
        if self.auth_token:
            try:
                start_time = datetime.now()
                async with httpx.AsyncClient() as client:
                    response = await client.get(
                        f"{self.base_urls['auth']}/me",
                        headers={"Authorization": f"Bearer {self.auth_token}"},
                        timeout=10.0
                    )
                    response_time = (datetime.now() - start_time).total_seconds()

                    if response.status_code == 200:
                        self.log_result("auth", "/me", "GET", "PASS", response_time=response_time)
                    else:
                        self.log_result("auth", "/me", "GET", "FAIL",
                                      f"Status code: {response.status_code}", response_time)
            except Exception as e:
                self.log_result("auth", "/me", "GET", "FAIL", str(e))

        # 测试刷新 Token（需要认证）
        if self.auth_token:
            try:
                start_time = datetime.now()
                async with httpx.AsyncClient() as client:
                    response = await client.post(
                        f"{self.base_urls['auth']}/refresh",
                        headers={"Authorization": f"Bearer {self.auth_token}"},
                        timeout=10.0
                    )
                    response_time = (datetime.now() - start_time).total_seconds()

                    if response.status_code == 200:
                        self.log_result("auth", "/refresh", "POST", "PASS", response_time=response_time)
                    else:
                        self.log_result("auth", "/refresh", "POST", "FAIL",
                                      f"Status code: {response.status_code}", response_time)
            except Exception as e:
                self.log_result("auth", "/refresh", "POST", "FAIL", str(e))

    async def test_vision_service(self):
        """测试视觉服务"""
        print("\n=== 测试视觉服务 ===")

        headers = {}
        if self.auth_token:
            headers["Authorization"] = f"Bearer {self.auth_token}"

        # 测试获取场景列表
        try:
            start_time = datetime.now()
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    f"{self.base_urls['vision']}/scenes",
                    headers=headers,
                    timeout=10.0
                )
                response_time = (datetime.now() - start_time).total_seconds()

                if response.status_code == 200:
                    self.log_result("vision", "/scenes", "GET", "PASS", response_time=response_time)
                else:
                    self.log_result("vision", "/scenes", "GET", "FAIL",
                                  f"Status code: {response.status_code}", response_time)
        except Exception as e:
            self.log_result("vision", "/scenes", "GET", "FAIL", str(e))

    async def test_word_service(self):
        """测试单词服务"""
        print("\n=== 测试单词服务 ===")

        # 测试搜索（不需要认证）
        try:
            start_time = datetime.now()
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    f"{self.base_urls['word']}/search/cup",
                    timeout=10.0
                )
                response_time = (datetime.now() - start_time).total_seconds()

                if response.status_code == 200:
                    self.log_result("word", "/search/{query}", "GET", "PASS", response_time=response_time)
                else:
                    self.log_result("word", "/search/{query}", "GET", "FAIL",
                                  f"Status code: {response.status_code}", response_time)
        except Exception as e:
            self.log_result("word", "/search/{query}", "GET", "FAIL", str(e))

        # 测试查询单词
        try:
            start_time = datetime.now()
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    f"{self.base_urls['word']}/lookup/cup",
                    timeout=10.0
                )
                response_time = (datetime.now() - start_time).total_seconds()

                if response.status_code in [200, 404]:  # 404 is acceptable if word not found
                    self.log_result("word", "/lookup/{english_word}", "GET", "PASS", response_time=response_time)
                else:
                    self.log_result("word", "/lookup/{english_word}", "GET", "FAIL",
                                  f"Status code: {response.status_code}", response_time)
        except Exception as e:
            self.log_result("word", "/lookup/{english_word}", "GET", "FAIL", str(e))

        # 测试获取标签列表
        try:
            start_time = datetime.now()
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    f"{self.base_urls['word']}/tags/list",
                    timeout=10.0
                )
                response_time = (datetime.now() - start_time).total_seconds()

                if response.status_code == 200:
                    self.log_result("word", "/tags/list", "GET", "PASS", response_time=response_time)
                else:
                    self.log_result("word", "/tags/list", "GET", "FAIL",
                                  f"Status code: {response.status_code}", response_time)
        except Exception as e:
            self.log_result("word", "/tags/list", "GET", "FAIL", str(e))

        # 测试获取生词列表（需要认证）
        if self.auth_token:
            try:
                start_time = datetime.now()
                async with httpx.AsyncClient() as client:
                    response = await client.get(
                        f"{self.base_urls['word']}/list",
                        headers={"Authorization": f"Bearer {self.auth_token}"},
                        timeout=10.0
                    )
                    response_time = (datetime.now() - start_time).total_seconds()

                    if response.status_code == 200:
                        self.log_result("word", "/list", "GET", "PASS", response_time=response_time)
                    else:
                        self.log_result("word", "/list", "GET", "FAIL",
                                      f"Status code: {response.status_code}", response_time)
            except Exception as e:
                self.log_result("word", "/list", "GET", "FAIL", str(e))

    async def test_practice_service(self):
        """测试练习服务"""
        print("\n=== 测试练习服务 ===")

        headers = {}
        if self.auth_token:
            headers["Authorization"] = f"Bearer {self.auth_token}"

        # 测试获取复习进度（需要认证）
        if self.auth_token:
            try:
                start_time = datetime.now()
                async with httpx.AsyncClient() as client:
                    response = await client.get(
                        f"{self.base_urls['practice']}/progress",
                        headers=headers,
                        timeout=10.0
                    )
                    response_time = (datetime.now() - start_time).total_seconds()

                    if response.status_code == 200:
                        self.log_result("practice", "/progress", "GET", "PASS", response_time=response_time)
                    else:
                        self.log_result("practice", "/progress", "GET", "FAIL",
                                      f"Status code: {response.status_code}", response_time)
            except Exception as e:
                self.log_result("practice", "/progress", "GET", "FAIL", str(e))

    async def test_tts_service(self):
        """测试 TTS 服务"""
        print("\n=== 测试 TTS 服务 ===")

        # 测试获取可用音色
        try:
            start_time = datetime.now()
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    f"{self.base_urls['tts']}/voices",
                    timeout=10.0
                )
                response_time = (datetime.now() - start_time).total_seconds()

                if response.status_code == 200:
                    self.log_result("tts", "/voices", "GET", "PASS", response_time=response_time)
                else:
                    self.log_result("tts", "/voices", "GET", "FAIL",
                                  f"Status code: {response.status_code}", response_time)
        except Exception as e:
            self.log_result("tts", "/voices", "GET", "FAIL", str(e))

    async def generate_report(self):
        """生成测试报告"""
        print("\n" + "="*60)
        print("测试报告汇总")
        print("="*60)

        total = len(self.results)
        passed = sum(1 for r in self.results if r["status"] == "PASS")
        failed = total - passed

        print(f"总计: {total} 个测试")
        print(f"通过: {passed} 个")
        print(f"失败: {failed} 个")
        print(f"成功率: {passed/total*100:.1f}%")

        if failed > 0:
            print("\n失败的测试:")
            for result in self.results:
                if result["status"] == "FAIL":
                    print(f"  - [{result['service']}] {result['method']} {result['endpoint']}")
                    print(f"    错误: {result['error']}")

        # 保存详细报告到文件
        report_file = "api_test_report.json"
        with open(report_file, "w", encoding="utf-8") as f:
            json.dump({
                "summary": {
                    "total": total,
                    "passed": passed,
                    "failed": failed,
                    "success_rate": f"{passed/total*100:.1f}%"
                },
                "results": self.results
            }, f, ensure_ascii=False, indent=2)
        print(f"\n详细报告已保存到: {report_file}")

    async def run_all_tests(self):
        """运行所有测试"""
        print("开始 API 测试...")
        print("="*60)

        await self.test_health_check()
        await self.test_auth_service()
        await self.test_vision_service()
        await self.test_word_service()
        await self.test_practice_service()
        await self.test_tts_service()

        await self.generate_report()


async def main():
    """主函数"""
    tester = APITester()
    await tester.run_all_tests()


if __name__ == "__main__":
    asyncio.run(main())
