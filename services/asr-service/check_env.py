"""
检查 asr-service 的环境变量
用于诊断 GROQ_API_KEY 是否正确配置
"""
import os

print("=" * 60)
print("ASR Service Environment Variables Check")
print("=" * 60)
print()

# 检查 GROQ_API_KEY
groq_key = os.getenv("GROQ_API_KEY")

print("[GROQ_API_KEY]")
if groq_key:
    print(f"  Status: Present")
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

    print()
    print("  Expected value:")
    print("    YOUR_GROQ_API_KEY_HERE")
    print()
    print("  Your actual value:")
    print(f"    {groq_key}")
    print()

    # 比较
    expected = "YOUR_GROQ_API_KEY_HERE"
    if groq_key == expected:
        print("  Match: PERFECT!")
    else:
        print("  Match: DIFFERENT")
        if len(groq_key) != len(expected):
            print(f"    Length differs: {len(groq_key)} vs {len(expected)}")
        if groq_key[:10] != expected[:10]:
            print(f"    First 10 chars differ")
        if groq_key[-6:] != expected[-6:]:
            print(f"    Last 6 chars differ")

else:
    print("  Status: NOT FOUND")
    print("  Action: Please set GROQ_API_KEY in Zeabur environment variables")

print()
print("=" * 60)
print("All Environment Variables:")
print("=" * 60)
for key, value in os.environ.items():
    if "GROQ" in key or "API" in key or "KEY" in key:
        if "SECRET" not in key and "PASSWORD" not in key:
            print(f"  {key}: {value[:20]}..." if value and len(value) > 20 else f"  {key}: {value}")

print()
print("=" * 60)
