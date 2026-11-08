@echo off
cd /d "%~dp0"
py -3 --version >nul 2>&1
if not errorlevel 1 (
    py -3 start.py
    goto end
)
python --version >nul 2>&1
if not errorlevel 1 (
    python start.py
    goto end
)
echo Installeer Python 3 vanaf https://www.python.org/downloads/
echo Open daarna dit bestand opnieuw.
:end
pause
