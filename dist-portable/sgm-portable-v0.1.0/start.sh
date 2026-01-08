#!/bin/bash

echo "Starting SGM..."
echo ""

# Set environment variables
export DATABASE_URL=file:./data/sgm.db
export DOCUMENT_ROOT=./data/documents
export PLAN_ROOT=./data/plans
export STORAGE_MODE=local_sqlite
export ENABLE_DEMO_DATA=false
export PORT=3003

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
  echo "Error: Node.js is not installed."
  echo "Please install Node.js 20+ from https://nodejs.org"
  exit 1
fi

# Start the server
echo "Server starting at http://localhost:3003"
echo "Press Ctrl+C to stop"
echo ""
node server.js
