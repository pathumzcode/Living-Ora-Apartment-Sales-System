@echo off
echo ========================================================
echo   Living-Ora Apartment Sales System - Backend Launcher
echo ========================================================

echo [1/3] Checking MySQL Server status on port 3306...
netstat -ano | findstr :3306 >nul
if %errorlevel% neq 0 (
    echo [WARNING] MySQL is not running on port 3306!
    echo Attempting to start MySQL from XAMPP...
    if exist "C:\xampp\mysql_start.bat" (
        start "" "C:\xampp\mysql_start.bat"
        timeout /t 4 /nobreak >nul
    )
)

netstat -ano | findstr :3306 >nul
if %errorlevel% neq 0 (
    echo [ERROR] MySQL Server is NOT running.
    echo Please start MySQL from XAMPP Control Panel or run start-mysql.bat first.
    pause
    exit /b 1
)
echo [OK] MySQL Server is running on port 3306.

echo [2/3] Checking Java (JDK 25)...
java -version

echo [3/3] Starting Spring Boot Backend on http://localhost:8080 ...
cd /D "%~dp0\Apartment Sales System Backend"

set "MVN_PATH=C:\Program Files\JetBrains\IntelliJ IDEA Community Edition 2024.2.6\plugins\maven\lib\maven3\bin\mvn.cmd"
where mvn >nul 2>&1
if %errorlevel% equ 0 (
    echo Running with system Maven...
    mvn spring-boot:run
    goto :done
)

if exist "%MVN_PATH%" (
    echo Running with IntelliJ Maven...
    "%MVN_PATH%" spring-boot:run
    goto :done
)

echo Running with Gradle wrapper...
call gradlew.bat bootRun

:done
pause
