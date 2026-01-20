"""
通过 API Gateway 检查所有服务健康状态
"""
import httpx
import json

GATEWAY_URL = "https://photo-english-learn-api-gateway.zeabur.app"

print("="*60)
print("🔍 检查 API Gateway 和所有服务")
print("="*60)

# 1. 测试 Gateway 根路径
print("\n1️⃣ 测试 Gateway 根路径...")
try:
    response = httpx.get(f"{GATEWAY_URL}/", timeout=10)
    print(f"状态码: {response.status_code}")
    print(f"响应: {json.dumps(response.json(), indent=2, ensure_ascii=False)}")
except Exception as e:
    print(f"❌ 失败: {e}")

# 2. 测试 Gateway 健康检查
print("\n2️⃣ 测试 Gateway /health 端点...")
try:
    response = httpx.get(f"{GATEWAY_URL}/health", timeout=10)
    print(f"状态码: {response.status_code}")
    if response.status_code == 200:
        data = response.json()
        print(f"\n所有服务状态:")
        print(json.dumps(data, indent=2, ensure_ascii=False))
    else:
        print(f"响应: {response.text}")
except Exception as e:
    print(f"❌ 失败: {e}")

# 3. 测试各个服务的路径（通过 Gateway）
print("\n3️⃣ 测试各个服务路径（通过 Gateway）...")

test_paths = [
    ("Auth Service", "/register"),
    ("Word Service", "/word/list"),
    ("Vision Service", "/vision/scenes"),
    ("Practice Service", "/practice/review"),
    ("TTS Service", "/tts/voices"),
]

for service_name, path in test_paths:
    try:
        response = httpx.get(f"{GATEWAY_URL}{path}", timeout=10)
        status = "✅" if response.status_code in [200, 401] else "❌"
        print(f"{status} {service_name}: {path} -> HTTP {response.status_code}")
        if response.status_code not in [200, 401, 404]:
            print(f"   响应: {response.text[:100]}")
    except Exception as e:
        print(f"❌ {service_name}: {path} -> 错误: {str(e)[:50]}")

print("\n" + "="*60)
