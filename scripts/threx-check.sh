#!/bin/bash

# THREX Self-Healing & DX Audit Script
# Ensures all services are configured correctly and dependencies are synced.

echo "🔍 Starting THREX System Audit..."

# 1. Environment Variables Check
echo "📡 Checking Environment Variables..."
if [ ! -f ".env" ]; then
    echo "⚠️  .env file missing! Creating from .env.example..."
    cp .env.example .env
fi

# 2. Python AI Service Audit
echo "🐍 Auditing AI Service (Python)..."
cd ai-service
if [ ! -d ".venv" ]; then
    echo "⚠️  Virtual environment missing. Creating..."
    python3 -m venv .venv
fi

echo "📦 Syncing Python dependencies..."
./.venv/bin/python -m pip install -r requirements.txt | grep -v "already satisfied"

# 3. Web Frontend Audit
echo "🌐 Auditing Web Frontend (Next.js)..."
cd ../threx-web
if [ ! -d "node_modules" ]; then
    echo "⚠️  node_modules missing. Installing..."
    pnpm install
else
    echo "📦 Checking for missing packages..."
    pnpm install --frozen-lockfile || pnpm install
fi

# 4. VS Code Settings Audit
echo "🛠️  Validating Editor Settings..."
cd ..
if [ ! -f ".vscode/settings.json" ]; then
    mkdir -p .vscode
    echo '{"python.defaultInterpreterPath": "./ai-service/.venv/bin/python"}' > .vscode/settings.json
fi

echo "✅ Audit Complete. THREX is ready for development."
