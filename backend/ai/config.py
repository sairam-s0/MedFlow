import os

# =====================================================================
# CONFIGURATION - AI INGESTION PIPELINE
# =====================================================================

def _load_local_env_file(path: str) -> None:
    """Load simple KEY=VALUE pairs for local Windows startup without extra deps."""
    if not os.path.exists(path):
        return

    with open(path, "r", encoding="utf-8") as env_file:
        for raw_line in env_file:
            line = raw_line.strip()
            if not line or line.startswith("#") or "=" not in line:
                continue
            key, value = line.split("=", 1)
            key = key.strip()
            value = value.strip().strip('"').strip("'")
            os.environ.setdefault(key, value)


_CONFIG_DIR = os.path.dirname(os.path.abspath(__file__))
_BACKEND_DIR = os.path.dirname(_CONFIG_DIR)
_PROJECT_DIR = os.path.dirname(_BACKEND_DIR)
_load_local_env_file(os.path.join(_PROJECT_DIR, ".env"))
_load_local_env_file(os.path.join(_BACKEND_DIR, ".env"))

SUPPORTED_PROVIDERS = {"gemini", "groq"}

# Set AI_PROVIDER=groq or AI_PROVIDER=gemini in Vercel/local env.
# Default to Groq for this project; Gemini is available when explicitly selected.
PROVIDER = os.environ.get("AI_PROVIDER", "groq").strip().lower()
if PROVIDER not in SUPPORTED_PROVIDERS:
    raise ValueError(
        f"Unsupported AI_PROVIDER '{PROVIDER}'. Expected one of: "
        f"{', '.join(sorted(SUPPORTED_PROVIDERS))}."
    )

DEFAULT_MODELS = {
    "gemini": "gemini-2.0-flash",
    "groq": "meta-llama/llama-4-scout-17b-16e-instruct",
}

MODEL_ENV_VARS = {
    "gemini": "GEMINI_MODEL",
    "groq": "GROQ_MODEL",
}

MODEL_NAME = os.environ.get(MODEL_ENV_VARS[PROVIDER], DEFAULT_MODELS[PROVIDER])

if PROVIDER == "gemini":
    API_KEY = os.environ.get("GOOGLE_API_KEY") or os.environ.get("GEMINI_API_KEY")
    KEY_ENV_NAME = "GOOGLE_API_KEY/GEMINI_API_KEY"
else:
    API_KEY = os.environ.get("GROQ_API_KEY")
    KEY_ENV_NAME = "GROQ_API_KEY"

_masked = f"{API_KEY[:4]}...{API_KEY[-4:]}" if API_KEY and len(API_KEY) > 8 else "not set"
print(
    f"[AI config] Provider={PROVIDER}, Model={MODEL_NAME}, "
    f"{KEY_ENV_NAME}={_masked}"
)
