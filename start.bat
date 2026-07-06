@echo off
setlocal

echo ==================================================
echo Starting MedFlow Full Stack Deployment
echo ==================================================

:: Check Python
where python >nul 2>nul
if errorlevel 1 (
    echo [!] Python was not found on PATH.
    pause
    exit /b 1
)

:: Check Node.js/npm
where npm >nul 2>nul
if errorlevel 1 (
    echo [!] Node.js/npm were not found on PATH.
    pause
    exit /b 1
)

echo [*] Starting Flask Backend & AI API...

if "%AI_PROVIDER%"=="" set "AI_PROVIDER=groq"
if /I "%AI_PROVIDER%"=="groq" (
    if "%GROQ_API_KEY%"=="" (
        echo [!] Groq API key is not set. Set GROQ_API_KEY before uploading records.
        echo     Example: set GROQ_API_KEY=your_key_here
    )
) else if /I "%AI_PROVIDER%"=="gemini" (
    if "%GOOGLE_API_KEY%%GEMINI_API_KEY%"=="" (
        echo [!] Gemini API key is not set. Set GOOGLE_API_KEY or GEMINI_API_KEY before uploading records.
        echo     Example: set GEMINI_API_KEY=your_key_here
    )
)

cd backend

:: Create virtual environment if it doesn't exist
if not exist ".venv" (
    echo [*] Creating backend virtual environment...
    python -m venv .venv
)

if not exist ".venv\Scripts\python.exe" (
    echo [!] Backend virtual environment could not be created.
    pause
    exit /b 1
)

:: Upgrade pip
call .venv\Scripts\python.exe -m pip install --upgrade pip

:: Install backend dependencies
call .venv\Scripts\python.exe -m pip install -r ..\requirements.txt

:: Start backend in a new terminal
start "MedFlow Backend" cmd /k ".venv\Scripts\python.exe app.py"

cd ..

timeout /t 3 >nul

echo [*] Starting Vite Frontend...

cd frontend

:: Install frontend dependencies
if not exist "node_modules" (
    echo [*] Installing Frontend Dependencies...
    call npm install
)

:: Start frontend in a new terminal
start "MedFlow Frontend" cmd /k "npm run dev"

cd ..

echo.
echo ==================================================
echo MedFlow is now running!
echo.
echo Backend/AI API: http://127.0.0.1:5000
echo Frontend App:   http://127.0.0.1:5173
echo ==================================================
echo.

pause
