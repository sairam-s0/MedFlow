import time
import json

try:
    from ai import ocr_engine
    from ai import medical_parser
    from ai import image_utils
    from ai import extractor
    from ai import schema
    from ai import context_builder
except ImportError:
    import ocr_engine
    import medical_parser
    import image_utils
    import extractor
    import schema
    import context_builder


def process_document(file_storage_or_path, previous_events: list = None) -> dict:
    """
    Orchestrates the optimized medical document ingestion pipeline:
    
    NEW ARCHITECTURE (OCR-first, single LLM call):
      1. Local OCR (EasyOCR) — free, no API cost
      2. Regex + Medical Dictionary parsing — deterministic, no API cost
      3. LLM text call — ONLY if regex couldn't resolve everything (0 or 1 call)
      4. Merge + Schema validation
      5. (Optional) Context building from patient history
    
    FALLBACK: If OCR is unavailable, falls back to original vision LLM path.
    
    Returns: Validated medical data dict conforming to schema.py
    """
    print("\n" + "=" * 60)
    print("[+] Starting Optimized Medical Record Ingestion Pipeline")
    print("=" * 60)
    
    start_total = time.time()
    llm_calls_made = 0
    pipeline_path = "unknown"
    
    # ─────────────────────────────────────────────────────────
    # STEP 1: Local OCR
    # ─────────────────────────────────────────────────────────
    print("[1/5] Running local OCR (EasyOCR)...")
    start_step = time.time()
    
    ocr_result = None
    try:
        ocr_result = ocr_engine.ocr_file(file_storage_or_path)
        step_time = time.time() - start_step
        
        if ocr_result and ocr_result.get("raw_text"):
            text_len = len(ocr_result["raw_text"])
            avg_conf = ocr_result.get("avg_confidence", 0)
            page_count = ocr_result.get("page_count", 1)
            print(f"    -> OCR Success: {text_len} chars, {page_count} page(s), "
                  f"avg confidence: {avg_conf:.2%} (took {step_time:.2f}s)")
        else:
            print(f"    -> OCR returned empty/no text (took {step_time:.2f}s)")
            ocr_result = None
    except Exception as e:
        step_time = time.time() - start_step
        print(f"    -> OCR failed: {e} (took {step_time:.2f}s)")
        ocr_result = None
    
    # ─────────────────────────────────────────────────────────
    # DECISION: Use OCR path or fallback to vision LLM?
    # ─────────────────────────────────────────────────────────
    if ocr_result and ocr_result.get("raw_text") and ocr_result.get("avg_confidence", 0) > 0.3:
        # ═══════════════════════════════════════════════════
        # PATH A: OCR-FIRST (optimized path)
        # ═══════════════════════════════════════════════════
        pipeline_path = "OCR-first"
        raw_text = ocr_result["raw_text"]
        
        # ─────────────────────────────────────────────────
        # STEP 2: Regex + Medical Dictionary Parsing
        # ─────────────────────────────────────────────────
        print("[2/5] Running regex + medical dictionary parser...")
        start_step = time.time()
        
        parsed = medical_parser.parse_medical_text(raw_text)
        stats = parsed.get("parsing_stats", {})
        step_time = time.time() - start_step
        
        fields_resolved = stats.get("fields_resolved", 0)
        total_fields = stats.get("total_fields", 8)
        needs_llm = stats.get("needs_llm", True)
        
        print(f"    -> Parsed: {fields_resolved}/{total_fields} fields resolved "
              f"(took {step_time:.2f}s)")
        print(f"    -> LLM needed: {needs_llm}")
        
        if parsed.get("lab_results"):
            print(f"    -> Found {len(parsed['lab_results'])} lab results via regex")
        if parsed.get("medications"):
            print(f"    -> Found {len(parsed['medications'])} medications via regex")
        
        # ─────────────────────────────────────────────────
        # STEP 3: LLM Text Call (only if needed)
        # ─────────────────────────────────────────────────
        if needs_llm:
            print("[3/5] Sending unresolved text to LLM (single text call)...")
            start_step = time.time()
            
            try:
                llm_result = extractor.extract_from_text(
                    raw_text=raw_text,
                    partial_extraction=parsed,
                    unresolved_text=stats.get("unresolved_text", "")
                )
                llm_calls_made = 1
                step_time = time.time() - start_step
                print(f"    -> LLM extraction complete (took {step_time:.2f}s)")
                
                # Check if LLM actually returned useful data (not just error fallback)
                llm_has_data = (
                    llm_result.get("diagnosis") or 
                    llm_result.get("medications") or 
                    llm_result.get("lab_results") or
                    (llm_result.get("extraction_confidence") != "low")
                )
                
                if llm_has_data:
                    # Merge: regex results + LLM results
                    validated_data = _merge_results(parsed, llm_result)
                else:
                    print("    -> LLM returned no useful data. Using regex-only results.")
                    llm_calls_made = 0  # Don't count failed calls
                    validated_data = {k: v for k, v in parsed.items() if k != "parsing_stats"}
                
            except Exception as e:
                print(f"    -> LLM call failed: {e}. Using regex-only results.")
                step_time = time.time() - start_step
                # Remove parsing_stats before validation
                validated_data = {k: v for k, v in parsed.items() if k != "parsing_stats"}
        else:
            print("[3/5] SKIPPED -- All fields resolved by regex. No LLM needed!")
            llm_calls_made = 0
            # Remove parsing_stats before validation
            validated_data = {k: v for k, v in parsed.items() if k != "parsing_stats"}
        
    else:
        # ═══════════════════════════════════════════════════
        # PATH B: VISION LLM FALLBACK (original behavior)
        # ═══════════════════════════════════════════════════
        pipeline_path = "Vision-LLM-fallback"
        print("[2/5] OCR unavailable or low confidence. Falling back to Vision LLM...")
        
        # Step 2b: Convert file to base64 for vision
        print("    -> Converting file to base64...")
        start_step = time.time()
        try:
            base64_str, mime_type = image_utils.file_to_base64(file_storage_or_path)
            step_time = time.time() - start_step
            print(f"    -> Base64 conversion done, MIME: {mime_type} (took {step_time:.2f}s)")
        except Exception as e:
            print(f"    -> Base64 conversion failed: {e}")
            raise e
        
        # Step 3b: Vision LLM extraction
        print("[3/5] Calling Vision LLM extractor...")
        start_step = time.time()
        try:
            validated_data = extractor.extract_medical_data(base64_str, mime_type)
            llm_calls_made = 1  # Could be 2 if retry triggers
            step_time = time.time() - start_step
            print(f"    -> Vision LLM extraction complete (took {step_time:.2f}s)")
        except Exception as e:
            print(f"    -> Vision LLM failed: {e}")
            raise e
    
    # ─────────────────────────────────────────────────────────
    # STEP 4: Schema Validation
    # ─────────────────────────────────────────────────────────
    print("[4/5] Validating and sanitizing extracted data...")
    start_step = time.time()
    try:
        validated_data = schema.validate_extraction(validated_data)
        step_time = time.time() - start_step
        print(f"    -> Schema validated (took {step_time:.2f}s)")
    except Exception as e:
        print(f"    -> Validation failed: {e}")
        raise e
    
    # ─────────────────────────────────────────────────────────
    # STEP 5: Context / Timeline (rule-based by default)
    # ─────────────────────────────────────────────────────────
    if previous_events:
        print("[5/5] Building patient timeline context...")
        start_step = time.time()
        try:
            validated_data = context_builder.build_patient_context(
                previous_events, validated_data
            )
            step_time = time.time() - start_step
            print(f"    -> Timeline context built (took {step_time:.2f}s)")
        except Exception as e:
            print(f"    -> Context building failed: {e}")
            # Non-fatal: pipeline still returns validated data
    else:
        print("[5/5] SKIPPED — No previous events provided.")
    
    # ─────────────────────────────────────────────────────────
    # SUMMARY
    # ─────────────────────────────────────────────────────────
    total_duration = time.time() - start_total
    print("\n" + "=" * 60)
    print(f"[+] Pipeline Completed Successfully in {total_duration:.2f}s")
    print(f"    Path: {pipeline_path}")
    print(f"    LLM API calls: {llm_calls_made}")
    print(f"    Cost: {'$0 (no API calls!)' if llm_calls_made == 0 else f'~{llm_calls_made} text call(s)'}")
    print("=" * 60 + "\n")
    
    return validated_data


def _merge_results(regex_result: dict, llm_result: dict) -> dict:
    """
    Merge regex-parsed results with LLM results.
    Regex results take priority for structured data (lab results, vitals).
    LLM results fill in gaps (diagnosis, complex medications, notes).
    """
    merged = {}
    
    # For these fields, prefer regex if available, else LLM
    for field in ["document_type", "date", "hospital_or_clinic", "doctor_name"]:
        regex_val = regex_result.get(field)
        llm_val = llm_result.get(field)
        if regex_val and regex_val != "unknown":
            merged[field] = regex_val
        elif llm_val:
            merged[field] = llm_val
        else:
            merged[field] = regex_val
    
    # Lab results: prefer regex (more accurate for structured tables)
    regex_labs = regex_result.get("lab_results", [])
    llm_labs = llm_result.get("lab_results", [])
    if regex_labs:
        # Use regex labs, but add any LLM-found labs that aren't in regex
        regex_test_names = {l["test_name"].lower() for l in regex_labs}
        merged["lab_results"] = regex_labs.copy()
        for lab in llm_labs:
            if lab.get("test_name", "").lower() not in regex_test_names:
                merged["lab_results"].append(lab)
    else:
        merged["lab_results"] = llm_labs
    
    # Medications: merge both sources, deduplicate
    regex_meds = regex_result.get("medications", [])
    llm_meds = llm_result.get("medications", [])
    seen_med_names = set()
    merged["medications"] = []
    for med in regex_meds + llm_meds:
        name = med.get("name", "").lower().strip()
        if name and name not in seen_med_names:
            seen_med_names.add(name)
            merged["medications"].append(med)
    
    # Diagnosis: always use LLM (requires NLP understanding)
    llm_diag = llm_result.get("diagnosis", [])
    regex_diag = regex_result.get("diagnosis", [])
    merged["diagnosis"] = llm_diag if llm_diag else regex_diag
    
    # Allergies: merge both
    regex_allergies = set(regex_result.get("allergies", []))
    llm_allergies = set(llm_result.get("allergies", []))
    merged["allergies"] = list(regex_allergies | llm_allergies)
    
    # Notes: combine
    notes_parts = []
    if regex_result.get("notes"):
        notes_parts.append(regex_result["notes"])
    if llm_result.get("notes"):
        notes_parts.append(llm_result["notes"])
    merged["notes"] = " | ".join(notes_parts) if notes_parts else None
    
    # Raw text: prefer the OCR text (more complete)
    merged["raw_text"] = regex_result.get("raw_text", "") or llm_result.get("raw_text", "")
    
    # Confidence: take the higher of the two
    conf_order = {"high": 3, "medium": 2, "low": 1}
    regex_conf = conf_order.get(regex_result.get("extraction_confidence", "low"), 1)
    llm_conf = conf_order.get(llm_result.get("extraction_confidence", "low"), 1)
    conf_reverse = {3: "high", 2: "medium", 1: "low"}
    merged["extraction_confidence"] = conf_reverse[max(regex_conf, llm_conf)]
    
    return merged
