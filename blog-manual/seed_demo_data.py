"""
Insert demo users and sample blog data for teacher presentation.
Run once after init_admin.py. All demo accounts use password: demo123
"""
import sqlite3
from datetime import datetime, timezone
from database import get_db, init_db
from auth_utils import hash_password

DEMO_PASSWORD = "demo123"

USERS = [
    ("reader1", "reader1@demo.local", "reader", "approved"),
    ("reader2", "reader2@demo.local", "reader", "approved"),
    ("author1", "author1@demo.local", "contributor", "approved"),
    ("author2", "author2@demo.local", "contributor", "approved"),
    ("pending1", "pending1@demo.local", "contributor", "pending"),
]

# (user_id will be set by author1=4, author2=5 after insert)
POSTS_RAW = [
    ("author1", "Three Days in Guilin", "Guilin and Yangshuo have stunning scenery. Li River bamboo raft and West Street night market are must-sees. Day 1: Elephant Trunk Hill, Two Rivers and Four Lakes. Day 2: Li River highlights. Day 3: Cycling along Yulong River.", "Guilin, Guangxi"),
    ("author1", "Ancient Xi'an and Its Food", "Xi'an city wall, Big Wild Goose Pagoda, and the Terracotta Army are must-sees. Muslim Quarter: roujiamo, liangpi, yangrou paomo—something different every day.", "Xi'an, Shaanxi"),
    ("author2", "West Lake and Lingyin Temple, Hangzhou", "Walk around West Lake's ten scenic spots, find peace at Lingyin Temple. Drink tea in Longjing Village, buy souvenirs on Hefang Street.", "Hangzhou, Zhejiang"),
    ("author2", "Chengdu: Pandas and Hotpot", "See giant pandas at the base, then explore Kuanzhai Alley and Jinli. Hotpot and skewers are the soul of the trip.", "Chengdu, Sichuan"),
]

# (post_idx 1-based, username for commenter)
COMMENTS_RAW = [
    (1, "reader1", "The Li River bamboo raft was really worth it!"),
    (1, "reader2", "West Street gets very crowded at night; go earlier if you can."),
    (2, "reader1", "I thought the roujiamo was delicious too."),
    (2, "reader2", "I'd recommend getting a guide for the Terracotta Army."),
    (3, "reader1", "Lingyin Temple has a very peaceful atmosphere."),
]

# (post_idx, username, stars)
RATINGS_RAW = [
    (1, "reader1", 5),
    (1, "reader2", 4),
    (2, "reader1", 5),
    (2, "reader2", 4),
    (3, "reader1", 5),
    (3, "reader2", 4),
    (4, "reader1", 5),
]


def main():
    init_db()
    conn = get_db()
    cur = conn.cursor()
    pw_hash = hash_password(DEMO_PASSWORD)
    now = datetime.now(timezone.utc).isoformat()

    for username, email, role, status in USERS:
        cur.execute("SELECT id FROM users WHERE username = ?", (username,))
        if cur.fetchone():
            continue
        cur.execute(
            """INSERT INTO users (username, email, password_hash, role, status, agreed_terms, created_at)
               VALUES (?, ?, ?, ?, ?, 1, ?)""",
            (username, email, pw_hash, role, status, now),
        )
    conn.commit()

    cur.execute("SELECT id FROM users WHERE username IN ('author1','author2') ORDER BY username")
    ids = cur.fetchall()
    author1_id = ids[0][0] if len(ids) >= 1 else None
    author2_id = ids[1][0] if len(ids) >= 2 else None
    if not author1_id or not author2_id:
        conn.close()
        print("Authors not found. Run after init_admin and ensure demo users exist.")
        return
    post_user_map = {"author1": author1_id, "author2": author2_id}
    POSTS = [(post_user_map[u], t, b, loc) for u, t, b, loc in POSTS_RAW]

    for user_id, title, body, location in POSTS:
        cur.execute("SELECT id FROM posts WHERE user_id = ? AND title = ?", (user_id, title))
        if cur.fetchone():
            continue
        cur.execute(
            """INSERT INTO posts (user_id, title, body, location, created_at, updated_at)
               VALUES (?, ?, ?, ?, ?, ?)""",
            (user_id, title, body, location, now, now),
        )
    conn.commit()

    cur.execute("SELECT id FROM users WHERE username IN ('reader1','reader2') ORDER BY username")
    reader_rows = cur.fetchall()
    reader_ids = {name: reader_rows[i][0] for i, name in enumerate(["reader1", "reader2"]) if i < len(reader_rows)}
    if len(reader_ids) < 2:
        conn.close()
        print("Readers not found.")
        return

    cur.execute("SELECT id FROM posts ORDER BY id")
    posts_by_idx = [row[0] for row in cur.fetchall()]
    if len(posts_by_idx) < 3:
        conn.close()
        print("Posts not found.")
        return

    for post_idx, username, body in COMMENTS_RAW:
        if post_idx > len(posts_by_idx) or username not in reader_ids:
            continue
        post_id = posts_by_idx[post_idx - 1]
        user_id = reader_ids[username]
        cur.execute("SELECT id FROM comments WHERE post_id = ? AND user_id = ? AND body = ?", (post_id, user_id, body))
        if cur.fetchone():
            continue
        cur.execute(
            "INSERT INTO comments (post_id, user_id, body, created_at, reported, removed) VALUES (?, ?, ?, ?, 0, 0)",
            (post_id, user_id, body, now),
        )
    conn.commit()

    all_post_ids = [row[0] for row in cur.execute("SELECT id FROM posts ORDER BY id").fetchall()]
    for post_idx, username, stars in RATINGS_RAW:
        if post_idx > len(all_post_ids) or username not in reader_ids:
            continue
        post_id = all_post_ids[post_idx - 1]
        user_id = reader_ids[username]
        cur.execute("INSERT OR IGNORE INTO ratings (post_id, user_id, stars, created_at) VALUES (?, ?, ?, ?)", (post_id, user_id, stars, now))
    conn.commit()

    conn.close()
    print("Demo data loaded. Accounts: admin/admin123, author1/author2/reader1/reader2/pending1 all use password: demo123")


if __name__ == "__main__":
    main()
