import json
import os
import sys

# Ensure imports work whether run from the project root or the ai/ directory
current_dir = os.path.dirname(os.path.abspath(__file__))
parent_dir = os.path.dirname(current_dir)
if parent_dir not in sys.path:
    sys.path.append(parent_dir)

try:
    from ai import pipeline
except ImportError:
    import pipeline

# Default sample test file (can be a JPEG, PNG, or PDF)
TEST_FILE = os.path.join(current_dir, "sample_prescription.jpg")

def main():
    # If the user passed a path as a CLI argument, use it instead of the default
    test_path = TEST_FILE
    if len(sys.argv) > 1:
        test_path = sys.argv[1]

    print(f"[*] Target Test File: {os.path.abspath(test_path)}")

    if not os.path.exists(test_path):
        print(f"\n[-] File '{test_path}' does not exist!")
        print("    Please copy a sample medical document (image or PDF) to that location,")
        print("    or pass the file path as a command line argument:")
        print(f"    python {sys.argv[0]} <path_to_your_document>")
        print("\n    Example:")
        print(f"    python {sys.argv[0]} my_prescription.png\n")
        sys.exit(1)

    try:
        # Run the document ingestion pipeline without history context
        result = pipeline.process_document(test_path)
        
        # Pretty print the final validated JSON
        print("\n" + "="*50)
        print("[+] PIPELINE OUTPUT (Structured JSON)")
        print("="*50)
        print(json.dumps(result, indent=2))
        print("="*50)
        
        # TEMPORARY - REMOVE BEFORE SUBMISSION
        # Run the document ingestion pipeline with mock history context
        print("\n" + "="*50)
        print("[*] Running pipeline WITH mock previous patient events context...")
        print("="*50)
        
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

        result_with_context = pipeline.process_document(test_path, previous_events=mock_history)
        
        print("\n" + "="*50)
        print("[+] PIPELINE WITH CONTEXT OUTPUT (Structured JSON)")
        print("="*50)
        print(json.dumps(result_with_context, indent=2))
        print("="*50)
        # END OF TEMPORARY BLOCK
        
    except Exception as e:
        print(f"\n[-] Error running pipeline: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)

if __name__ == "__main__":
    main()
