@echo off
REM Script to setup test database for API tests on Windows
REM Run this script before running tests

echo Setting up test database...

REM Database configuration
if "%TEST_DB_HOST%"=="" set TEST_DB_HOST=localhost
if "%TEST_DB_PORT%"=="" set TEST_DB_PORT=5432
if "%TEST_DB_USER%"=="" set TEST_DB_USER=postgres
if "%TEST_DB_PASSWORD%"=="" set TEST_DB_PASSWORD=postgres
if "%TEST_DB_NAME%"=="" set TEST_DB_NAME=nd_hw19_test

echo Checking PostgreSQL connection...
pg_isready -h %TEST_DB_HOST% -p %TEST_DB_PORT% -U %TEST_DB_USER% >nul 2>&1
if errorlevel 1 (
    echo ❌ PostgreSQL is not running on %TEST_DB_HOST%:%TEST_DB_PORT%
    echo Please start PostgreSQL service and try again
    exit /b 1
)

echo ✅ PostgreSQL is running

echo Creating test database if it doesn't exist...
set PGPASSWORD=%TEST_DB_PASSWORD%
psql -h %TEST_DB_HOST% -p %TEST_DB_PORT% -U %TEST_DB_USER% -tc "SELECT 1 FROM pg_database WHERE datname = '%TEST_DB_NAME%'" | findstr "1" >nul
if errorlevel 1 (
    psql -h %TEST_DB_HOST% -p %TEST_DB_PORT% -U %TEST_DB_USER% -c "CREATE DATABASE %TEST_DB_NAME%"
)

if errorlevel 1 (
    echo ❌ Failed to create test database '%TEST_DB_NAME%'
    exit /b 1
) else (
    echo ✅ Test database '%TEST_DB_NAME%' is ready
)

REM Set environment variables for tests
set NODE_ENV=test
set JWT_SECRET=test-secret-key-for-api-tests

echo ✅ Test environment configured
echo Database: %TEST_DB_NAME%
echo Host: %TEST_DB_HOST%:%TEST_DB_PORT%
echo User: %TEST_DB_USER%
echo.
echo You can now run the tests with: npm test
