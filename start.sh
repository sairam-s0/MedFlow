#!/bin/bash
echo "=================================================="
echo "Starting MedFlow Full Stack Deployment"
echo "=================================================="

# 1. Kill any existing processes on port 5000 and 5173 (Vite default)
echo "[*] Cleaning up old processes..."
fuser -k 5000/tcp 2>/dev/null
fuser -k 5173/tcp 2>/dev/null

# 2. Start the Backend & AI Services
echo "[*] Starting Flask Backend & AI API on port 5000..."
cd backend
# Using the conda environment directly
/home/allan/.conda/envs/flask/bin/python app.py &
BACKEND_PID=$!
cd ..

# Wait for backend to initialize
sleep 3

# 3. Start the Frontend
echo "[*] Starting Vite Frontend on port 5173..."
cd frontend
if [ ! -d "node_modules" ]; then
    echo "[*] Installing Frontend Dependencies..."
    npm install
fi
npm run dev &
FRONTEND_PID=$!
cd ..

echo "=================================================="
echo "MedFlow is now running!"
echo "Backend/AI API: http://127.0.0.1:5000"
echo "Frontend App:   http://127.0.0.1:5173"
echo "=================================================="
echo "Press Ctrl+C to stop all services."

# Wait for both processes
wait $BACKEND_PID $FRONTEND_PID
