"""
Attach one travel image per post (different image per post). Run after seed_demo_data.py.
Requires travel1.jpg, travel2.jpg, travel3.jpg, travel4.jpg in static/uploads/ (from Unsplash).
Run: python seed_demo_images.py
"""
import os
import shutil
from datetime import datetime, timezone
from database import get_db

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
UPLOAD_DIR = os.path.join(SCRIPT_DIR, "static", "uploads")
SOURCES = ["travel1.jpg", "travel2.jpg", "travel3.jpg", "travel4.jpg"]

def main():
    for s in SOURCES:
        if not os.path.isfile(os.path.join(UPLOAD_DIR, s)):
            print(f"Missing {s} in static/uploads/. Copy travel1-4.jpg there first.")
            return
    conn = get_db()
    cur = conn.cursor()
    cur.execute("SELECT id FROM posts ORDER BY id")
    post_ids = [row[0] for row in cur.fetchall()]
    if not post_ids:
        print("No posts found. Run seed_demo_data.py first.")
        conn.close()
        return
    now = datetime.now(timezone.utc).isoformat()
    for i, post_id in enumerate(post_ids):
        src_name = SOURCES[i % len(SOURCES)]
        src_path = os.path.join(UPLOAD_DIR, src_name)
        filename = f"{post_id}_1_travel.jpg"
        dest_path = os.path.join(UPLOAD_DIR, filename)
        shutil.copy2(src_path, dest_path)
        cur.execute("DELETE FROM post_images WHERE post_id = ?", (post_id,))
        cur.execute(
            "INSERT INTO post_images (post_id, filename, filepath, created_at) VALUES (?, ?, ?, ?)",
            (post_id, filename, filename, now),
        )
    conn.commit()
    conn.close()
    print(f"Attached different images to {len(post_ids)} post(s).")

if __name__ == "__main__":
    main()
