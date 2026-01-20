"""
诊断 Word Service 错误
"""
import httpx
import json

WORD_SERVICE = "https://word-service.zeabur.app"

print("="*60)
print("🔍 诊断 Word Service")
print("="*60)

# 测试各个端点
endpoints = [
    ("/", "根路径"),
    ("/lookup/cup", "查询单词"),
    ("/tags/list", "标签列表"),
    ("/list", "生词列表"),
    ("/search/cup", "搜索单词"),
]

for path, description in endpoints:
    print(f"\n测试: {description} - {path}")
    try:
        response = httpx.get(f"{WORD_SERVICE}{path}", timeout=10)
        print(f"  状态码: {response.status_code}")

        if response.status_code == 200:
            data = response.json()
            print(f"  ✅ 成功")
            if "data" in data:
                print(f"  数据类型: {type(data['data']).__name__}")
        else:
            print(f"  ❌ 失败")
            try:
                error = response.json()
                print(f"  错误详情: {json.dumps(error, indent=2, ensure_ascii=False)}")
            except:
                print(f"  响应内容: {response.text[:200]}")

    except Exception as e:
        print(f"  ❌ 异常: {e}")

print("\n" + "="*60)
print("\n📝 请检查 Zeabur Word Service 的日志查看详细错误信息")
print("="*60)
