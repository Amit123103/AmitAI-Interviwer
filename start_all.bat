@echo off
setlocal EnableDelayedExpansion

echo.
echo ==========================================
echo   AI INTERVIEWER - UNIFIED STARTUP v3
echo ==========================================
echo.

REM ── Resolve AI service Python ──────────────────────────────────
set AI_DIR=%cd%\ai-service
set PYTHON=
if exist "%AI_DIR%\.venv\Scripts\python.exe" (
    set "PYTHON=%AI_DIR%\.venv\Scripts\python.exe"
) else if exist "%AI_DIR%\venv\Scripts\python.exe" (
    set "PYTHON=%AI_DIR%\venv\Scripts\python.exe"
) else (
    set PYTHON=python
)

REM ── Step 1: Free ports ─────────────────────────────────────────
echo [PRE] Freeing ports 8000 and 5001...
if exist "server\scripts\free-port.js" (
    node server\scripts\free-port.js 8000 2>nul
    node server\scripts\free-port.js 5001 2>nul
)
echo [PRE] Ports cleared.
echo.

REM ── Step 2: Validate AI service dependencies ───────────────────
echo [1/4] Validating AI service environment...
"%PYTHON%" "%AI_DIR%\validate_env.py"
if %errorlevel% neq 0 (
    echo [WARN] AI Service dependency check failed.
    echo [WARN] AI Service will not start — run: cd ai-service ^& pip install -r requirements.txt
    echo.
    goto START_BACKEND
)
echo.

REM ── Step 3: Start AI Service in background ─────────────────────
echo [2/4] Starting AI Service (FastAPI on port 8000)...
start "AI-Service" /D "%AI_DIR%" /MIN "%PYTHON%" -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload --log-level info
echo       AI Service launched in background window.
echo.

REM ── Step 4: Wait for AI health (max 60s = 20 attempts x 3s) ────
echo [3/4] Waiting for AI Service health check...
set READY=0
set ATTEMPTS=0
set MAX_ATTEMPTS=20

:HEALTH_CHECK_LOOP
set /a ATTEMPTS+=1
if %ATTEMPTS% gtr %MAX_ATTEMPTS% (
    echo.
    echo [WARN] AI Service did not respond after 60s.
    echo [WARN] Backend will start in DEGRADED mode.
    echo.
    goto START_BACKEND
)

REM Use PowerShell for HTTP check (curl on Windows is actually Invoke-WebRequest)
for /f %%i in ('powershell -Command "try { $r = Invoke-WebRequest -Uri 'http://localhost:8000/health' -UseBasicParsing -TimeoutSec 2; $r.StatusCode } catch { 0 }" 2^>nul') do set HTTP_CODE=%%i

if "!HTTP_CODE!"=="200" (
    set READY=1
    echo [OK] AI Service is healthy! (attempt !ATTEMPTS!)
    goto START_BACKEND
)

echo       [!ATTEMPTS!/%MAX_ATTEMPTS%] AI Service not ready — retrying in 3s...
timeout /t 3 /nobreak >nul
goto HEALTH_CHECK_LOOP

:START_BACKEND
echo.
REM ── Step 5: Start Node.js Backend ──────────────────────────────
echo [3/4] Starting Backend Server (Node.js on port 5001)...
start "Backend-Server" /D "server" /MIN cmd /c "npm run dev"

REM Wait a few seconds for Node to bind
timeout /t 5 /nobreak >nul

REM ── Step 6: Start Next.js Frontend ─────────────────────────────
echo [4/4] Starting Frontend Client (Next.js on port 3000)...
start "Frontend-Client" /D "client" /MIN cmd /c "npm run dev"

echo.
echo ==========================================
if "%READY%"=="1" (
    echo   [SUCCESS] All services launched.
    echo   AI Service  : http://localhost:8000
) else (
    echo   [DEGRADED] AI Service may still be loading.
    echo   Check AI:     http://localhost:8000/health
)
echo   Backend     : http://localhost:5001
echo   Frontend    : http://localhost:3000
echo   Health API  : http://localhost:5001/api/system/health
echo ==========================================
echo.
echo   Service windows are running minimized.
echo   Close this window to leave services running.
echo.
pause
