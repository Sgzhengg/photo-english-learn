"""
检查 asr-service 的环境变量
用于诊断 DEEPINFRA_API_KEY 和 GROQ_API_KEY 是否正确配置
"""
import os

print("=" * 60)
print("ASR Service Environment Variables Check")
print("=" * 60)
print()

# 检查 DEEPINFRA_API_KEY
deepinfra_key = os.getenv("DEEPINFRA_API_KEY")

print("[DEEPINFRA_API_KEY]")
if deepinfra_key:
    print(f"  Status: Present ✅")
    print(f"  Length: {len(deepinfra_key)} characters")
    print(f"  Prefix: {deepinfra_key[:10]}...")
    print(f"  Suffix: ...{deepinfra_key[-6:]}")

    # 检查格式
    if deepinfra_key.startswith("yaJn") or len(deepinfra_key) > 40:
        print("  Format: OK")
    else:
        print(f"  Format: WARNING - unexpected format")

    # 检查是否有额外的空格或引号
    if deepinfra_key != deepinfra_key.strip():
        print("  WARNING: Has leading/trailing whitespace!")
        print(f"  Stripped key: {deepinfra_key.strip()}")

    if deepinfra_key.startswith('"') or deepinfra_key.startswith("'"):
        print("  WARNING: Has quotes!")
else:
    print("  Status: NOT FOUND ❌")
    print("  Action: Please set DEEPINFRA_API_KEY in Zeabur environment variables")

print()

# 检查 GROQ_API_KEY
groq_key = os.getenv("GROQ_API_KEY")

print("[GROQ_API_KEY]")
if groq_key:
    print(f"  Status: Present ✅")
    print(f"  Length: {len(groq_key)} characters")
    print(f"  Prefix: {groq_key[:10]}...")
    print(f"  Suffix: ...{groq_key[-6:]}")

    # 检查格式
    if groq_key.startswith("gsk_"):
        print("  Format: OK (starts with gsk_)")
    else:
        print(f"  Format: WARNING - starts with '{groq_key[:4]}'")

    # 检查是否有额外的空格或引号
    if groq_key != groq_key.strip():
        print("  WARNING: Has leading/trailing whitespace!")
        print(f"  Stripped key: {groq_key.strip()}")

    if groq_key.startswith('"') or groq_key.startswith("'"):
        print("  WARNING: Has quotes!")

    # 检查长度
    if len(groq_key) < 40:
        print("  WARNING: Key seems too short")
else:
    print("  Status: NOT FOUND")
    print("  Note: GROQ_API_KEY is optional if DEEPINFRA_API_KEY is configured")

print()
print("=" * 60)
print("Summary:")
print("=" * 60)
if deepinfra_key or groq_key:
    print("✅ At least one API key is configured")
    if deepinfra_key:
        print("  - DEEPINFRA_API_KEY: Available (recommended)")
    if groq_key:
        print("  - GROQ_API_KEY: Available (fallback)")
else:
    print("❌ No API keys configured - Speech recognition will fail!")
    print("   Please set DEEPINFRA_API_KEY or GROQ_API_KEY")

print()
print("=" * 60)
print("All Environment Variables:")
print("=" * 60)
for key, value in os.environ.items():
    if "DEEPINFRA" in key or "GROQ" in key or "API" in key or "KEY" in key:
        if "SECRET" not in key and "PASSWORD" not in key:
            print(f"  {key}: {value[:20]}..." if value and len(value) > 20 else f"  {key}: {value}")

print()
print("=" * 60)
