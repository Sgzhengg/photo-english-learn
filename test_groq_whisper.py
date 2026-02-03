"""
直接测试 Groq Whisper API - 模拟真实调用
使用环境变量中的 GROQ_API_KEY
"""
import httpx
import asyncio
import os
import tempfile

async def test_groq_whisper():
    # 从环境变量读取 API key
    api_key = os.getenv("GROQ_API_KEY")

    print("=" * 60)
    print("Groq Whisper API Test")
    print("=" * 60)
    print()

    # 1. 检查 API key
    print("[1] API Key Check")
    if not api_key:
        print("  ❌ ERROR: GROQ_API_KEY not found in environment")
        print("  请先运行: set GROQ_API_KEY=your_api_key_here")
        return
    else:
        print(f"  ✓ API Key found (length: {len(api_key)})")
        print(f"  ✓ Prefix: {api_key[:10]}...")
        print(f"  ✓ Suffix: ...{api_key[-6:]}")

        # 检查格式
        if api_key.startswith("gsk_"):
            print("  ✓ Format: OK (starts with gsk_)")
        else:
            print(f"  ⚠ WARNING: Starts with '{api_key[:4]}' instead of 'gsk_'")

        # 检查空格
        if api_key != api_key.strip():
            print("  ⚠ WARNING: Has leading/trailing whitespace!")
            print(f"    Raw: '{api_key}'")
            print(f"    Strip: '{api_key.strip()}'")
            api_key = api_key.strip()

        # 检查引号
        if api_key.startswith('"') or api_key.startswith("'"):
            print("  ⚠ WARNING: Has quotes!")
            api_key = api_key.strip('"').strip("'")

    print()

    # 2. 创建一个简单的测试音频 (1秒静音)
    print("[2] Creating test audio file...")
    try:
        # 创建一个 1 秒的 WAV 文件（16kHz, 单声道, 16-bit）
        # 使用简单的 WAV 头部 + 静音数据
        sample_rate = 16000
        duration = 1  # 秒
        num_samples = sample_rate * duration

        # WAV 文件头
        wav_header = bytearray()
        wav_header.extend(b'RIFF')  # ChunkID
        wav_header.extend((36 + num_samples * 2).to_bytes(4, 'little'))  # ChunkSize
        wav_header.extend(b'WAVE')  # Format
        wav_header.extend(b'fmt ')  # Subchunk1ID
        wav_header.extend((16).to_bytes(4, 'little'))  # Subchunk1Size (16 for PCM)
        wav_header.extend((1).to_bytes(2, 'little'))  # AudioFormat (1 for PCM)
        wav_header.extend((1).to_bytes(2, 'little'))  # NumChannels (1 for mono)
        wav_header.extend(sample_rate.to_bytes(4, 'little'))  # SampleRate
        wav_header.extend((sample_rate * 2).to_bytes(4, 'little'))  # ByteRate
        wav_header.extend((2).to_bytes(2, 'little'))  # BlockAlign
        wav_header.extend((16).to_bytes(2, 'little'))  # BitsPerSample
        wav_header.extend(b'data')  # Subchunk2ID
        wav_header.extend((num_samples * 2).to_bytes(4, 'little'))  # Subchunk2Size

        # 静音数据
        silence_data = bytes(num_samples * 2)

        audio_data = bytes(wav_header) + silence_data

        print(f"  ✓ Created {len(audio_data)} bytes test audio (1s silence)")
    except Exception as e:
        print(f"  ❌ Error creating test audio: {e}")
        return

    print()

    # 3. 测试 Whisper API
    print("[3] Testing Groq Whisper API...")
    print(f"  Endpoint: https://api.groq.com/openai/v1/audio/transcriptions")
    print(f"  Model: whisper-large-v3-turbo")
    print()

    try:
        async with httpx.AsyncClient(timeout=60.0) as client:
            files = {
                "file": ("test.wav", audio_data, "audio/wav")
            }
            data = {
                "model": "whisper-large-v3-turbo",
                "language": "en",
                "response_format": "json"
            }

            print("  Sending request...")
            response = await client.post(
                "https://api.groq.com/openai/v1/audio/transcriptions",
                headers={
                    "Authorization": f"Bearer {api_key}"
                },
                files=files,
                data=data
            )

            print(f"  Status Code: {response.status_code}")
            print()

            if response.status_code == 200:
                print("  ✓ SUCCESS! API key is valid and transcription works!")
                result = response.json()
                text = result.get('text', '')
                print(f"  Transcription: '{text}'")
                if not text or text.strip() == '':
                    print("  (Empty result is expected for silence audio)")
            elif response.status_code == 401:
                print("  ❌ ERROR 401: Unauthorized")
                print("  The API key is invalid or expired.")
                print(f"  Details: {response.text[:200]}")
            elif response.status_code == 403:
                print("  ❌ ERROR 403: Forbidden")
                print("  Possible causes:")
                print("    1. API key lacks permission for audio transcription")
                print("    2. API key format is wrong (should start with 'gsk_')")
                print("    3. API key has extra spaces or quotes")
                print(f"  Details: {response.text[:200]}")
            elif response.status_code == 400:
                print("  ⚠ ERROR 400: Bad Request")
                print("  The endpoint exists but there's an issue with the request.")
                print(f"  Details: {response.text[:200]}")
            else:
                print(f"  ❌ Other error: {response.status_code}")
                print(f"  Details: {response.text[:200]}")

    except httpx.ConnectError as e:
        print(f"  ❌ Connection Error: {e}")
        print("  Check your internet connection")
    except httpx.TimeoutException:
        print(f"  ❌ Timeout: Request took too long")
    except Exception as e:
        print(f"  ❌ Unexpected error: {e}")

    print()
    print("=" * 60)


if __name__ == "__main__":
    # 提示用户设置环境变量
    if not os.getenv("GROQ_API_KEY"):
        print("=" * 60)
        print("ERROR: GROQ_API_KEY environment variable not set!")
        print("=" * 60)
        print()
        print("Please set your API key first:")
        print()
        print("  Windows CMD:")
        print("    set GROQ_API_KEY=gsk_YOUR_KEY_HERE")
        print()
        print("  Windows PowerShell:")
        print("    $env:GROQ_API_KEY='gsk_YOUR_KEY_HERE'")
        print()
        print("  Linux/Mac:")
        print("    export GROQ_API_KEY='gsk_YOUR_KEY_HERE'")
        print()
        print("=" * 60)
        exit(1)

    asyncio.run(test_groq_whisper())
