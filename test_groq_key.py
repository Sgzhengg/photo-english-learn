"""
测试 Groq API 密钥是否有效
"""
import httpx
import asyncio

async def test_groq_api():
    api_key = "YOUR_GROQ_API_KEY_HERE"

    print(f"Testing Groq API Key: {api_key[:10]}...")
    print()

    # 测试1：检查 API 密钥格式
    print("[Format Check]")
    if api_key.startswith("gsk_"):
        print("  - Prefix: gsk_ (OK)")
        print(f"  - Length: {len(api_key)} characters")
        if len(api_key) >= 40:
            print("  - Length: OK")
        else:
            print("  - Warning: Key might be too short")
    else:
        print("  - Error: Should start with 'gsk_'")

    print()

    # 测试2：调用 Groq API（简单的聊天请求测试）
    print("[API Connectivity Test - Chat Endpoint]")
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(
                "https://api.groq.com/openai/v1/chat/completions",
                headers={
                    "Authorization": f"Bearer {api_key}",
                    "Content-Type": "application/json"
                },
                json={
                    "model": "llama3-70b-8192",
                    "messages": [{"role": "user", "content": "Hello"}],
                    "max_tokens": 10
                }
            )

            print(f"  - Status Code: {response.status_code}")

            if response.status_code == 200:
                print("  - OK: API key is valid! Chat endpoint works.")
                result = response.json()
                content = result.get('choices', [{}])[0].get('message', {}).get('content', '')
                print(f"  - Response: {content}")
            elif response.status_code == 401:
                print("  - Error: API key is invalid or not authenticated")
                print(f"  - Details: {response.text}")
            elif response.status_code == 403:
                print("  - Error: API key lacks permission for this model")
                print(f"  - Details: {response.text}")
            else:
                print(f"  - Other error: {response.text}")

    except Exception as e:
        print(f"  - Connection error: {e}")

    print()

    # 测试3：测试 Whisper 音频接口
    print("[Whisper Audio Transcription Test]")
    print("  Note: Groq may not support audio transcription endpoint")

    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            # 创建一个空的测试音频请求
            response = await client.post(
                "https://api.groq.com/openai/v1/audio/transcriptions",
                headers={
                    "Authorization": f"Bearer {api_key}"
                },
                data={
                    "model": "whisper-large-v3",
                    "language": "en"
                },
                files={}
            )

            print(f"  - Status Code: {response.status_code}")

            if response.status_code == 401:
                print("  - Error: Unauthorized (invalid API key)")
            elif response.status_code == 403:
                print("  - Error: Forbidden - Groq does NOT support audio transcription!")
                print("  - This explains the 403 error in your logs.")
            elif response.status_code == 400:
                print("  - Error: Bad Request (endpoint exists but missing audio)")
                print("  - This means audio transcription IS supported!")
            else:
                print(f"  - Response: {response.text[:200]}")

    except Exception as e:
        print(f"  - Request failed: {e}")

    print()
    print("=" * 60)
    print("DIAGNOSIS:")
    print("=" * 60)

    print()
    print("Possible issues:")
    print("1. Groq may NOT support Whisper audio transcription API")
    print("2. The API key might be invalid")
    print("3. The endpoint might be different")
    print()
    print("Recommendation:")
    print("- Visit Groq docs to confirm: https://console.groq.com/docs")
    print("- If Groq doesn't support audio, use OpenAI Whisper instead")
    print()

if __name__ == "__main__":
    asyncio.run(test_groq_api())
