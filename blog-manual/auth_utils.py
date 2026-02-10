import hashlib
import secrets
from functools import wraps
from flask import session, redirect, url_for, request

def hash_password(password):
    salt = secrets.token_hex(16)
    p = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt.encode("utf-8"), 100000)
    return salt + p.hex()

def check_password(password, stored):
    if not stored or len(stored) < 32:
        return False
    salt = stored[:32]
    p = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt.encode("utf-8"), 100000)
    return (salt + p.hex()) == stored

def login_required(f):
    @wraps(f)
    def inner(*args, **kwargs):
        if "user_id" not in session:
            return redirect(url_for("login", next=request.url))
        return f(*args, **kwargs)
    return inner

def approved_user_required(f):
    @wraps(f)
    def inner(*args, **kwargs):
        if "user_id" not in session:
            return redirect(url_for("login", next=request.url))
        from database import get_db
        conn = get_db()
        cur = conn.cursor()
        cur.execute("SELECT status FROM users WHERE id = ?", (session["user_id"],))
        row = cur.fetchone()
        conn.close()
        if not row or row[0] != "approved":
            return redirect(url_for("pending"))
        return f(*args, **kwargs)
    return inner

def contributor_required(f):
    @wraps(f)
    def inner(*args, **kwargs):
        if "user_id" not in session:
            return redirect(url_for("login", next=request.url))
        from database import get_db
        conn = get_db()
        cur = conn.cursor()
        cur.execute("SELECT role, status FROM users WHERE id = ?", (session["user_id"],))
        row = cur.fetchone()
        conn.close()
        if not row or row[1] != "approved":
            return redirect(url_for("pending"))
        if row[0] not in ("contributor", "admin"):
            return redirect(url_for("index"))
        return f(*args, **kwargs)
    return inner

def admin_required(f):
    @wraps(f)
    def inner(*args, **kwargs):
        if "user_id" not in session:
            return redirect(url_for("login", next=request.url))
        from database import get_db
        conn = get_db()
        cur = conn.cursor()
        cur.execute("SELECT role FROM users WHERE id = ?", (session["user_id"],))
        row = cur.fetchone()
        conn.close()
        if not row or row[0] != "admin":
            return redirect(url_for("index"))
        return f(*args, **kwargs)
    return inner
