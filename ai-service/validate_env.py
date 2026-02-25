"""
validate_env.py — Pre-flight dependency checker for the AI Service.

Run before starting uvicorn to catch missing packages early.
Exit code 0 = all good, 1 = something is missing.

Usage:  python validate_env.py
"""
import sys
import importlib
import shutil

REQUIRED_PACKAGES = [
    ("fastapi", "fastapi"),
    ("uvicorn", "uvicorn"),
    ("ollama", "ollama"),
    ("whisper", "openai-whisper"),
    ("pydantic", "pydantic"),
    ("dotenv", "python-dotenv"),
    ("numpy", "numpy"),
    ("pdfplumber", "pdfplumber"),
    ("fitz", "pymupdf"),
    ("edge_tts", "edge-tts"),
    ("faiss", "faiss-cpu"),
    ("sklearn", "scikit-learn"),
    ("aiohttp", "aiohttp"),
    ("requests", "requests"),
]

OPTIONAL_PACKAGES = [
    ("langchain_huggingface", "langchain-huggingface"),
    ("langchain_community", "langchain-community"),
    ("langchain_core", "langchain-core"),
    ("sentence_transformers", "sentence-transformers"),
]

def check_python():
    v = sys.version_info
    ok = v.major == 3 and v.minor >= 10
    status = "OK" if ok else "FAIL (need 3.10+)"
    print(f"  {'✅' if ok else '❌'} Python {v.major}.{v.minor}.{v.micro} — {status}")
    return ok

def check_package(module_name: str, pip_name: str, required: bool = True):
    try:
        importlib.import_module(module_name)
        print(f"  ✅ {pip_name}")
        return True
    except ImportError:
        tag = "REQUIRED" if required else "optional"
        print(f"  {'❌' if required else '⚠️'}  {pip_name} — MISSING ({tag}: pip install {pip_name})")
        return False

def check_ollama():
    if shutil.which("ollama"):
        print("  ✅ Ollama CLI found")
        try:
            import requests
            r = requests.get("http://localhost:11434/api/tags", timeout=3)
            if r.status_code == 200:
                models = [m["name"] for m in r.json().get("models", [])]
                print(f"  ✅ Ollama server online — models: {', '.join(models[:5])}")
                return True
            else:
                print(f"  ⚠️  Ollama server returned {r.status_code}")
        except Exception:
            print("  ⚠️  Ollama server not reachable (will retry at startup)")
        return True  # Non-fatal
    else:
        print("  ⚠️  Ollama CLI not found in PATH")
        return True  # Non-fatal

def main():
    print("\n🔍 AI Service — Environment Validation")
    print("=" * 50)

    all_ok = True

    print("\n📌 Python:")
    if not check_python():
        all_ok = False

    print("\n📦 Required Packages:")
    for mod, pip in REQUIRED_PACKAGES:
        if not check_package(mod, pip, required=True):
            all_ok = False

    print("\n📦 Optional Packages (RAG/Embeddings):")
    for mod, pip in OPTIONAL_PACKAGES:
        check_package(mod, pip, required=False)

    print("\n🤖 Ollama:")
    check_ollama()

    print("\n" + "=" * 50)
    if all_ok:
        print("✅ All required dependencies satisfied. Ready to start.\n")
        sys.exit(0)
    else:
        print("❌ Missing required dependencies. Fix above issues first.\n")
        sys.exit(1)

if __name__ == "__main__":
    main()
