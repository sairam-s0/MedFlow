"""
Medical Parser — Deterministic regex + dictionary extraction for medical documents.

This module can parse structured medical data WITHOUT any LLM calls:
- Lab results (test name, value, unit, reference range)
- Medications (name, dosage, frequency)
- Vitals (BP, pulse, temperature, weight, height)
- Document type classification
- Hospital/clinic names, doctor names, dates

For well-structured documents (lab reports, vitals charts), this alone
can extract 80-100% of the data. The LLM is only needed for free-text
clinical notes, handwritten prescriptions, and ambiguous content.
"""

import re
from datetime import datetime


# =====================================================================
# MEDICAL DICTIONARIES
# =====================================================================

# Common lab test names for fuzzy matching and normalization
LAB_TEST_NAMES = {
    # Hematology
    "hemoglobin", "hb", "hgb", "haemoglobin",
    "wbc", "white blood cell", "total wbc", "total wbc count",
    "rbc", "red blood cell", "total rbc",
    "platelet", "platelets", "platelet count", "plt",
    "hematocrit", "hct", "pcv", "packed cell volume",
    "mcv", "mch", "mchc", "rdw",
    "esr", "erythrocyte sedimentation rate",
    "differential count", "neutrophils", "lymphocytes",
    "monocytes", "eosinophils", "basophils",
    "reticulocyte", "reticulocyte count",
    # Biochemistry
    "blood sugar", "blood glucose", "fasting blood sugar", "fbs",
    "random blood sugar", "rbs", "pp blood sugar", "ppbs",
    "hba1c", "glycosylated hemoglobin",
    "creatinine", "serum creatinine",
    "urea", "blood urea", "bun", "blood urea nitrogen",
    "uric acid", "serum uric acid",
    "sgpt", "alt", "alanine aminotransferase", "alanine transaminase",
    "sgot", "ast", "aspartate aminotransferase", "aspartate transaminase",
    "alkaline phosphatase", "alp",
    "total bilirubin", "direct bilirubin", "indirect bilirubin",
    "bilirubin", "bilirubin total", "bilirubin direct",
    "total protein", "albumin", "globulin",
    "cholesterol", "total cholesterol", "hdl", "ldl", "vldl",
    "triglycerides", "triglyceride",
    "sodium", "potassium", "chloride", "calcium", "phosphorus",
    "magnesium", "iron", "serum iron", "tibc",
    "t3", "t4", "tsh", "free t3", "free t4",
    "vitamin d", "vitamin b12", "folate", "folic acid",
    # Serology
    "hiv", "anti hiv", "anti-hiv", "hbsag", "hbs-ag", "hbs ag",
    "anti hcv", "anti-hcv", "vdrl", "rpr", "tpha",
    "blood group", "abo", "rh",
    "malaria", "malaria parasite", "mp",
    "dengue", "widal",
    "crp", "c-reactive protein",
    # Urine
    "urine rbc", "urine wbc", "pus cells", "epithelial cells",
    "urine protein", "urine sugar", "urine glucose",
    "pregnancy test", "urine pregnancy",
    "micro filaria",
    # Radiology
    "chest x-ray", "x-ray", "ct scan", "mri", "ultrasound", "usg",
    # Mantoux
    "mantoux", "mantoux test",
    "cannabies", "cannabis", "opiates",
}

# Common drug names for recognition
COMMON_DRUGS = {
    "paracetamol", "acetaminophen", "ibuprofen", "aspirin",
    "metformin", "glimepiride", "insulin", "sitagliptin",
    "amlodipine", "atenolol", "lisinopril", "losartan", "telmisartan",
    "atorvastatin", "rosuvastatin", "simvastatin",
    "omeprazole", "pantoprazole", "rabeprazole", "ranitidine",
    "amoxicillin", "azithromycin", "ciprofloxacin", "metronidazole",
    "ceftriaxone", "doxycycline", "levofloxacin",
    "prednisolone", "dexamethasone", "hydrocortisone",
    "salbutamol", "montelukast", "cetirizine", "loratadine",
    "metoprolol", "propranolol", "furosemide", "spironolactone",
    "warfarin", "clopidogrel", "enoxaparin",
    "diazepam", "alprazolam", "sertraline", "fluoxetine",
    "levothyroxine", "carbimazole",
    "iron", "folic acid", "calcium", "vitamin d", "vitamin b12",
    "multivitamin", "zinc",
}

# Document type keyword patterns
DOC_TYPE_KEYWORDS = {
    "lab_report": [
        "laboratory", "lab report", "blood test", "test report",
        "investigation", "pathology", "hematology", "biochemistry",
        "serology", "urine", "blood examination", "laboratory examination",
        "diagnostic", "diagnostics", "clinical laboratory",
    ],
    "prescription": [
        "prescription", "rx", "prescribed", "tablet", "capsule",
        "syrup", "injection", "ointment", "medicine",
    ],
    "discharge_summary": [
        "discharge", "discharge summary", "hospital discharge",
        "inpatient", "admitted", "admission",
    ],
    "vaccination": [
        "vaccination", "vaccine", "immunization", "immunisation",
        "dose 1", "dose 2", "booster",
    ],
    "radiology": [
        "x-ray", "xray", "ct scan", "mri", "ultrasound",
        "radiological", "radiology", "imaging", "sonography",
    ],
    "operation": [
        "operation", "surgery", "surgical", "operative",
        "procedure", "pre-operative", "post-operative",
    ],
}


# =====================================================================
# REGEX PATTERNS
# =====================================================================

# Lab result patterns: "Test Name: Value Unit" or "Test Name ... Value Unit"
# Handles formats like:
#   Hemoglobin: 13.5 g/dL
#   WBC Count    8200 /cumm
#   Total WBC Count         4000-11000
LAB_RESULT_PATTERNS = [
    # Pattern: "Test Name : Value Unit (Reference Range)"
    re.compile(
        r'([A-Za-z][A-Za-z0-9\s/\(\)\-]{2,40}?)\s*[:=]\s*'
        r'([\d]+\.?[\d]*)\s*'
        r'([A-Za-z/%µμ\^23]+(?:/[A-Za-z]+)?)?'
        r'\s*(?:\(?\s*(?:Ref|Reference|Normal|Range)?[:\s]*'
        r'([\d\.\-<>\s]+\s*(?:[A-Za-z/%µμ]+)?)\s*\)?)?',
        re.IGNORECASE
    ),
    # Pattern: "Test Name  Value  Reference Range" (tabular)
    re.compile(
        r'([A-Za-z][A-Za-z0-9\s/\(\)\-]{2,40}?)\s{2,}'
        r'([\d]+\.?[\d]*)\s*'
        r'([A-Za-z/%µμ\^23]+(?:/[A-Za-z]+)?)?\s{2,}'
        r'([\d\.\-<>\s]+(?:\s*[A-Za-z/%µμ]+)?)',
        re.IGNORECASE
    ),
]

# Reference range pattern (standalone): "4000-11000" or "<120" or "M 12-17 gm%"
REFERENCE_RANGE_PATTERN = re.compile(
    r'([\d]+\.?\d*)\s*[-–—to]\s*([\d]+\.?\d*)\s*([A-Za-z/%µμ]+)?',
    re.IGNORECASE
)

# Date patterns
DATE_PATTERNS = [
    re.compile(r'(\d{4}[-/]\d{1,2}[-/]\d{1,2})'),                    # 2024-01-15
    re.compile(r'(\d{1,2}[-/]\d{1,2}[-/]\d{4})'),                    # 15-01-2024
    re.compile(r'(\d{1,2}\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{4})', re.IGNORECASE),  # 15 January 2024
]

# Vitals patterns
BP_PATTERN = re.compile(r'(?:BP|Blood\s*Pressure)\s*[:=]?\s*(\d{2,3})\s*/\s*(\d{2,3})\s*(?:mmHg)?', re.IGNORECASE)
PULSE_PATTERN = re.compile(r'(?:Pulse|Heart\s*Rate|HR)\s*[:=]?\s*(\d{2,3})\s*(?:/\s*min|bpm)?', re.IGNORECASE)
TEMP_PATTERN = re.compile(r'(?:Temp|Temperature)\s*[:=]?\s*([\d]+\.?\d*)\s*(?:°?[FCfc]|degree)?', re.IGNORECASE)
WEIGHT_PATTERN = re.compile(r'(?:Weight|Wt)\s*[:=]?\s*([\d]+\.?\d*)\s*(?:kg|lbs?)?', re.IGNORECASE)
HEIGHT_PATTERN = re.compile(r'(?:Height|Ht)\s*[:=]?\s*([\d]+\.?\d*)\s*(?:cm|ft|m)?', re.IGNORECASE)

# Medication pattern: "Drug Dosage Frequency"
MEDICATION_PATTERNS = [
    # Tab/Cap DrugName Dosage Frequency
    re.compile(
        r'(?:Tab|Cap|Syp|Inj|Oint)\.?\s+'
        r'([A-Za-z][A-Za-z\-]+(?:\s+[A-Za-z]+)?)\s+'
        r'(\d+\s*(?:mg|mcg|ml|g|iu|units?))\s*'
        r'([\w\s/\-]+(?:daily|bd|tds|od|hs|sos|prn|stat|once|twice|thrice)[\w\s]*)?',
        re.IGNORECASE
    ),
]

# Hospital/Clinic name patterns
HOSPITAL_PATTERN = re.compile(
    r'((?:[A-Z][A-Za-z\s&]+)?(?:Hospital|Clinic|Medical\s+Center|Medical\s+Centre|'
    r'Diagnostic|Health\s+Center|Health\s+Centre|Laboratory|Nursing\s+Home|'
    r'Institute|Polyclinic|PHC|CHC)(?:\s+[A-Za-z\s&]+)?(?:P\.?\s*Ltd\.?|Pvt\.?\s*Ltd\.?)?)',
    re.IGNORECASE
)

# Doctor name patterns
DOCTOR_PATTERN = re.compile(
    r'(?:Dr|Doctor)\.?\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+){0,3})',
    re.IGNORECASE
)


# =====================================================================
# PARSER FUNCTIONS
# =====================================================================

def classify_document_type(text: str) -> str:
    """Classify document type based on keyword frequency."""
    text_lower = text.lower()
    scores = {}
    for doc_type, keywords in DOC_TYPE_KEYWORDS.items():
        score = sum(1 for kw in keywords if kw in text_lower)
        if score > 0:
            scores[doc_type] = score
    
    if not scores:
        return "unknown"
    return max(scores, key=scores.get)


def extract_dates(text: str) -> list[str]:
    """Extract all dates found in the text, normalized to YYYY-MM-DD."""
    dates = []
    for pattern in DATE_PATTERNS:
        for match in pattern.finditer(text):
            date_str = match.group(1)
            # Try to parse and normalize
            for fmt in ("%Y-%m-%d", "%Y/%m/%d", "%d-%m-%Y", "%d/%m/%Y", "%d %B %Y", "%d %b %Y"):
                try:
                    parsed = datetime.strptime(date_str, fmt)
                    dates.append(parsed.strftime("%Y-%m-%d"))
                    break
                except ValueError:
                    continue
    return dates


def extract_lab_results(text: str) -> list[dict]:
    """
    Extract lab results from structured text using regex.
    Returns list of dicts with: test_name, value, unit, reference_range, flag
    
    Handles two formats:
    1. Inline: "Hemoglobin: 13.5 g/dL (12-17)"
    2. Adjacent-line (common from OCR'd tables):
         Hemoglobin
         M12-17 gm%
    """
    results = []
    seen_tests = set()
    
    lines = text.split('\n')
    
    # ─── Pass 1: Inline regex patterns ───
    for line in lines:
        line = line.strip()
        if not line or len(line) < 5:
            continue
        
        for pattern in LAB_RESULT_PATTERNS:
            for match in pattern.finditer(line):
                test_name = match.group(1).strip().rstrip(':')
                value_str = match.group(2).strip()
                unit = (match.group(3) or "").strip()
                ref_range = (match.group(4) or "").strip() if match.lastindex >= 4 else ""
                
                test_lower = test_name.lower().strip()
                if len(test_lower) < 2 or test_lower.replace(' ', '').isdigit():
                    continue
                
                is_known = any(
                    known in test_lower or test_lower in known
                    for known in LAB_TEST_NAMES
                )
                
                if not is_known and not any(c.isalpha() for c in test_name):
                    continue
                
                dedup_key = f"{test_lower}:{value_str}"
                if dedup_key in seen_tests:
                    continue
                seen_tests.add(dedup_key)
                
                flag = _determine_flag(value_str, ref_range)
                
                results.append({
                    "test_name": test_name,
                    "value": value_str,
                    "unit": unit,
                    "reference_range": ref_range,
                    "flag": flag
                })
    
    # ─── Pass 2: Adjacent-line parser for OCR'd tables ───
    # OCR often splits tables so test names and reference ranges end up
    # on separate consecutive lines, e.g.:
    #   Total WBC Count
    #   4000-11000
    #   Neutrophils
    #   45-74%
    results.extend(_extract_adjacent_line_labs(lines, seen_tests))
    
    return results


def _extract_adjacent_line_labs(lines: list[str], seen_tests: set) -> list[dict]:
    """
    Parse lab data from adjacent lines in OCR output.
    Looks for known test names followed by lines containing numbers/ranges.
    """
    results = []
    cleaned_lines = [l.strip() for l in lines]
    
    # Reference range pattern: "4000-11000" or "45-74%" or "80-120 mg%" or "M<10" or "0.4-1 mg%"
    range_re = re.compile(
        r'^[MFmf]?\s*[<>]?\s*[\d]+[\d.\-–, ]*(?:\s*[A-Za-z/%µμ]+)?[\d.]*$'
    )
    # Value pattern: just a number, possibly with unit
    value_re = re.compile(r'^[\d]+\.?[\d]*\s*[A-Za-z/%µμ]*$')
    
    i = 0
    while i < len(cleaned_lines):
        line = cleaned_lines[i]
        line_lower = line.lower().strip()
        
        # Check if this line matches a known lab test name
        matched_test = None
        for known in LAB_TEST_NAMES:
            # Fuzzy match: OCR may garble text slightly
            if known in line_lower or line_lower in known:
                matched_test = known
                break
            # Also try cleaning common OCR artifacts
            clean_line = re.sub(r'[^a-z\s]', '', line_lower).strip()
            if clean_line and (known in clean_line or clean_line in known):
                matched_test = known
                break
        
        if matched_test and matched_test not in seen_tests:
            # Look at the next 1-3 lines for a value or reference range
            ref_range = ""
            value = ""
            unit = ""
            
            for j in range(1, min(4, len(cleaned_lines) - i)):
                next_line = cleaned_lines[i + j].strip()
                if not next_line:
                    continue
                
                # Try to extract a reference range (e.g., "4000-11000", "45-74%", "M12-17 gm%")
                range_match = re.search(
                    r'([MFmf]?\s*[<>]?\s*[\d]+\.?\d*)\s*[-–]\s*([\d]+\.?\d*)\s*([A-Za-z/%µμ]+)?',
                    next_line
                )
                if range_match:
                    ref_range = next_line.strip()
                    break
                
                # Single value like "80-120 mg%" 
                single_val = re.search(r'([\d]+\.?\d*)\s*([A-Za-z/%µμ]+)?', next_line)
                if single_val and not any(c.isalpha() and c.lower() not in 'mfgl%' for c in next_line[:3]):
                    if not value:
                        value = single_val.group(1)
                        unit = (single_val.group(2) or "").strip()
            
            # Normalize the test name
            display_name = matched_test.title()
            
            # Skip entries with no value AND no reference range (noise from headers/labels)
            if not value and not ref_range:
                i += 1
                continue
            
            dedup_key = f"{matched_test}:"
            if dedup_key not in seen_tests:
                seen_tests.add(dedup_key)
                results.append({
                    "test_name": display_name,
                    "value": value,
                    "unit": unit,
                    "reference_range": ref_range,
                    "flag": None
                })
        
        i += 1
    
    return results


def _determine_flag(value_str: str, ref_range: str) -> str | None:
    """Determine if a lab value is normal/high/low based on reference range."""
    if not ref_range or not value_str:
        return None
    
    try:
        value = float(value_str)
    except ValueError:
        return None
    
    # Handle range like "4000-11000"
    range_match = re.match(r'([\d.]+)\s*[-–—to]\s*([\d.]+)', ref_range)
    if range_match:
        try:
            low = float(range_match.group(1))
            high = float(range_match.group(2))
            if value < low:
                return "low"
            elif value > high:
                return "high"
            else:
                return "normal"
        except ValueError:
            pass
    
    # Handle "< 120" or "> 40"
    lt_match = re.match(r'<\s*([\d.]+)', ref_range)
    if lt_match:
        try:
            upper = float(lt_match.group(1))
            return "high" if value > upper else "normal"
        except ValueError:
            pass
    
    gt_match = re.match(r'>\s*([\d.]+)', ref_range)
    if gt_match:
        try:
            lower = float(gt_match.group(1))
            return "low" if value < lower else "normal"
        except ValueError:
            pass
    
    return None


def extract_medications(text: str) -> list[dict]:
    """Extract medications from text using regex and drug dictionary."""
    medications = []
    seen_drugs = set()
    
    for pattern in MEDICATION_PATTERNS:
        for match in pattern.finditer(text):
            name = match.group(1).strip()
            dosage = (match.group(2) or "").strip()
            frequency = (match.group(3) or "").strip()
            
            name_lower = name.lower()
            if name_lower in seen_drugs:
                continue
            seen_drugs.add(name_lower)
            
            medications.append({
                "name": name,
                "dosage": dosage,
                "frequency": frequency
            })
    
    # Also scan for known drug names in text
    text_lower = text.lower()
    for drug in COMMON_DRUGS:
        if drug in text_lower and drug not in seen_drugs:
            # Found a known drug mentioned but not matched by pattern
            # Don't add without dosage info — mark as partial
            pass
    
    return medications


def extract_vitals(text: str) -> dict:
    """Extract vital signs from text."""
    vitals = {}
    
    bp_match = BP_PATTERN.search(text)
    if bp_match:
        vitals["blood_pressure"] = f"{bp_match.group(1)}/{bp_match.group(2)} mmHg"
    
    pulse_match = PULSE_PATTERN.search(text)
    if pulse_match:
        vitals["pulse"] = f"{pulse_match.group(1)} /min"
    
    temp_match = TEMP_PATTERN.search(text)
    if temp_match:
        vitals["temperature"] = temp_match.group(1)
    
    weight_match = WEIGHT_PATTERN.search(text)
    if weight_match:
        vitals["weight"] = f"{weight_match.group(1)} kg"
    
    height_match = HEIGHT_PATTERN.search(text)
    if height_match:
        vitals["height"] = f"{height_match.group(1)} cm"
    
    return vitals


def extract_hospital(text: str) -> str | None:
    """Extract hospital/clinic name from text.
    Cleans up multi-line OCR noise and returns just the core name."""
    match = HOSPITAL_PATTERN.search(text)
    if match:
        name = match.group(1).strip()
        # Clean multi-line OCR artifacts: take only the line containing the keyword
        if '\n' in name:
            # Find the line that contains the hospital/clinic/diagnostic keyword
            for part in name.split('\n'):
                part = part.strip()
                if any(kw in part.lower() for kw in 
                       ['hospital', 'clinic', 'medical', 'diagnostic', 'center', 'centre',
                        'laboratory', 'health']):
                    name = part
                    break
            else:
                # If no keyword line found, take the longest line
                name = max(name.split('\n'), key=len).strip()
        # Remove address suffixes
        name = re.sub(r'\s*Address.*$', '', name, flags=re.IGNORECASE).strip()
        # Clean trailing punctuation
        name = name.strip('.,;: ')
        return name if len(name) > 3 else None
    return None


def extract_doctor(text: str) -> str | None:
    """Extract doctor name from text."""
    match = DOCTOR_PATTERN.search(text)
    if match:
        return f"Dr. {match.group(1).strip()}"
    return None


def parse_medical_text(raw_text: str) -> dict:
    """
    Main parsing function. Takes raw OCR text and extracts all
    structured medical data using regex and dictionaries.
    
    Returns:
        {
            "document_type": str,
            "date": str or None,
            "hospital_or_clinic": str or None,
            "doctor_name": str or None,
            "diagnosis": [],
            "medications": [],
            "lab_results": [],
            "allergies": [],
            "vitals": {},
            "notes": str or None,
            "raw_text": str,
            "extraction_confidence": str,
            "parsing_stats": {
                "fields_resolved": int,
                "total_fields": int,
                "needs_llm": bool,
                "unresolved_text": str
            }
        }
    """
    result = {
        "document_type": "unknown",
        "date": None,
        "hospital_or_clinic": None,
        "doctor_name": None,
        "diagnosis": [],
        "medications": [],
        "lab_results": [],
        "allergies": [],
        "notes": None,
        "raw_text": raw_text,
        "extraction_confidence": "low"
    }
    
    if not raw_text or not raw_text.strip():
        result["parsing_stats"] = {
            "fields_resolved": 0,
            "total_fields": 8,
            "needs_llm": True,
            "unresolved_text": ""
        }
        return result
    
    # 1. Document type
    result["document_type"] = classify_document_type(raw_text)
    
    # 2. Dates
    dates = extract_dates(raw_text)
    result["date"] = dates[0] if dates else None
    
    # 3. Hospital/Clinic
    result["hospital_or_clinic"] = extract_hospital(raw_text)
    
    # 4. Doctor name
    result["doctor_name"] = extract_doctor(raw_text)
    
    # 5. Lab results
    result["lab_results"] = extract_lab_results(raw_text)
    
    # 6. Medications
    result["medications"] = extract_medications(raw_text)
    
    # 7. Vitals
    vitals = extract_vitals(raw_text)
    if vitals:
        # Add vitals as notes since they don't have a dedicated field in schema
        vitals_str = ", ".join(f"{k}: {v}" for k, v in vitals.items())
        result["notes"] = f"Vitals: {vitals_str}"
    
    # 8. Allergies — look for allergy mentions
    allergy_pattern = re.compile(
        r'(?:allerg(?:y|ies|ic)\s*(?:to)?[:=]?\s*)([\w\s,]+?)(?:\.|$|\n)',
        re.IGNORECASE
    )
    allergy_match = allergy_pattern.search(raw_text)
    if allergy_match:
        allergies_text = allergy_match.group(1).strip()
        result["allergies"] = [a.strip() for a in allergies_text.split(',') if a.strip()]
    
    # Calculate parsing stats
    fields_resolved = 0
    total_fields = 8  # doc_type, date, hospital, doctor, diagnosis, meds, labs, allergies
    
    if result["document_type"] != "unknown":
        fields_resolved += 1
    if result["date"]:
        fields_resolved += 1
    if result["hospital_or_clinic"]:
        fields_resolved += 1
    if result["doctor_name"]:
        fields_resolved += 1
    if result["lab_results"]:
        fields_resolved += 1
    if result["medications"]:
        fields_resolved += 1
    if result["diagnosis"]:
        fields_resolved += 1
    if result["allergies"]:
        fields_resolved += 1
    
    # Determine confidence
    ratio = fields_resolved / total_fields
    if ratio >= 0.6:
        result["extraction_confidence"] = "high"
    elif ratio >= 0.3:
        result["extraction_confidence"] = "medium"
    else:
        result["extraction_confidence"] = "low"
    
    # Determine if LLM is needed
    # LLM is needed for: diagnosis extraction (NLP), complex medication parsing,
    # and anything the regex couldn't handle
    needs_llm = (
        not result["diagnosis"]  # Diagnosis almost always needs NLP
        or (result["document_type"] in ("prescription", "discharge_summary") and not result["medications"])
        or result["extraction_confidence"] == "low"
    )
    
    # Build unresolved text: parts that regex couldn't parse
    # (lines that didn't match any pattern — potential clinical notes)
    resolved_values = set()
    for lab in result["lab_results"]:
        resolved_values.add(lab["test_name"].lower())
    for med in result["medications"]:
        resolved_values.add(med["name"].lower())
    
    unresolved_lines = []
    for line in raw_text.split('\n'):
        line_stripped = line.strip()
        if not line_stripped or len(line_stripped) < 3:
            continue
        line_lower = line_stripped.lower()
        # Skip lines that are just headers, numbers, or already parsed
        if any(val in line_lower for val in resolved_values):
            continue
        if re.match(r'^[\d\s\.\-/]+$', line_stripped):
            continue
        unresolved_lines.append(line_stripped)
    
    result["parsing_stats"] = {
        "fields_resolved": fields_resolved,
        "total_fields": total_fields,
        "needs_llm": needs_llm,
        "unresolved_text": "\n".join(unresolved_lines[:50])  # Limit to first 50 unresolved lines
    }
    
    return result
