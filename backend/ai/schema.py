# Target schema definition and validation helper for medical document ingestion pipeline.

# Python representation/documentation of the target JSON schema
SCHEMA_TEMPLATE = {
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
    "allergies": ["list of allergies mentioned"],
    "notes": "any free-text summary the model wants to add",
    "raw_text": "full text extracted from the document, verbatim",
    "extraction_confidence": "high | medium | low"
}

def validate_extraction(data: dict) -> dict:
    """
    Sanitizes, validates, and fills missing fields in the extracted medical JSON data
    to prevent backend crashes due to missing keys or unexpected types.
    """
    if not isinstance(data, dict):
        data = {}

    cleaned = {}

    # 1. Document Type: string, mapped to a fixed set of allowed types
    allowed_types = {"lab_report", "prescription", "discharge_summary", "vaccination", "radiology", "operation", "unknown"}
    doc_type = data.get("document_type")
    if isinstance(doc_type, str):
        doc_type = doc_type.strip().lower()
        if doc_type not in allowed_types:
            doc_type = "unknown"
    else:
        doc_type = "unknown"
    cleaned["document_type"] = doc_type

    # 2. Date: string (YYYY-MM-DD) or None
    date_val = data.get("date")
    cleaned["date"] = str(date_val).strip() if isinstance(date_val, str) and date_val else None

    # 3. Hospital/Clinic Name: string or None
    hospital = data.get("hospital_or_clinic")
    cleaned["hospital_or_clinic"] = str(hospital).strip() if isinstance(hospital, str) and hospital else None

    # 4. Doctor Name: string or None
    doctor = data.get("doctor_name")
    cleaned["doctor_name"] = str(doctor).strip() if isinstance(doctor, str) and doctor else None

    # 5. Diagnosis: list of strings
    diag = data.get("diagnosis")
    if isinstance(diag, list):
        cleaned["diagnosis"] = [str(d).strip() for d in diag if d is not None]
    else:
        cleaned["diagnosis"] = []

    # 6. Medications: list of objects with name, dosage, frequency
    meds = data.get("medications")
    cleaned["medications"] = []
    if isinstance(meds, list):
        for m in meds:
            if isinstance(m, dict):
                cleaned["medications"].append({
                    "name": str(m.get("name", "") or "").strip(),
                    "dosage": str(m.get("dosage", "") or "").strip(),
                    "frequency": str(m.get("frequency", "") or "").strip()
                })

    # 7. Lab Results: list of objects with test_name, value, unit, reference_range, flag
    labs = data.get("lab_results")
    cleaned["lab_results"] = []
    if isinstance(labs, list):
        for l in labs:
            if isinstance(l, dict):
                flag_val = l.get("flag")
                if isinstance(flag_val, str):
                    flag_val = flag_val.strip().lower()
                    if flag_val not in {"normal", "high", "low"}:
                        flag_val = None
                else:
                    flag_val = None

                cleaned["lab_results"].append({
                    "test_name": str(l.get("test_name", "") or "").strip(),
                    "value": str(l.get("value", "") or "").strip(),
                    "unit": str(l.get("unit", "") or "").strip(),
                    "reference_range": str(l.get("reference_range", "") or "").strip(),
                    "flag": flag_val
                })

    # 8. Allergies: list of strings
    allergies = data.get("allergies")
    if isinstance(allergies, list):
        cleaned["allergies"] = [str(a).strip() for a in allergies if a is not None]
    else:
        cleaned["allergies"] = []

    # 9. Notes: string or None
    notes_val = data.get("notes")
    cleaned["notes"] = str(notes_val).strip() if isinstance(notes_val, str) and notes_val else None

    # 10. Raw Text: string, defaults to empty string
    raw_text_val = data.get("raw_text")
    cleaned["raw_text"] = str(raw_text_val).strip() if raw_text_val is not None else ""

    # 11. Extraction Confidence: high | medium | low, defaults to "low"
    confidence = data.get("extraction_confidence")
    if isinstance(confidence, str):
        confidence = confidence.strip().lower()
        if confidence not in {"high", "medium", "low"}:
            confidence = "low"
    else:
        confidence = "low"
    cleaned["extraction_confidence"] = confidence

    return cleaned
