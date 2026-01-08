@echo off
echo Starting SGM...
echo.

REM Set environment variables
set DATABASE_URL=file:./data/sgm.db
set DOCUMENT_ROOT=./data/documents
set PLAN_ROOT=./data/plans
set STORAGE_MODE=local_sqlite
set ENABLE_DEMO_DATA=false
set PORT=3003

REM Start the server
echo Server starting at http://localhost:3003
echo Press Ctrl+C to stop
node server.js

pause
