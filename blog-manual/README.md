# Travel Blog (Manual Version)

Flask + SQLite travel blog. Run locally or behind Nginx with Gunicorn.

## Setup

```bash
python3 -m venv venv
source venv/bin/activate  # or venv\Scripts\activate on Windows
pip install -r requirements.txt
python init_admin.py
python app.py
```

Open http://127.0.0.1:5000 . Login as admin / admin123 to approve users.

## Production (Linux + Nginx)

See `deploy/` for Nginx config and run instructions.
