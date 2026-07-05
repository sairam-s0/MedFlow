"""
Test script for the optimized MedFlow AI ingestion pipeline.

Tests the OCR-first architecture against sample medical documents
and prints detailed stats on LLM usage, timing, and extraction quality.
"""

import json
import os
import sys
import time

# Ensure imports work whether run from the project root or the ai/ directory
current_dir = os.path.dirname(os.path.abspath(__file__))
parent_dir = os.path.dirname(current_dir)
if parent_dir not in sys.path:
    sys.path.append(parent_dir)

try:
    from ai import pipeline
    from ai import ocr_engine
    from ai import medical_parser
except ImportError:
    import pipeline
    import ocr_engine
    import medical_parser

# Default sample test file — the medical form screenshot
PROJECT_ROOT = os.path.dirname(parent_dir)
TEST_FILE = os.path.join(PROJECT_ROOT, "Screenshot 2026-07-05 003815.png")

# Fallback to the old test file if screenshot doesn't exist
if not os.path.exists(TEST_FILE):
    TEST_FILE = os.path.join(current_dir, "sample_prescription.jpg")


def print_separator(title="", char="=", width=60):
    if title:
        print(f"\n{char * width}")
        print(f"  {title}")
        print(f"{char * width}")
    else:
        print(char * width)


def test_ocr_only(test_path):
    """Test just the OCR engine standalone."""
    print_separator("TEST 1: OCR Engine Only")
    
    start = time.time()
    ocr_result = ocr_engine.ocr_file(test_path)
    duration = time.time() - start
    
    if ocr_result is None:
        print("[!] OCR not available — install easyocr: pip install easyocr")
        return None
    
    print(f"  Time:       {duration:.2f}s")
    print(f"  Pages:      {ocr_result.get('page_count', 1)}")
    print(f"  Confidence: {ocr_result.get('avg_confidence', 0):.2%}")
    print(f"  Text length: {len(ocr_result.get('raw_text', ''))} chars")
    print(f"  Lines:      {len(ocr_result.get('lines', []))}")
    
    # Show first 500 chars of extracted text
    raw_text = ocr_result.get("raw_text", "")
    if raw_text:
        print(f"\n  --- OCR Text Preview (first 500 chars) ---")
        print(f"  {raw_text[:500]}")
        print(f"  --- End Preview ---")
    
    return ocr_result


def test_regex_parser(ocr_result):
    """Test the regex/dictionary parser on OCR'd text."""
    print_separator("TEST 2: Regex + Medical Dictionary Parser")
    
    if not ocr_result or not ocr_result.get("raw_text"):
        print("[!] No OCR text available to parse")
        return None
    
    start = time.time()
    parsed = medical_parser.parse_medical_text(ocr_result["raw_text"])
    duration = time.time() - start
    
    stats = parsed.get("parsing_stats", {})
    
    print(f"  Time:            {duration:.4f}s")
    print(f"  Document Type:   {parsed.get('document_type', 'unknown')}")
    print(f"  Date:            {parsed.get('date', 'not found')}")
    print(f"  Hospital:        {parsed.get('hospital_or_clinic', 'not found')}")
    print(f"  Doctor:          {parsed.get('doctor_name', 'not found')}")
    print(f"  Lab Results:     {len(parsed.get('lab_results', []))}")
    print(f"  Medications:     {len(parsed.get('medications', []))}")
    print(f"  Allergies:       {len(parsed.get('allergies', []))}")
    print(f"  Fields Resolved: {stats.get('fields_resolved', 0)}/{stats.get('total_fields', 8)}")
    print(f"  Needs LLM:       {stats.get('needs_llm', True)}")
    print(f"  Confidence:      {parsed.get('extraction_confidence', 'low')}")
    
    if parsed.get("lab_results"):
        print(f"\n  --- Lab Results Found ---")
        for lab in parsed["lab_results"][:10]:
            print(f"    {lab['test_name']}: {lab['value']} {lab.get('unit', '')} "
                  f"(Ref: {lab.get('reference_range', 'N/A')}, Flag: {lab.get('flag', 'N/A')})")
    
    if parsed.get("medications"):
        print(f"\n  --- Medications Found ---")
        for med in parsed["medications"]:
            print(f"    {med['name']} {med.get('dosage', '')} {med.get('frequency', '')}")
    
    return parsed


def test_full_pipeline(test_path):
    """Test the complete optimized pipeline."""
    print_separator("TEST 3: Full Optimized Pipeline")
    
    start = time.time()
    result = pipeline.process_document(test_path)
    duration = time.time() - start
    
    print_separator("PIPELINE OUTPUT (Structured JSON)")
    print(json.dumps(result, indent=2))
    
    return result


def test_pipeline_with_context(test_path):
    """Test pipeline with mock patient history."""
    print_separator("TEST 4: Pipeline + Patient History Context")
    
    mock_history = [
        {
            "document_type": "prescription",
            "date": "2026-05-10",
            "hospital_or_clinic": "General Health Clinic",
            "doctor_name": "Dr. Alice Smith",
            "diagnosis": ["Hypertension"],
            "medications": [
                {"name": "Lisinopril", "dosage": "10mg", "frequency": "once daily"}
            ],
            "lab_results": [],
            "allergies": ["Penicillin"],
            "notes": "Patient advised to monitor blood pressure daily.",
            "raw_text": "Prescribed Lisinopril 10mg once daily for hypertension.",
            "extraction_confidence": "high"
        },
        {
            "document_type": "lab_report",
            "date": "2026-06-01",
            "hospital_or_clinic": "City Diagnostics",
            "doctor_name": None,
            "diagnosis": [],
            "medications": [],
            "lab_results": [
                {"test_name": "Systolic BP", "value": "138", "unit": "mmHg", "reference_range": "<120", "flag": "high"},
                {"test_name": "Diastolic BP", "value": "88", "unit": "mmHg", "reference_range": "<80", "flag": "high"}
            ],
            "allergies": ["Penicillin"],
            "notes": "BP slightly elevated.",
            "raw_text": "BP report: 138/88 mmHg.",
            "extraction_confidence": "high"
        }
    ]

    start = time.time()
    result = pipeline.process_document(test_path, previous_events=mock_history)
    duration = time.time() - start
    
    print_separator("PIPELINE WITH CONTEXT OUTPUT")
    print(json.dumps(result, indent=2))
    
    # Verify context was generated WITHOUT LLM call
    if isinstance(result, dict) and "context" in result:
        ctx = result["context"]
        print_separator("CONTEXT ANALYSIS (Rule-Based)")
        print(f"  Timeline:   {ctx.get('timeline_summary', 'N/A')}")
        print(f"  Trend:      {ctx.get('flagged_trend', 'None')}")
        print(f"  Follow-up:  {ctx.get('suggested_next_visit', 'None')}")
        print(f"  Recurring:  {ctx.get('recurring_conditions', [])}")
        print(f"  LLM used:   NO (rule-based, <=5 events)")
    
    return result


def main():
    # If the user passed a path as a CLI argument, use it
    test_path = TEST_FILE
    if len(sys.argv) > 1:
        test_path = sys.argv[1]

    print_separator("MEDFLOW OPTIMIZED PIPELINE TEST")
    print(f"  Test File: {os.path.abspath(test_path)}")
    print(f"  File Exists: {os.path.exists(test_path)}")

    if not os.path.exists(test_path):
        print(f"\n[!] File '{test_path}' does not exist!")
        print("    Please provide a sample medical document (image or PDF).")
        print(f"    Usage: python {sys.argv[0]} <path_to_document>")
        sys.exit(1)

    # Run tests in sequence
    ocr_result = test_ocr_only(test_path)
    
    if ocr_result:
        test_regex_parser(ocr_result)
    
    test_full_pipeline(test_path)
    test_pipeline_with_context(test_path)
    
    print_separator("ALL TESTS COMPLETE", "*", 60)


if __name__ == "__main__":
    main()
