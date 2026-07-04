import json
import re
import base64

try:
    from ai import config
    from ai import schema
except ImportError:
    import config
    import schema

PROMPT = """You are an expert AI medical assistant and OCR engine.
Your task is to analyze the provided image of a medical document (such as a prescription, lab report, discharge summary, radiology report, operation notes, or vaccination record), read all text, and extract data into a structured JSON object.

Extract and fill in the following JSON schema:
{
  "document_type": "lab_report | prescription | discharge_summary | vaccination | radiology | operation",
  "date": "YYYY-MM-DD or null if unknown",
  "hospital_or_clinic": "string or null",
  "doctor_name": "string or null",
  "diagnosis": ["list of conditions/diagnoses mentioned"],
  "medications": [
    {
      "name": "string",
      "dosage": "string",
      "frequency": "string"
    }
  ],
  "lab_results": [
    {
      "test_name": "string",
      "value": "string",
      "unit": "string",
      "reference_range": "string",
      "flag": "normal/high/low or null"
    }
  ],
  "allergies": ["list, if mentioned"],
  "notes": "any free-text summary or important notes the model wants to add",
  "raw_text": "full text extracted from the document, verbatim",
  "extraction_confidence": "high | medium | low"
}

Strict Rules:
1. Extract all text verbatim and map it to the respective fields.
2. If a field is not mentioned in the document, use null or an empty list [] depending on the expected type. Never invent, hallucinate, or assume any information.
3. For "document_type", choose exactly one of: "lab_report", "prescription", "discharge_summary", "vaccination", "radiology", "operation", or "unknown".
4. For "raw_text", transcribe the entire text of the document word-for-word, retaining headers, labels, and table contents where possible.
5. OCR and handwriting in the document may be imperfect, blurry, or partially illegible. Use medical context and common sense to infer the most likely correct values (e.g., correct obvious misspellings of drug names, standard units, common diagnoses) rather than transcribing garbage literally. However, you must NEVER invent or hallucinate data that is not reasonably implied by the visible text.
6. For "extraction_confidence", self-report how confident you are in the overall extraction (choose exactly one of: "high", "medium", "low") based on the clarity and legibility of the document.
7. Return ONLY a valid JSON object. Do not include markdown code block formatting (such as ```json) unless explicitly asked.
"""

def clean_json_string(s: str) -> str:
    """Strips markdown code blocks or surrounding text to find the raw JSON string."""
    s = s.strip()
    # Strip markdown code blocks like ```json ... ``` or ``` ... ```
    s = re.sub(r"^```(?:json)?\s*", "", s)
    s = re.sub(r"\s*```$", "", s)
    s = s.strip()
    return s

def _call_llm(base64_image: str, mime_type: str, prompt: str) -> str:
    """Interacts with the selected LLM provider using the credentials from config.py."""
    if not config.API_KEY or "PASTE_YOUR_" in config.API_KEY:
        raise ValueError(
            f"API key is not configured for provider '{config.PROVIDER}'. "
            f"Please set the appropriate environment variable or edit ai/config.py."
        )

    if config.PROVIDER == "gemini":
        try:
            from google import genai
            from google.genai import types
        except ImportError:
            raise ImportError(
                "google-genai SDK is not installed. Run: pip install google-genai"
            )

        masked_key = (
            f"{config.API_KEY[:2]}...{config.API_KEY[-2:]}" 
            if config.API_KEY and len(config.API_KEY) > 4 else "Short/Empty Key"
        )

        try:
            # Explicitly initialize the client using the API key
            client = genai.Client(api_key=config.API_KEY)
            
            # Convert base64 string to image bytes for Gemini
            image_bytes = base64.b64decode(base64_image)
            image_part = types.Part.from_bytes(
                data=image_bytes,
                mime_type=mime_type
            )

            response = client.models.generate_content(
                model=config.MODEL_NAME,
                contents=[image_part, prompt],
                config={
                    'response_mime_type': 'application/json'
                }
            )
            return response.text
        except Exception as e:
            print(f"[-] Gemini Vision call failed! API_KEY (masked): {masked_key}")
            print(f"[-] Exception details: {e}")
            raise e

    elif config.PROVIDER == "groq":
        try:
            from groq import Groq
        except ImportError:
            raise ImportError("groq client is not installed. Run: pip install groq")

        client = Groq(api_key=config.API_KEY)
        
        # Groq vision model takes base64 data URLs
        image_url = f"data:{mime_type};base64,{base64_image}"

        completion = client.chat.completions.create(
            model=config.MODEL_NAME,
            messages=[
                {
                    "role": "user",
                    "content": [
                        {"type": "text", "text": prompt},
                        {
                            "type": "image_url",
                            "image_url": {
                                "url": image_url
                            }
                        }
                    ]
                }
            ],
            response_format={"type": "json_object"}
        )
        return completion.choices[0].message.content

    else:
        raise ValueError(f"Unsupported provider specified in config.py: {config.PROVIDER}")

def extract_medical_data(base64_image: str, mime_type: str) -> dict:
    """
    Main extraction function: sends base64 image and prompt to selected provider.
    Parses and handles retry mechanism if first attempt parsing fails.
    """
    response_text = ""
    try:
        # First attempt
        response_text = _call_llm(base64_image, mime_type, PROMPT)
        cleaned = clean_json_string(response_text)
        return json.loads(cleaned)
    except Exception as e:
        print(f"[-] Initial extraction/parsing failed: {e}. Attempting recovery retry...")
        try:
            # Stricter prompt for second attempt
            retry_prompt = (
                PROMPT + 
                "\n\nCRITICAL: Your previous response failed to parse as valid JSON. "
                "You MUST output raw valid JSON ONLY. Do NOT use markdown code blocks (```json ... ```). "
                "Ensure all quotes are properly escaped and no trailing commas exist."
            )
            response_text = _call_llm(base64_image, mime_type, retry_prompt)
            cleaned = clean_json_string(response_text)
            return json.loads(cleaned)
        except Exception as e2:
            print(f"[-] Recovery retry failed: {e2}. Returning safe fallback dict.")
            # Build safe fallback response
            return {
                "document_type": "unknown",
                "date": None,
                "hospital_or_clinic": None,
                "doctor_name": None,
                "diagnosis": [],
                "medications": [],
                "lab_results": [],
                "allergies": [],
                "notes": f"LLM parsing failed. Original Error: {e}. Retry Error: {e2}",
                "raw_text": response_text if response_text else "OCR conversion failed completely.",
                "extraction_confidence": "low"
            }

def call_text_llm(prompt: str) -> str:
    """Interacts with the selected LLM provider using the credentials from config.py for text-only completion."""
    if not config.API_KEY or "PASTE_YOUR_" in config.API_KEY:
        raise ValueError(
            f"API key is not configured for provider '{config.PROVIDER}'. "
            f"Please set the appropriate environment variable or edit ai/config.py."
        )

    if config.PROVIDER == "gemini":
        try:
            from google import genai
        except ImportError:
            raise ImportError(
                "google-genai SDK is not installed. Run: pip install google-genai"
            )

        masked_key = (
            f"{config.API_KEY[:2]}...{config.API_KEY[-2:]}" 
            if config.API_KEY and len(config.API_KEY) > 4 else "Short/Empty Key"
        )

        try:
            # Explicitly initialize the client using the API key
            client = genai.Client(api_key=config.API_KEY)
            
            response = client.models.generate_content(
                model=config.MODEL_NAME,
                contents=prompt,
                config={
                    'response_mime_type': 'application/json'
                }
            )
            return response.text
        except Exception as e:
            print(f"[-] Gemini Text call failed! API_KEY (masked): {masked_key}")
            print(f"[-] Exception details: {e}")
            raise e

    elif config.PROVIDER == "groq":
        try:
            from groq import Groq
        except ImportError:
            raise ImportError("groq client is not installed. Run: pip install groq")

        client = Groq(api_key=config.API_KEY)
        
        completion = client.chat.completions.create(
            model=config.MODEL_NAME,
            messages=[
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            response_format={"type": "json_object"}
        )
        return completion.choices[0].message.content

    else:
        raise ValueError(f"Unsupported provider specified in config.py: {config.PROVIDER}")
