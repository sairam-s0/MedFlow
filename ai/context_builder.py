import json
import difflib

try:
    from ai import extractor
except ImportError:
    import extractor

def get_canonical_name(name: str, canonical_list: list, threshold: float = 0.8) -> str:
    """
    Finds a close string match in canonical_list using difflib.
    If a match with a ratio >= threshold is found, returns that canonical match.
    Otherwise, appends the new name to canonical_list and returns it.
    """
    name_clean = name.strip()
    name_lower = name_clean.lower()
    for canonical in canonical_list:
        ratio = difflib.SequenceMatcher(None, name_lower, canonical.lower()).ratio()
        if ratio >= threshold:
            return canonical
    canonical_list.append(name_clean)
    return name_clean

def build_patient_context(previous_events: list[dict], new_event: dict) -> dict:
    """
    Takes a patient's historical medical events (list of schema dicts) and a newly
    extracted event, sorts them chronologically, deduplicates condition/medication strings,
    and runs a single LLM call to build a summary, trends, and follow-up recommendations.
    
    Returns:
        {
          "event": new_event_dict,
          "context": {
             "timeline_summary": str,
             "flagged_trend": str or None,
             "suggested_next_visit": str or None,
             "recurring_conditions": list[str]
          }
        }
    """
    # 1. Chronological Sorting (earliest to latest)
    # Default null or missing dates to "0000-00-00" to sort them at the beginning
    all_events = previous_events + [new_event]
    sorted_events = sorted(
        all_events,
        key=lambda x: str(x.get("date") or "0000-00-00")
    )

    # 2. Rule-Based Deduplication / Merging using difflib similarity
    canonical_diagnoses = []
    canonical_medications = []

    for ev in sorted_events:
        # Deduplicate diagnoses
        for d in ev.get("diagnosis", []):
            if d:
                get_canonical_name(d, canonical_diagnoses)
        # Deduplicate medications
        for m in ev.get("medications", []):
            if isinstance(m, dict) and m.get("name"):
                get_canonical_name(m["name"], canonical_medications)

    # Format history and new event compactly for LLM prompt to reduce token count
    history_formatted = []
    for ev in previous_events:
        history_formatted.append({
            "date": ev.get("date"),
            "document_type": ev.get("document_type"),
            "diagnosis": ev.get("diagnosis"),
            "medications": [
                f"{m.get('name')} ({m.get('dosage') or 'N/A'}, {m.get('frequency') or 'N/A'})" 
                for m in ev.get("medications", []) if isinstance(m, dict)
            ],
            "lab_results": [
                f"{l.get('test_name')}: {l.get('value')} {l.get('unit')} (Flag: {l.get('flag')})" 
                for l in ev.get("lab_results", []) if isinstance(l, dict)
            ]
        })

    new_event_formatted = {
        "date": new_event.get("date"),
        "document_type": new_event.get("document_type"),
        "diagnosis": new_event.get("diagnosis"),
        "medications": [
            f"{m.get('name')} ({m.get('dosage') or 'N/A'}, {m.get('frequency') or 'N/A'})" 
            for m in new_event.get("medications", []) if isinstance(m, dict)
        ],
        "lab_results": [
            f"{l.get('test_name')}: {l.get('value')} {l.get('unit')} (Flag: {l.get('flag')})" 
            for l in new_event.get("lab_results", []) if isinstance(l, dict)
        ]
    }

    # 3. Construct Context-Generation Prompt
    prompt = f"""You are an expert clinical timeline and trend analysis tool.
You are given a chronological history of a patient's medical events, followed by a new medical event that has just been added.

--- PATIENT MEDICAL HISTORY (CHRONOLOGICAL) ---
{json.dumps(history_formatted, indent=2)}

--- NEW MEDICAL EVENT ---
{json.dumps(new_event_formatted, indent=2)}

--- DEDUPLICATED HISTORICAL LIST OF MEDICATIONS FOR REFERENCE ---
{json.dumps(canonical_medications, indent=2)}

--- DEDUPLICATED HISTORICAL LIST OF DIAGNOSES FOR REFERENCE ---
{json.dumps(canonical_diagnoses, indent=2)}

Analyze this patient's medical history and the new event, and output a JSON object containing these exact keys:
1. "timeline_summary": A 1-3 sentence plain-language summary of how the patient's health has progressed over time, integrating the new event into the context of their history.
2. "flagged_trend": A short trend string if something stands out across visits (e.g. 'HbA1c levels improving over last 3 visits' or 'recurring high blood pressure'), or null if no trend stands out.
3. "suggested_next_visit": A rough suggestion string for a follow-up visit (e.g., 'Follow-up in 3 months for diabetes review') or null if not medically indicated. This must be framed non-diagnostically and non-prescriptively (e.g., use words like 'may warrant follow-up', 'consider checking', 'recommended review').
4. "recurring_conditions": A list of conditions/diagnoses that appear more than once across history (including the new event). Use clean, canonical names from the reference list if applicable.

Strict Rules:
- Base suggestions and summaries ONLY on the provided history and events.
- Never invent any unrelated medical advice, prescriptions, or diagnoses.
- Return ONLY valid JSON matching this format. Do not wrap in markdown code blocks like ```json ... ```.
"""

    context_obj = {
        "timeline_summary": "Timeline summary could not be generated.",
        "flagged_trend": None,
        "suggested_next_visit": None,
        "recurring_conditions": []
    }

    # 4. LLM Call with Retry
    try:
        response_text = extractor.call_text_llm(prompt)
        cleaned = extractor.clean_json_string(response_text)
        context_obj = json.loads(cleaned)
    except Exception as e:
        print(f"[-] Context generation attempt 1 failed: {e}. Retrying with stricter instructions...")
        try:
            retry_prompt = (
                prompt + 
                "\n\nCRITICAL: Your previous response failed to parse as valid JSON. "
                "You MUST output raw valid JSON ONLY. Do NOT use markdown code blocks (```json). "
                "Ensure all fields are present: timeline_summary, flagged_trend, suggested_next_visit, recurring_conditions."
            )
            response_text = extractor.call_text_llm(retry_prompt)
            cleaned = extractor.clean_json_string(response_text)
            context_obj = json.loads(cleaned)
        except Exception as e2:
            print(f"[-] Context generation retry failed: {e2}. Returning safe defaults.")
            # We can also populate recurring_conditions using difflib locally as a fallback
            local_recurring = []
            from collections import Counter
            counts = Counter()
            for ev in sorted_events:
                # Add unique diagnoses per event
                seen_in_event = set()
                for d in ev.get("diagnosis", []):
                    if d:
                        seen_in_event.add(get_canonical_name(d, []))
                for s in seen_in_event:
                    counts[s] += 1
            local_recurring = [k for k, v in counts.items() if v > 1]
            context_obj["recurring_conditions"] = local_recurring
            context_obj["timeline_summary"] = "Failed to generate AI timeline summary due to LLM parsing error."

    # Return combined dictionary: new event + context summary
    return {
        "event": new_event,
        "context": {
            "timeline_summary": str(context_obj.get("timeline_summary", "")).strip(),
            "flagged_trend": context_obj.get("flagged_trend"),
            "suggested_next_visit": context_obj.get("suggested_next_visit"),
            "recurring_conditions": list(context_obj.get("recurring_conditions", []))
        }
    }
