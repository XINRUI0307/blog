#!/bin/bash
# Run with: cd /home/ubuntu/blog/blog-manual && ./deploy/run.sh
cd "$(dirname "$0")/.."
export SECRET_KEY="${SECRET_KEY:-change-me-in-production}"
if [ -d "venv" ]; then
    source venv/bin/activate
fi
# Create DB and admin if needed
python3 init_admin.py 2>/dev/null || true
exec gunicorn -w 1 -b 127.0.0.1:8000 app:app
