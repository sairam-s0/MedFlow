import base64
import mimetypes
import os

try:
    import fitz  # PyMuPDF
except ImportError:
    fitz = None

def file_to_base64(file_storage_or_path) -> tuple[str, str]:
    """
    Reads a file (either from a local file path or a Flask FileStorage object),
    detects the mime type, and returns it as a base64-encoded string along with its mime type.
    
    If the input file is a PDF, the first page is extracted and rendered into a PNG image, 
    which is then base64-encoded.
    
    Returns:
        (base64_str, mime_type)
    """
    filename = None
    file_bytes = None
    mime_type = None

    # Check if the input is a Flask FileStorage object
    # Flask FileStorage typically has 'read', 'filename', and 'content_type' attributes
    if hasattr(file_storage_or_path, 'read') and hasattr(file_storage_or_path, 'filename'):
        filename = file_storage_or_path.filename
        mime_type = getattr(file_storage_or_path, 'content_type', None)
        file_bytes = file_storage_or_path.read()
        # Reset read pointer so other operations could read it if needed
        if hasattr(file_storage_or_path, 'seek'):
            file_storage_or_path.seek(0)
    else:
        # Assume it's a file path string
        filename = str(file_storage_or_path)
        if not os.path.exists(filename):
            raise FileNotFoundError(f"File not found: {filename}")
        
        mime_type, _ = mimetypes.guess_type(filename)
        with open(filename, "rb") as f:
            file_bytes = f.read()

    # Fallback mime-type detection if guessing failed
    if not mime_type:
        ext = os.path.splitext(filename)[1].lower()
        if ext in [".jpg", ".jpeg"]:
            mime_type = "image/jpeg"
        elif ext == ".png":
            mime_type = "image/png"
        elif ext == ".pdf":
            mime_type = "application/pdf"
        else:
            mime_type = "application/octet-stream"

    # Handle PDF conversion to image
    if mime_type == "application/pdf":
        if fitz is None:
            raise ImportError(
                "PyMuPDF ('fitz') is required to process PDF files. "
                "Please run: pip install pymupdf"
            )
        
        # Open PDF from bytes
        doc = fitz.open(stream=file_bytes, filetype="pdf")
        if len(doc) == 0:
            raise ValueError("The provided PDF file contains no pages.")
        
        # Extract first page
        page = doc[0]
        # Render page to a pixmap (image)
        pix = page.get_pixmap()
        # Convert pixmap to PNG bytes
        img_bytes = pix.tobytes("png")
        mime_type = "image/png"
        base64_str = base64.b64encode(img_bytes).decode("utf-8")
    else:
        # Directly base64 encode the image bytes (JPEG, PNG, etc.)
        base64_str = base64.b64encode(file_bytes).decode("utf-8")

    return base64_str, mime_type
