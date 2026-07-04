import os

# =====================================================================
# CONFIGURATION - HACKATHON INGESTION PIPELINE
# =====================================================================

# API Provider: "gemini" or "groq"
PROVIDER = "gemini"

# Model Selection:
# - For Gemini: e.g. "gemini-2.0-flash", "gemini-2.5-flash"
# - For Groq: e.g. "llama-3.2-90b-vision-preview", "llama-3.2-11b-vision-preview"
MODEL_NAME = "gemini-2.0-flash" if PROVIDER == "gemini" else "llama-3.2-90b-vision-preview"

# API Keys:
# Read from system environment variables or fall back to hardcoded strings for convenience.
if PROVIDER == "gemini":
    # Check both GOOGLE_API_KEY (classic) and GEMINI_API_KEY (new SDK standard)
    API_KEY = os.environ.get("GOOGLE_API_KEY") or os.environ.get("GEMINI_API_KEY")
    if not API_KEY:
        # Paste your Gemini API key inside the quotes if you wish to hardcode it:
        API_KEY = "AIzaSyBhKJOkcvJq6QHBy2Bd-5RC6vsowS2nBjk"
else:
    # Paste your Groq API key inside the quotes if you wish to hardcode it:
    API_KEY = os.environ.get("GROQ_API_KEY", "PASTE_YOUR_GROQ_KEY_HERE")

# TEMPORARY DEBUGGING PRINT (masking the key for safety)
if PROVIDER == "gemini":
    _key_source = "Environment Variable" if (os.environ.get("GOOGLE_API_KEY") or os.environ.get("GEMINI_API_KEY")) else "Fallback Hardcoded String"
else:
    _key_source = "Environment Variable" if os.environ.get("GROQ_API_KEY") else "Fallback Hardcoded String"
_masked = f"{API_KEY[:4]}...{API_KEY[-4:]}" if API_KEY and len(API_KEY) > 8 else "None or Empty"
print(f"[DEBUG] config.py: Provider={PROVIDER}, Model={MODEL_NAME}, API_KEY from {_key_source}. Masked: {_masked}")
