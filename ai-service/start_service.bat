@echo off
setlocal
set PYTHONPATH=%cd%

echo.
echo ══════════════════════════════════════════
echo   AI Service Startup
echo ══════════════════════════════════════════
echo.

REM ── Resolve Python executable ──────────────────────────────────
set PYTHON=
if exist ".venv\Scripts\python.exe" (
    set "PYTHON=%cd%\.venv\Scripts\python.exe"
    echo [OK] Using .venv Python
) else if exist "venv\Scripts\python.exe" (
    set "PYTHON=%cd%\venv\Scripts\python.exe"
    echo [OK] Using venv Python
) else (
    where python >nul 2>&1
    if %errorlevel% equ 0 (
        set PYTHON=python
        echo [WARN] No venv found — using system Python
    ) else (
        echo [FATAL] Python not found. Install Python 3.10+ and create a venv.
        pause
        exit /b 1
    )
)

REM ── Free port 8000 if occupied ─────────────────────────────────
echo [1/4] Checking port 8000...
if exist cleanup_port.py (
    "%PYTHON%" cleanup_port.py
) else (
    echo       Skipping port cleanup (cleanup_port.py not found)
)

REM ── Validate dependencies ──────────────────────────────────────
echo [2/4] Validating dependencies...
"%PYTHON%" validate_env.py
if %errorlevel% neq 0 (
    echo.
    echo [FATAL] Dependency validation failed. Fix above issues first.
    echo         Run: pip install -r requirements.txt
    pause
    exit /b 1
)

REM ── Start uvicorn ──────────────────────────────────────────────
echo [3/4] Starting FastAPI (uvicorn)...
echo.

"%PYTHON%" -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload --log-level info 2>&1

REM ── If we get here, uvicorn exited ─────────────────────────────
echo.
echo [4/4] Uvicorn exited with code %errorlevel%.
if %errorlevel% neq 0 (
    echo [FATAL] AI Service failed to start. Check output above.
    pause
)
endlocal
