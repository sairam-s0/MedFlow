#!/bin/bash
# MedFlow Start Script for Linux

echo "=================================================="
echo "Starting MedFlow Full Stack Service"
echo "=================================================="

# Check Python
if ! command -v python3 &> /dev/null; then
    echo "[!] python3 command not found. Please install python3."
    exit 1
fi

# Check Node.js / npm
if ! command -v npm &> /dev/null; then
    echo "[!] npm/Node.js not found. Please install Node.js."
    exit 1
fi

# Determine python command to use (conda environment or system python)
CONDA_PY="/home/allan/.conda/envs/flask/bin/python"
if [ -f "$CONDA_PY" ]; then
    PYTHON_CMD="$CONDA_PY"
    echo "[*] Using Conda environment python: $CONDA_PY"
else
    # Fallback to local .venv if exists
    if [ -d "backend/.venv" ]; then
        PYTHON_CMD="backend/.venv/bin/python"
        echo "[*] Using local virtual environment python"
    else
        # Create virtual env
        echo "[*] Creating local virtual environment..."
        python3 -m venv backend/.venv
        PYTHON_CMD="backend/.venv/bin/python"
    fi
fi

# Update dependencies
echo "[*] Installing backend dependencies..."
$PYTHON_CMD -m pip install --upgrade pip
$PYTHON_CMD -m pip install -r backend/requirements.txt

# Start backend in background
echo "[*] Launching Flask Backend..."
cd backend
$PYTHON_CMD app.py &
BACKEND_PID=$!
cd ..

# Start frontend
echo "[*] Installing frontend dependencies..."
cd frontend
if [ ! -d "node_modules" ]; then
    npm install
fi

echo "[*] Launching Vite Frontend..."
npm run dev &
FRONTEND_PID=$!
cd ..

echo "=================================================="
echo "MedFlow is active!"
echo "Backend PID: $BACKEND_PID"
echo "Frontend PID: $FRONTEND_PID"
echo "Press Ctrl+C to terminate both servers."
echo "=================================================="

# Handle clean termination of background processes on Ctrl+C
cleanup() {
    echo -e "\n[*] Terminating Flask and Vite processes..."
    kill $BACKEND_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    exit 0
}

trap cleanup SIGINT SIGTERM

# Keep script running to wait for Ctrl+C
wait
