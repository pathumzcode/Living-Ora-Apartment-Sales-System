@echo off
echo ========================================================
echo   Starting Local MySQL Server (XAMPP)
echo ========================================================

netstat -ano | findstr :3306 >nul
if %errorlevel% equ 0 (
    echo [INFO] MySQL is already running on port 3306.
    goto :done
)

if exist "C:\xampp\mysql_start.bat" (
    echo [INFO] Starting MySQL from C:\xampp\mysql_start.bat ...
    start "" "C:\xampp\mysql_start.bat"
    timeout /t 3 /nobreak >nul
    goto :check
)

if exist "C:\xampp\mysql\bin\mysqld.exe" (
    echo [INFO] Starting mysqld.exe ...
    start "" "C:\xampp\mysql\bin\mysqld.exe" --defaults-file="C:\xampp\mysql\bin\my.ini" --standalone
    timeout /t 3 /nobreak >nul
    goto :check
)

echo [ERROR] Could not find MySQL installation in C:\xampp.
echo Please start MySQL from XAMPP Control Panel.
pause
exit /b 1

:check
netstat -ano | findstr :3306 >nul
if %errorlevel% equ 0 (
    echo [SUCCESS] MySQL Server started successfully on port 3306!
) else (
    echo [WARNING] MySQL did not start automatically. Please check XAMPP Control Panel.
)

:done
echo ========================================================
echo You can now connect to MySQL using MySQL Workbench or Spring Boot!
echo Database: apartment_sales_system
echo Username: root
echo Password: (leave empty / blank)
echo ========================================================
pause
