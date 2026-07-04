"""
INTEGRATION NOTE FOR TEAMMATES:
---------------------------------------------------
To register this pipeline in the main Flask application, add the following 
lines to your main app runner (e.g. app.py):

    from ai.routes import ai_bp
    app.register_blueprint(ai_bp)

Make sure you have installed packages from ai/requirements.txt.
---------------------------------------------------
"""

from flask import Blueprint, request, jsonify
from flask_cors import cross_origin

try:
    from ai import pipeline
except ImportError:
    import pipeline

# Create the Flask Blueprint
ai_bp = Blueprint("ai_bp", __name__)

@ai_bp.route("/api/ai/extract", methods=["POST"])
@cross_origin()  # Decorate the route to be CORS-friendly
def extract_document():
    """
    POST /api/ai/extract
    Accepts: multipart/form-data with a 'file' parameter.
             Optionally accepts a 'previous_events' form parameter (JSON string).
    Returns: JSON formatted extraction conforming to schema.py.
    """
    # 1. Check if 'file' part is present in request
    if "file" not in request.files:
        return jsonify({
            "error": "Bad Request",
            "message": "Missing 'file' field in multipart/form-data request."
        }), 400

    uploaded_file = request.files["file"]

    # 2. Check if user submitted an empty filename
    if uploaded_file.filename == "":
        return jsonify({
            "error": "Bad Request",
            "message": "No file was selected for upload."
        }), 400

    # Parse optional previous events history list
    previous_events_str = request.form.get("previous_events")
    previous_events = None
    if previous_events_str:
        import json
        try:
            previous_events = json.loads(previous_events_str)
        except Exception as e:
            return jsonify({
                "error": "Bad Request",
                "message": f"Failed to parse 'previous_events' JSON string: {e}"
            }), 400

    try:
        # 3. Process file through the ingestion pipeline
        extracted_json = pipeline.process_document(uploaded_file, previous_events=previous_events)
        
        # 4. Return validated JSON
        return jsonify(extracted_json), 200

    except Exception as e:
        # Return 500 status code with detailed message for quick hackathon debugging
        import traceback
        trace = traceback.format_exc()
        print(f"[-] Error during route extraction:\n{trace}")
        return jsonify({
            "error": "Internal Server Error",
            "message": str(e),
            "traceback": trace
        }), 500


# TEMPORARY - REMOVE BEFORE SUBMISSION
@ai_bp.route("/api/ai/test", methods=["GET"])
@cross_origin()
def test_extraction_eyeball():
    """
    GET /api/ai/test
    TEMPORARY: Runs pipeline.process_document() on the hardcoded sample file 
    and returns JSON directly to the browser for quick visual checking.
    """
    import os
    current_dir = os.path.dirname(os.path.abspath(__file__))
    test_file = os.path.join(current_dir, "sample_prescription.jpg")

    if not os.path.exists(test_file):
        return jsonify({
            "error": "Test File Not Found",
            "message": f"To eyeball the output, please place a sample medical image/PDF at: {os.path.abspath(test_file)}"
        }), 404

    try:
        result = pipeline.process_document(test_file)
        return jsonify(result), 200
    except Exception as e:
        import traceback
        trace = traceback.format_exc()
        return jsonify({
            "error": "Internal Server Error during eyeball test",
            "message": str(e),
            "traceback": trace
        }), 500
