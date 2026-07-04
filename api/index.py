"""
Vercel Serverless Function entry point.
Imports the Flask app from backend/app.py and exposes it as 'app'
so Vercel's @vercel/python runtime can serve it.
"""
import sys
import os

# Add backend/ to Python path so all imports (models, ai, seed, etc.) resolve correctly
backend_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "backend")
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

# Import the Flask app — Vercel looks for an 'app' variable
from app import app
