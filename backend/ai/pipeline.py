import time

try:
    from ai import image_utils
    from ai import extractor
    from ai import schema
    from ai import context_builder
except ImportError:
    import image_utils
    import extractor
    import schema
    import context_builder

def process_document(file_storage_or_path, previous_events: list = None) -> dict:
    """
    Orchestrates the entire document ingestion pipeline:
    1. Reads and converts the file to base64 image (rendering PDF if necessary).
    2. Sends the base64 image to the LLM extractor.
    3. Validates and sanitizes the returned JSON structure.
    4. (Optional) Integrates with previous medical history to construct timeline trends context.
    """
    print("\n" + "="*50)
    print("[+] Starting Medical Record Ingestion Pipeline")
    print("="*50)
    
    # Track overall timing
    start_total = time.time()
    
    # Step 1: File conversion
    print("[1/3] Converting file to base64 format...")
    start_step = time.time()
    try:
        base64_str, mime_type = image_utils.file_to_base64(file_storage_or_path)
        step_duration = time.time() - start_step
        print(f"    -> Success: MIME type detected as '{mime_type}' (took {step_duration:.2f}s)")
    except Exception as e:
        print(f"    [-] Step 1 (base64 conversion) failed: {e}")
        raise e
        
    # Step 2: LLM Extraction
    print("[2/3] Calling Multimodal LLM Vision extractor...")
    start_step = time.time()
    try:
        extracted_data = extractor.extract_medical_data(base64_str, mime_type)
        step_duration = time.time() - start_step
        print(f"    -> Success: Received response from LLM (took {step_duration:.2f}s)")
    except Exception as e:
        print(f"    [-] Step 2 (LLM call) failed: {e}")
        raise e
        
    # Step 3: Schema Validation
    print("[3/3] Validating and sanitizing extracted JSON data...")
    start_step = time.time()
    try:
        validated_data = schema.validate_extraction(extracted_data)
        step_duration = time.time() - start_step
        print(f"    -> Success: Schema validated and cleaned (took {step_duration:.2f}s)")
    except Exception as e:
        print(f"    [-] Step 3 (Validation) failed: {e}")
        raise e
        
    # Step 4: Context / RAG-Lite chronological summarization
    if previous_events:
        print("[4/4] Generating timeline and trend context from previous events...")
        start_step = time.time()
        try:
            validated_data = context_builder.build_patient_context(previous_events, validated_data)
            step_duration = time.time() - start_step
            print(f"    -> Success: Timeline context built (took {step_duration:.2f}s)")
        except Exception as e:
            print(f"    [-] Step 4 (Context Builder) failed: {e}")
            raise e

    total_duration = time.time() - start_total
    print("="*50)
    print(f"[+] Pipeline Completed Successfully in {total_duration:.2f}s")
    print("="*50 + "\n")
    
    return validated_data
