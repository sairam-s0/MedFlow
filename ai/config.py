import os

# =====================================================================
# CONFIGURATION - HACKATHON INGESTION PIPELINE
# =====================================================================

# API Provider: "gemini" or "groq"
PROVIDER = "gemini"

# Model Selection:
# - For Gemini: e.g. "gemini-2.0-flash", "gemini-1.5-flash"
# - For Groq: e.g. "llama-3.2-90b-vision-preview", "llama-3.2-11b-vision-preview"
MODEL_NAME = "gemini-2.0-flash" if PROVIDER == "gemini" else "llama-3.2-90b-vision-preview"

# API Keys:
# Read from system environment variables or fall back to hardcoded strings for convenience.
if PROVIDER == "gemini":
    # Paste your Gemini API key inside the quotes if you wish to hardcode it:
    API_KEY = os.environ.get("GOOGLE_API_KEY", "AQ.Ab8RN6LJ5RgHbJFU3kzq7ZB3MIP__1fGDjj3zKt-8sLsGswmNA")
else:
    # Paste your Groq API key inside the quotes if you wish to hardcode it:
    API_KEY = os.environ.get("GROQ_API_KEY", "PASTE_YOUR_GROQ_KEY_HERE")
