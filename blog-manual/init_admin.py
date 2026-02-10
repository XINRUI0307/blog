import sqlite3
from database import init_db, get_db
from auth_utils import hash_password
from datetime import datetime

def create_admin():
    init_db()
    conn = get_db()
    cur = conn.cursor()
    cur.execute("SELECT id FROM users WHERE username = ?", ("admin",))
    if cur.fetchone():
        print("Admin user already exists.")
        conn.close()
        return
    now = datetime.utcnow().isoformat()
    cur.execute(
        """INSERT INTO users (username, email, password_hash, role, status, agreed_terms, created_at)
           VALUES (?, ?, ?, 'admin', 'approved', 1, ?)""",
        ("admin", "admin@localhost", hash_password("admin123"), now)
    )
    conn.commit()
    conn.close()
    print("Admin created: username=admin, password=admin123. Change in production.")

if __name__ == "__main__":
    create_admin()
