"""
OCR Engine — Local text extraction using EasyOCR.

This module provides free, local OCR that eliminates the need for
expensive vision LLM calls for text extraction. It handles:
- Single images (JPEG, PNG)
- Multi-page PDFs (renders all pages, OCRs each, combines text)

If EasyOCR is not installed, all functions return None so the
pipeline can gracefully fall back to the vision LLM path.
"""

import os
import io

# Lazy-loaded EasyOCR reader instance (initialized on first use)
_ocr_reader = None
_ocr_available = None


def _check_ocr_available():
    """Check if EasyOCR is available without initializing it."""
    global _ocr_available
    if _ocr_available is None:
        try:
            import easyocr
            _ocr_available = True
        except ImportError:
            _ocr_available = False
            print("[!] EasyOCR not installed. OCR engine disabled.")
            print("    Install with: pip install easyocr")
    return _ocr_available


def _get_reader():
    """Lazily initialize and return the EasyOCR reader."""
    global _ocr_reader
    if _ocr_reader is None:
        if not _check_ocr_available():
            return None
        import easyocr
        # Initialize with English language
        # gpu=False for compatibility — will auto-use GPU if torch detects one
        print("[*] Initializing EasyOCR reader (first run downloads ~100MB model)...")
        _ocr_reader = easyocr.Reader(['en'], gpu=False, verbose=False)
        print("[*] EasyOCR reader ready.")
    return _ocr_reader


def ocr_image_bytes(image_bytes: bytes) -> dict | None:
    """
    Run OCR on raw image bytes (JPEG, PNG, etc.).

    Returns:
        {
            "raw_text": str,        # All extracted text joined with newlines
            "lines": list[dict],    # Each line: {"text": str, "confidence": float, "bbox": list}
            "avg_confidence": float # Average confidence across all detected text lines
        }
        or None if EasyOCR is not available.
    """
    reader = _get_reader()
    if reader is None:
        return None

    try:
        from PIL import Image
        import numpy as np
        # Convert bytes to numpy array for EasyOCR
        img = Image.open(io.BytesIO(image_bytes))
        # Convert to RGB if needed (EasyOCR expects RGB)
        if img.mode != 'RGB':
            img = img.convert('RGB')
        img_array = np.array(img)

        # Run OCR — returns list of (bbox, text, confidence)
        results = reader.readtext(img_array)

        if not results:
            return {
                "raw_text": "",
                "lines": [],
                "avg_confidence": 0.0
            }

        lines = []
        total_confidence = 0.0
        text_parts = []

        for (bbox, text, conf) in results:
            lines.append({
                "text": text,
                "confidence": conf,
                "bbox": bbox
            })
            text_parts.append(text)
            total_confidence += conf

        avg_conf = total_confidence / len(lines) if lines else 0.0

        return {
            "raw_text": "\n".join(text_parts),
            "lines": lines,
            "avg_confidence": round(avg_conf, 4)
        }

    except Exception as e:
        print(f"[!] OCR failed on image: {e}")
        return None


def ocr_pdf_bytes(pdf_bytes: bytes) -> dict | None:
    """
    Render all pages of a PDF and OCR each page.
    Combines text from all pages into a single result.

    Returns:
        {
            "raw_text": str,
            "lines": list[dict],
            "avg_confidence": float,
            "page_count": int,
            "page_texts": list[str]  # Text per page for reference
        }
        or None if EasyOCR or PyMuPDF is not available.
    """
    if not _check_ocr_available():
        return None

    try:
        import fitz  # PyMuPDF
    except ImportError:
        print("[!] PyMuPDF not installed. Cannot process PDFs for OCR.")
        return None

    try:
        doc = fitz.open(stream=pdf_bytes, filetype="pdf")
        if len(doc) == 0:
            return {
                "raw_text": "",
                "lines": [],
                "avg_confidence": 0.0,
                "page_count": 0,
                "page_texts": []
            }

        all_lines = []
        page_texts = []
        total_confidence = 0.0
        total_line_count = 0

        for page_num in range(len(doc)):
            page = doc[page_num]
            # Render at 200 DPI for better OCR accuracy
            pix = page.get_pixmap(dpi=200)
            img_bytes = pix.tobytes("png")

            page_result = ocr_image_bytes(img_bytes)
            if page_result:
                page_texts.append(page_result["raw_text"])
                all_lines.extend(page_result["lines"])
                total_confidence += page_result["avg_confidence"] * len(page_result["lines"])
                total_line_count += len(page_result["lines"])
            else:
                page_texts.append("")

        doc.close()

        avg_conf = total_confidence / total_line_count if total_line_count > 0 else 0.0

        return {
            "raw_text": "\n\n--- PAGE BREAK ---\n\n".join(page_texts),
            "lines": all_lines,
            "avg_confidence": round(avg_conf, 4),
            "page_count": len(page_texts),
            "page_texts": page_texts
        }

    except Exception as e:
        print(f"[!] PDF OCR failed: {e}")
        return None


def ocr_file(file_storage_or_path) -> dict | None:
    """
    High-level function: accepts a file path or Flask FileStorage,
    determines type, and runs appropriate OCR.

    Returns the OCR result dict, or None if OCR is unavailable.
    """
    import mimetypes

    filename = None
    file_bytes = None
    mime_type = None

    # Handle Flask FileStorage
    if hasattr(file_storage_or_path, 'read') and hasattr(file_storage_or_path, 'filename'):
        filename = file_storage_or_path.filename
        mime_type = getattr(file_storage_or_path, 'content_type', None)
        file_bytes = file_storage_or_path.read()
        if hasattr(file_storage_or_path, 'seek'):
            file_storage_or_path.seek(0)
    else:
        # File path
        filename = str(file_storage_or_path)
        if not os.path.exists(filename):
            raise FileNotFoundError(f"File not found: {filename}")
        mime_type, _ = mimetypes.guess_type(filename)
        with open(filename, "rb") as f:
            file_bytes = f.read()

    # Fallback mime detection
    if not mime_type:
        ext = os.path.splitext(filename)[1].lower()
        mime_map = {
            ".jpg": "image/jpeg", ".jpeg": "image/jpeg",
            ".png": "image/png", ".pdf": "application/pdf"
        }
        mime_type = mime_map.get(ext, "application/octet-stream")

    # Route to appropriate OCR function
    if mime_type == "application/pdf":
        return ocr_pdf_bytes(file_bytes)
    elif mime_type.startswith("image/"):
        result = ocr_image_bytes(file_bytes)
        if result:
            result["page_count"] = 1
            result["page_texts"] = [result["raw_text"]]
        return result
    else:
        print(f"[!] Unsupported file type for OCR: {mime_type}")
        return None
