"""
ASR Service 完整诊断工具
帮助诊断 Groq API 403 Forbidden 错误
"""
import os
import asyncio
import httpx
import json

def print_section(title):
    """打印分节标题"""
    print("\n" + "=" * 70)
    print(f" {title}")
    print("=" * 70)

async def main():
    print_section("ASR Service 诊断工具")

    # 1. 检查环境变量
    print("\n[1] 环境变量检查")
    groq_key = os.getenv("GROQ_API_KEY")

    if not groq_key:
        print("  ❌ GROQ_API_KEY 未设置")
        print("\n  解决方案：")
        print("  1. 在 Zeabur 控制台设置环境变量 GROQ_API_KEY")
        print("  2. 或者在本机运行：export GROQ_API_KEY='your-key-here'")
        print("\n  获取 API Key：")
        print("  - 访问 https://console.groq.com/keys")
        print("  - 创建新的 API Key")
        return

    print(f"  ✅ GROQ_API_KEY 已设置")
    print(f"  - 前10个字符: {groq_key[:10]}...")
    print(f"  - 后6个字符: ...{groq_key[-6:]}")
    print(f"  - 总长度: {len(groq_key)} 字符")

    # 检查格式
    print("\n[2] API Key 格式检查")
    if groq_key.startswith("gsk_"):
        print("  ✅ 前缀正确 (gsk_)")
    else:
        print(f"  ❌ 前缀错误: {groq_key[:4]}...")
        print("  Groq API Key 应该以 'gsk_' 开头")

    # 检查引号或空格
    clean_key = groq_key.strip()
    if groq_key.startswith('"') or groq_key.startswith("'"):
        print("  ⚠️  警告: API Key 包含引号！")
        print(f"  原始: {groq_key[:20]}...")
        print(f"  清理后: {clean_key[:20]}...")
        print("\n  解决方案：在 Zeabur 环境变量中移除引号")
    elif groq_key != clean_key:
        print("  ⚠️  警告: API Key 包含前导/尾随空格！")
    else:
        print("  ✅ 格式检查通过")

    # 检查长度
    if len(clean_key) < 40:
        print(f"  ⚠️  警告: API Key 长度 ({len(clean_key)}) 可能太短")
    else:
        print(f"  ✅ 长度正常 ({len(clean_key)} 字符)")

    # 3. 测试 Groq Chat API（基础连接测试）
    print("\n[3] Groq Chat API 测试（基础连接）")
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(
                "https://api.groq.com/openai/v1/chat/completions",
                headers={
                    "Authorization": f"Bearer {clean_key}",
                    "Content-Type": "application/json"
                },
                json={
                    "model": "llama3-70b-8192",
                    "messages": [{"role": "user", "content": "Hi"}],
                    "max_tokens": 5
                }
            )

            print(f"  - 状态码: {response.status_code}")

            if response.status_code == 200:
                print("  ✅ Groq Chat API 工作正常！")
                print("  - API Key 有效")
                result = response.json()
                content = result.get('choices', [{}])[0].get('message', {}).get('content', '')
                print(f"  - 响应: {content}")
            elif response.status_code == 401:
                print("  ❌ 401 Unauthorized: API Key 无效")
                print("  解决方案：")
                print("  1. 访问 https://console.groq.com/keys")
                print("  2. 验证 API Key 是否正确")
                print("  3. 重新生成新的 API Key")
            elif response.status_code == 403:
                print("  ❌ 403 Forbidden: 权限不足")
                print(f"  - 响应: {response.text[:200]}")
            else:
                print(f"  ⚠️  其他错误: {response.status_code}")
                print(f"  - 响应: {response.text[:200]}")
    except Exception as e:
        print(f"  ❌ 连接错误: {e}")
        print("  可能的原因：网络问题或 Groq API 不可用")

    # 4. 测试 Groq Whisper API（音频转录）
    print("\n[4] Groq Whisper Audio API 测试")
    print("  注意：检查 Groq 是否支持音频转录端点")

    try:
        # 创建一个最小的测试请求（无音频文件）
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(
                "https://api.groq.com/openai/v1/audio/transcriptions",
                headers={
                    "Authorization": f"Bearer {clean_key}"
                },
                data={
                    "model": "whisper-large-v3-turbo",
                },
                files={}
            )

            print(f"  - 状态码: {response.status_code}")

            if response.status_code == 400:
                print("  ✅ 端点存在！但缺少音频文件（这是预期的）")
                print("  - Groq 支持 Whisper 音频转录")
            elif response.status_code == 401:
                print("  ❌ 401 Unauthorized: API Key 无效")
            elif response.status_code == 403:
                print("  ❌ 403 Forbidden: Groq 不支持此端点！")
                print("\n  ⚠️  问题确认：Groq API 不支持音频转录！")
                print("\n  解决方案：使用其他 ASR 引擎")
                print("  选项 1: OpenAI Whisper API (推荐)")
                print("    - 设置 OPENAI_API_KEY 环境变量")
                print("    - 优点：高准确度，支持多语言")
                print("    - 获取: https://platform.openai.com/api-keys")
                print("\n  选项 2: 模拟模式（开发测试用）")
                print("    - 移除 GROQ_API_KEY 环境变量")
                print("    - 服务会返回固定的测试文本")
            elif response.status_code == 404:
                print("  ❌ 404 Not Found: 端点不存在")
                print("  - Groq 可能不支持音频转录")
            else:
                print(f"  - 响应: {response.text[:200]}")
    except Exception as e:
        print(f"  ❌ 请求失败: {e}")

    # 5. 总结和建议
    print_section("诊断总结和建议")

    print("\n📋 根据测试结果，采取相应行动：")
    print("\n1. 如果 Chat API 测试失败：")
    print("   → API Key 无效或网络问题")
    print("   → 验证 API Key 或检查网络连接")
    print("\n2. 如果 Chat API 成功但 Audio API 返回 403：")
    print("   → Groq 不支持音频转录（最可能的情况）")
    print("   → 使用以下替代方案：")
    print("\n     方案 A: OpenAI Whisper (推荐)")
    print("     export OPENAI_API_KEY='your-openai-key'")
    print("\n     方案 B: 移除 GROQ_API_KEY 使用模拟模式")
    print("     unset GROQ_API_KEY")
    print("\n     方案 C: 使用其他 ASR 服务")
    print("     - Azure Speech Service")
    print("     - 百度语音识别")
    print("\n3. 环境变量配置：")
    print("   在 Zeabur 控制台设置：")
    print("   - GROQ_API_KEY (如果 Groq 支持)")
    print("   - OPENAI_API_KEY (OpenAI Whisper)")
    print("   - AZURE_SPEECH_KEY + AZURE_SPEECH_REGION (Azure)")

    print("\n" + "=" * 70)
    print(" 诊断完成！")
    print("=" * 70)

if __name__ == "__main__":
    asyncio.run(main())
