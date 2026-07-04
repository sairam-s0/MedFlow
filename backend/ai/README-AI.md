# AI/OCR Ingestion Pipeline

## 1. WHAT THIS FOLDER DOES
This self-contained AI/OCR ingestion pipeline takes an uploaded medical document (such as an image or PDF of a prescription, lab report, etc.) and extracts structured data from it using a multimodal LLM. It optionally integrates with a patient's medical history to build a lightweight, RAG-style timeline and trend summary (deduplicating conditions and medications) without requiring a real vector database.

## 2. SETUP (ONE-TIME)
Follow these steps to configure the pipeline on your machine:

1. **Create and activate a virtual environment** (optional but recommended):
   ```bash
   python -m venv venv
   # Windows:
   venv\Scripts\activate
   # Mac/Linux:
   source venv/bin/activate
   ```

2. **Install dependencies**:
   ```bash
   pip install -r ai/requirements.txt
   ```

3. **Set your API Key**:
   You can either configure this in your terminal environment or fallback to pasting it directly in the code.
   
   **Option A: Environment Variable (Recommended)**
   *Mac/Linux:*
   ```bash
   export GOOGLE_API_KEY="your-gemini-api-key-here"
   ```
   *Windows (Command Prompt):*
   ```cmd
   set GOOGLE_API_KEY=your-gemini-api-key-here
   ```
   *Windows (PowerShell):*
   ```powershell
   $env:GOOGLE_API_KEY="your-gemini-api-key-here"
   ```

   **Option B: Code Fallback**
   Open `ai/config.py` and replace `"PASTE_YOUR_GEMINI_KEY_HERE"` on line 16:
   ```python
   API_KEY = os.environ.get("GOOGLE_API_KEY", "your-actual-api-key-here")
   ```

   *Note: To use Groq instead of Gemini, change `PROVIDER = "gemini"` to `PROVIDER = "groq"` on line 7 of `ai/config.py` and set your `GROQ_API_KEY` accordingly.*

## 3. HOW TO TEST WITHOUT THE FULL BACKEND
The fastest way to verify extraction is working is to use the standalone CLI test script.

1. **Place a sample file**: Drop a test image or PDF directly into the `ai/` folder (for example, `ai/my_test_image.jpg`).
2. **Point the script to the file**: Open `ai/test_pipeline.py` and modify line 17 to point to your new file:
   ```python
   TEST_FILE = os.path.join(current_dir, "my_test_image.jpg")
   ```
   *(Alternatively, you can just pass the path via command line: `python ai/test_pipeline.py ai/my_test_image.jpg`)*
3. **Run the script**:
   ```bash
   python ai/test_pipeline.py
   ```
4. **Expected Output**: The terminal will print progress steps, followed by two pretty-printed JSON blocks:
   - **Block 1**: The raw structured JSON extracted directly from the document.
   - **Block 2 (Context Test)**: The JSON output merged with a hardcoded mock medical history, showing the generated `timeline_summary`, `flagged_trend`, and `recurring_conditions`.

## 4. HOW TO TEST VIA THE TEMPORARY BROWSER ROUTE
For a quick visual check in your browser without configuring Postman:

1. Ensure your Flask server is running and the blueprint is registered.
2. Place a file named exactly `sample_prescription.jpg` inside the `ai/` folder.
3. Navigate to `http://localhost:5000/api/ai/test` in your browser.
4. The pipeline will run on that hardcoded file and return the extracted JSON directly to the screen.

**IMPORTANT**: This route is located in `ai/routes.py` (lines 65-95) and is marked with `# TEMPORARY - REMOVE BEFORE SUBMISSION`. You must delete it before the final hackathon submission.

## 5. HOW TO CONNECT THIS TO THE REAL BACKEND
To integrate this pipeline into your team's main Flask application, add these two lines to your main app runner (e.g., `app.py`):

```python
from ai.routes import ai_bp
app.register_blueprint(ai_bp)
```

### Production Route: `POST /api/ai/extract`
- **What it expects**: A `multipart/form-data` request containing a file field named `file` (the uploaded medical image or PDF).
- **Optional Form Field**: You can optionally pass `previous_events` as a JSON-stringified list of past medical event dictionaries. If omitted, the route returns the extracted event without any trend analysis.
- **What it returns**: 
  - **Without `previous_events`**: The validated JSON schema for the single document.
    ```json
    {
      "document_type": "prescription",
      "date": "2026-07-04",
      "hospital_or_clinic": "Central Hospital",
      "doctor_name": "Dr. Smith",
      "diagnosis": ["Hypertension"],
      "medications": [{"name": "Lisinopril", "dosage": "10mg", "frequency": "Daily"}],
      "lab_results": [],
      "allergies": [],
      "notes": "Follow up in one month.",
      "raw_text": "...",
      "extraction_confidence": "high"
    }
    ```
  - **With `previous_events`**: A combined object containing both the new event and the contextualized RAG-Lite summary.
    ```json
    {
      "event": { ...validated single event... },
      "context": {
        "timeline_summary": "The patient's blood pressure remains an issue, with a new Lisinopril prescription added today.",
        "flagged_trend": "Recurring hypertension diagnoses over the last 3 visits.",
        "suggested_next_visit": "Consider checking BP in 1 month.",
        "recurring_conditions": ["Hypertension"]
      }
    }
    ```
- **Error Responses**: Returns `400 Bad Request` if the file is missing or `previous_events` fails to parse. Returns `500 Internal Server Error` (with a verbose traceback for hackathon debugging) if the pipeline fails.

## 6. HOW TO TEST VIA POSTMAN / CURL
If you want to test the production endpoint directly:

**Using cURL:**
```bash
curl -X POST http://localhost:5000/api/ai/extract \
  -F "file=@/path/to/your/medical_document.pdf" \
  -F 'previous_events=[{"document_type": "lab_report", "date": "2026-01-01", "diagnosis": ["Hypertension"]}]'
```

**Using Postman:**
1. Set the method to **POST** and URL to `http://localhost:5000/api/ai/extract`.
2. Go to the **Body** tab and select **form-data**.
3. Add a key named `file`, change its type from Text to **File**, and upload your test image/PDF.
4. (Optional) Add a key named `previous_events`, keep it as **Text**, and paste in a valid JSON list of previous events.

## 7. FILE-BY-FILE QUICK REFERENCE
| File | Purpose |
|------|---------|
| `config.py` | Centralized API key, provider ("gemini" vs "groq"), and model name configuration. |
| `schema.py` | Defines the strict target JSON extraction structure and the `validate_extraction()` sanitizer. |
| `image_utils.py` | Converts uploaded images or PDFs (via PyMuPDF) into base64 format for the vision model. |
| `extractor.py` | Contains the core vision and text LLM call logic, unified prompts, and JSON parse/retry mechanisms. |
| `context_builder.py` | Deduplicates medications/diagnoses via `difflib` and runs a text LLM call to generate timeline trends. |
| `pipeline.py` | Orchestrates conversion, LLM extraction, validation, and optional context building, while printing execution timings. |
| `routes.py` | Flask Blueprint exposing the `/api/ai/extract` endpoint and the temporary `/api/ai/test` endpoint. |
| `test_pipeline.py` | CLI script to test the pipeline (raw and with mock history) completely independent of Flask. |

## 8. THINGS TO REMOVE BEFORE FINAL SUBMISSION
Before packaging this project for final review, delete the following temporary testing logic to ensure a clean codebase:
- In `ai/routes.py`: Delete the entire `test_extraction_eyeball()` function block and its route decorator (lines 65-95).
- In `ai/test_pipeline.py`: Delete the mock history block clearly marked with `# TEMPORARY - REMOVE BEFORE SUBMISSION` (lines 46-91).

## 9. COMMON ISSUES
- **`ValueError: API key is not configured`**: You forgot to set your `GOOGLE_API_KEY` (or `GROQ_API_KEY`) environment variable or update `config.py`.
- **`ImportError: PyMuPDF ('fitz') is required`**: You tried to upload a PDF but haven't installed PyMuPDF. Run `pip install pymupdf`.
- **CORS Errors**: If your frontend is blocked from calling the API, ensure `flask-cors` is installed and the `@cross_origin()` decorator is active in `routes.py`.
- **`Failed to parse LLM response`**: The LLM returned improperly formatted JSON. The pipeline automatically retries once with stricter instructions, but if it fails entirely, it returns a safe fallback dictionary with `"extraction_confidence": "low"`.
