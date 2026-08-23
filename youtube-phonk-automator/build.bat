@echo off
REM Builds the Windows executable. Run from the project folder with the
REM project's virtual environment activated (pip install -r requirements.txt
REM must have been run first).
python build.py
if errorlevel 1 (
    echo Build failed.
    pause
    exit /b 1
)
echo.
echo Build succeeded. See dist\YouTubePhonkAutomator\
pause
