#!/bin/bash
# Load environment variables from .env file
set -a
source .env
set +a

# Start the server
.venv/bin/python -m uvicorn app.main:app --reload --port 8000
