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
    and builds a summary + trends + follow-up recommendations.
    
    OPTIMIZED: Uses rule-based logic by default (no LLM cost).
    Only calls LLM for complex histories (>5 events) where trends are harder
    to detect with simple rules.
    
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
    all_events = previous_events + [new_event]
    sorted_events = sorted(
        all_events,
        key=lambda x: str(x.get("date") or "0000-00-00")
    )

    # 2. Rule-Based Deduplication / Merging using difflib similarity
    canonical_diagnoses = []
    canonical_medications = []

    for ev in sorted_events:
        for d in ev.get("diagnosis", []):
            if d:
                get_canonical_name(d, canonical_diagnoses)
        for m in ev.get("medications", []):
            if isinstance(m, dict) and m.get("name"):
                get_canonical_name(m["name"], canonical_medications)

    # 3. Find recurring conditions (appear in >1 event)
    from collections import Counter
    condition_counts = Counter()
    for ev in sorted_events:
        seen_in_event = set()
        for d in ev.get("diagnosis", []):
            if d:
                canonical = get_canonical_name(d, [])
                seen_in_event.add(canonical)
        for s in seen_in_event:
            condition_counts[s] += 1
    recurring_conditions = [k for k, v in condition_counts.items() if v > 1]

    # 4. Rule-based timeline summary
    num_events = len(sorted_events)
    date_range = ""
    first_date = sorted_events[0].get("date") if sorted_events else None
    last_date = sorted_events[-1].get("date") if sorted_events else None
    if first_date and last_date and first_date != last_date:
        date_range = f" from {first_date} to {last_date}"
    elif first_date:
        date_range = f" on {first_date}"

    doc_types = [ev.get("document_type", "unknown") for ev in sorted_events if ev.get("document_type")]
    new_doc_type = new_event.get("document_type", "medical record").replace("_", " ")

    timeline_summary = (
        f"Patient has {num_events} medical event(s) on record{date_range}. "
        f"Latest event: {new_doc_type}."
    )
    if recurring_conditions:
        timeline_summary += f" Recurring condition(s): {', '.join(recurring_conditions)}."

    # 5. Rule-based trend flagging
    flagged_trend = None
    if recurring_conditions:
        flagged_trend = f"Recurring: {', '.join(recurring_conditions[:3])}"
    
    # Check for lab trends (same test across events)
    lab_trends = _detect_lab_trends(sorted_events)
    if lab_trends:
        flagged_trend = (flagged_trend + "; " if flagged_trend else "") + lab_trends

    # 6. Rule-based follow-up suggestion
    suggested_next_visit = None
    if recurring_conditions:
        suggested_next_visit = f"Consider follow-up review for {recurring_conditions[0]} management."
    
    context_obj = {
        "timeline_summary": timeline_summary,
        "flagged_trend": flagged_trend,
        "suggested_next_visit": suggested_next_visit,
        "recurring_conditions": recurring_conditions
    }

    # 7. For complex histories (>5 events), optionally enhance with LLM
    if len(previous_events) > 5:
        print("    -> Complex history detected (>5 events). Attempting LLM-enhanced context...")
        try:
            llm_context = _build_llm_context(previous_events, new_event, 
                                              canonical_medications, canonical_diagnoses)
            if llm_context:
                # Merge LLM insights with rule-based results
                if llm_context.get("timeline_summary"):
                    context_obj["timeline_summary"] = llm_context["timeline_summary"]
                if llm_context.get("flagged_trend"):
                    context_obj["flagged_trend"] = llm_context["flagged_trend"]
                if llm_context.get("suggested_next_visit"):
                    context_obj["suggested_next_visit"] = llm_context["suggested_next_visit"]
                # Keep rule-based recurring_conditions (more reliable)
        except Exception as e:
            print(f"    -> LLM context enhancement failed: {e}. Using rule-based results.")

    return {
        "event": new_event,
        "context": context_obj
    }


def _detect_lab_trends(sorted_events: list[dict]) -> str | None:
    """Detect simple lab value trends across events."""
    # Collect lab values by test name across events
    lab_history = {}
    for ev in sorted_events:
        for lab in ev.get("lab_results", []):
            if isinstance(lab, dict) and lab.get("test_name") and lab.get("value"):
                test = lab["test_name"].lower()
                try:
                    val = float(lab["value"])
                    if test not in lab_history:
                        lab_history[test] = []
                    lab_history[test].append(val)
                except ValueError:
                    continue
    
    trends = []
    for test, values in lab_history.items():
        if len(values) >= 2:
            if all(values[i] < values[i+1] for i in range(len(values)-1)):
                trends.append(f"{test} increasing")
            elif all(values[i] > values[i+1] for i in range(len(values)-1)):
                trends.append(f"{test} decreasing")
    
    return "; ".join(trends[:3]) if trends else None


def _build_llm_context(previous_events, new_event, canonical_medications, canonical_diagnoses):
    """LLM-enhanced context for complex histories. Only called for >5 events."""
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

    prompt = f"""You are an expert clinical timeline and trend analysis tool.
You are given a chronological history of a patient's medical events, followed by a new medical event that has just been added.

--- PATIENT MEDICAL HISTORY (CHRONOLOGICAL) ---
{json.dumps(history_formatted, indent=2)}

--- NEW MEDICAL EVENT ---
{json.dumps(new_event_formatted, indent=2)}

Analyze this patient's medical history and output a JSON object with:
1. "timeline_summary": 1-3 sentence summary of health progression.
2. "flagged_trend": A trend string or null.
3. "suggested_next_visit": Follow-up suggestion or null.
4. "recurring_conditions": List of recurring conditions.

Return ONLY valid JSON. No markdown code blocks.
"""

    try:
        response_text = extractor.call_text_llm(prompt)
        cleaned = extractor.clean_json_string(response_text)
        return json.loads(cleaned)
    except Exception:
        return None

