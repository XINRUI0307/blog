import os
from datetime import datetime
from flask import Flask, render_template, request, redirect, url_for, session, flash, abort
from werkzeug.utils import secure_filename

from config import (
    SECRET_KEY,
    UPLOAD_FOLDER,
    MAX_IMAGE_PIXELS,
    MAX_MEMBERS,
    MAX_POSTS_PER_USER,
    get_upload_folder,
    allowed_file,
)
from database import get_db, init_db
from auth_utils import hash_password, check_password, login_required, approved_user_required, contributor_required, admin_required

app = Flask(__name__)
app.secret_key = SECRET_KEY
app.config["MAX_CONTENT_LENGTH"] = 10 * 1024 * 1024

os.makedirs(get_upload_folder(), exist_ok=True)

@app.route("/")
def index():
    conn = get_db()
    cur = conn.cursor()
    cur.execute(
        """SELECT p.id, p.title, p.body, p.location, p.created_at, u.username
           FROM posts p JOIN users u ON p.user_id = u.id
           WHERE u.status = 'approved' ORDER BY p.created_at DESC LIMIT 20"""
    )
    posts = [dict(row) for row in cur.fetchall()]
    cur.execute("SELECT key, value FROM sidebar_settings")
    sidebar = {r[0]: r[1] for r in cur.fetchall()}
    conn.close()
    return render_template("index.html", posts=posts, sidebar=sidebar)

@app.route("/search")
def search():
    q = request.args.get("q", "").strip()
    loc = request.args.get("location", "").strip()
    conn = get_db()
    cur = conn.cursor()
    sql = """SELECT p.id, p.title, p.body, p.location, p.created_at, u.username
             FROM posts p JOIN users u ON p.user_id = u.id WHERE u.status = 'approved'"""
    params = []
    if q:
        sql += " AND (p.title LIKE ? OR p.body LIKE ?)"
        params.extend(["%" + q + "%", "%" + q + "%"])
    if loc:
        sql += " AND p.location LIKE ?"
        params.append("%" + loc + "%")
    sql += " ORDER BY p.created_at DESC LIMIT 50"
    cur.execute(sql, params)
    posts = [dict(row) for row in cur.fetchall()]
    cur.execute("SELECT key, value FROM sidebar_settings")
    sidebar = {r[0]: r[1] for r in cur.fetchall()}
    conn.close()
    return render_template("search.html", posts=posts, q=q, location=loc, sidebar=sidebar)

@app.route("/post/<int:post_id>")
def post_detail(post_id):
    conn = get_db()
    cur = conn.cursor()
    cur.execute(
        """SELECT p.id, p.title, p.body, p.location, p.created_at, p.user_id, u.username
           FROM posts p JOIN users u ON p.user_id = u.id WHERE p.id = ? AND u.status = 'approved'""",
        (post_id,)
    )
    row = cur.fetchone()
    if not row:
        conn.close()
        abort(404)
    post = dict(row)
    cur.execute(
        "SELECT id, filename, filepath FROM post_images WHERE post_id = ? ORDER BY id",
        (post_id,)
    )
    post["images"] = [dict(r) for r in cur.fetchall()]
    cur.execute(
        """SELECT c.id, c.body, c.created_at, c.reported, c.removed, u.username
           FROM comments c JOIN users u ON c.user_id = u.id
           WHERE c.post_id = ? AND c.removed = 0 ORDER BY c.created_at""",
        (post_id,)
    )
    post["comments"] = [dict(r) for r in cur.fetchall()]
    cur.execute(
        "SELECT COALESCE(AVG(stars), 0) as avg_stars, COUNT(*) as count FROM ratings WHERE post_id = ?",
        (post_id,)
    )
    r = cur.fetchone()
    post["avg_stars"] = round(r[0], 1) if r[0] else 0
    post["rating_count"] = r[1] or 0
    user_rating = None
    if session.get("user_id"):
        cur.execute("SELECT stars FROM ratings WHERE post_id = ? AND user_id = ?", (post_id, session["user_id"]))
        ur = cur.fetchone()
        if ur:
            user_rating = ur[0]
    post["user_rating"] = user_rating
    cur.execute("SELECT key, value FROM sidebar_settings")
    sidebar = {r[0]: r[1] for r in cur.fetchall()}
    conn.close()
    return render_template("post_detail.html", post=post, sidebar=sidebar)

@app.route("/login", methods=["GET", "POST"])
def login():
    if request.method == "GET":
        return render_template("login.html")
    username = request.form.get("username", "").strip()
    password = request.form.get("password", "")
    if not username or not password:
        flash("Username and password required.")
        return redirect(url_for("login"))
    conn = get_db()
    cur = conn.cursor()
    cur.execute("SELECT id, password_hash, role, status FROM users WHERE username = ?", (username,))
    row = cur.fetchone()
    conn.close()
    if not row or not check_password(password, row[1]):
        flash("Invalid username or password.")
        return redirect(url_for("login"))
    session["user_id"] = row[0]
    session["role"] = row[2]
    session["status"] = row[3]
    next_url = request.args.get("next") or url_for("index")
    return redirect(next_url)

@app.route("/logout")
def logout():
    session.clear()
    return redirect(url_for("index"))

@app.route("/register", methods=["GET", "POST"])
def register():
    if request.method == "GET":
        return render_template("register.html")
    username = request.form.get("username", "").strip()
    email = request.form.get("email", "").strip()
    password = request.form.get("password", "")
    agree = request.form.get("agree_terms") == "on"
    role = request.form.get("role", "reader")
    if not username or not email or not password:
        flash("All fields required.")
        return redirect(url_for("register"))
    if not agree:
        flash("You must agree to the terms and privacy policy.")
        return redirect(url_for("register"))
    if role not in ("reader", "contributor"):
        role = "reader"
    conn = get_db()
    cur = conn.cursor()
    cur.execute("SELECT COUNT(*) FROM users WHERE status = 'approved'")
    count = cur.fetchone()[0]
    if count >= MAX_MEMBERS:
        conn.close()
        flash("Membership is currently full. Try again later.")
        return redirect(url_for("register"))
    cur.execute("SELECT id FROM users WHERE username = ? OR email = ?", (username, email))
    if cur.fetchone():
        conn.close()
        flash("Username or email already registered.")
        return redirect(url_for("register"))
    pw_hash = hash_password(password)
    now = datetime.utcnow().isoformat()
    cur.execute(
        "INSERT INTO users (username, email, password_hash, role, status, agreed_terms, created_at) VALUES (?, ?, ?, ?, 'pending', 1, ?)",
        (username, email, pw_hash, role, now)
    )
    conn.commit()
    conn.close()
    flash("Registration submitted. An admin will approve your account.")
    return redirect(url_for("login"))

@app.route("/pending")
@login_required
def pending():
    return render_template("pending.html")

@app.route("/profile", methods=["GET", "POST"])
@approved_user_required
def profile():
    uid = session["user_id"]
    conn = get_db()
    cur = conn.cursor()
    if request.method == "POST":
        email = request.form.get("email", "").strip()
        if email:
            cur.execute("UPDATE users SET email = ? WHERE id = ?", (email, uid))
            conn.commit()
            flash("Profile updated.")
        conn.close()
        return redirect(url_for("profile"))
    cur.execute("SELECT username, email, role, created_at FROM users WHERE id = ?", (uid,))
    row = cur.fetchone()
    conn.close()
    if not row:
        abort(404)
    return render_template("profile.html", user=dict(zip(("username", "email", "role", "created_at"), row)))

@app.route("/my-posts")
@contributor_required
def my_posts():
    uid = session["user_id"]
    conn = get_db()
    cur = conn.cursor()
    cur.execute(
        "SELECT id, title, location, created_at FROM posts WHERE user_id = ? ORDER BY created_at DESC",
        (uid,)
    )
    posts = [dict(row) for row in cur.fetchall()]
    conn.close()
    return render_template("my_posts.html", posts=posts)

def resize_image_if_needed(filepath):
    try:
        from PIL import Image
        img = Image.open(filepath)
        w, h = img.size
        mw, mh = MAX_IMAGE_PIXELS
        if w > mw or h > mh:
            img.thumbnail((mw, mh), Image.Resampling.LANCZOS)
            img.save(filepath)
    except Exception:
        pass

@app.route("/post/new", methods=["GET", "POST"])
@contributor_required
def post_new():
    uid = session["user_id"]
    conn = get_db()
    cur = conn.cursor()
    cur.execute("SELECT COUNT(*) FROM posts WHERE user_id = ?", (uid,))
    if cur.fetchone()[0] >= MAX_POSTS_PER_USER:
        conn.close()
        flash("You have reached the maximum of %d posts." % MAX_POSTS_PER_USER)
        return redirect(url_for("my_posts"))
    conn.close()
    if request.method == "GET":
        return render_template("post_edit.html", post=None)
    title = request.form.get("title", "").strip()
    body = request.form.get("body", "").strip()
    location = request.form.get("location", "").strip()
    if not title or not body:
        flash("Title and body required.")
        return redirect(url_for("post_new"))
    now = datetime.utcnow().isoformat()
    conn = get_db()
    cur = conn.cursor()
    cur.execute(
        "INSERT INTO posts (user_id, title, body, location, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)",
        (uid, title, body, location, now, now)
    )
    post_id = cur.lastrowid
    upload_dir = get_upload_folder()
    for f in request.files.getlist("images"):
        if f and f.filename and allowed_file(f.filename):
            fn = secure_filename(f.filename)
            fn = str(post_id) + "_" + str(len(os.listdir(upload_dir)) + 1) + "_" + fn
            path = os.path.join(upload_dir, fn)
            f.save(path)
            resize_image_if_needed(path)
            cur.execute(
                "INSERT INTO post_images (post_id, filename, filepath, created_at) VALUES (?, ?, ?, ?)",
                (post_id, fn, fn, now)
            )
    conn.commit()
    conn.close()
    flash("Post created.")
    return redirect(url_for("post_detail", post_id=post_id))

@app.route("/post/<int:post_id>/edit", methods=["GET", "POST"])
@contributor_required
def post_edit(post_id):
    uid = session["user_id"]
    role = session.get("role", "")
    conn = get_db()
    cur = conn.cursor()
    cur.execute("SELECT id, user_id, title, body, location FROM posts WHERE id = ?", (post_id,))
    row = cur.fetchone()
    if not row:
        conn.close()
        abort(404)
    if row[1] != uid and role != "admin":
        conn.close()
        abort(403)
    post = dict(row)
    if request.method == "GET":
        cur.execute("SELECT id, filename, filepath FROM post_images WHERE post_id = ?", (post_id,))
        post["images"] = [dict(r) for r in cur.fetchall()]
        conn.close()
        return render_template("post_edit.html", post=post)
    title = request.form.get("title", "").strip()
    body = request.form.get("body", "").strip()
    location = request.form.get("location", "").strip()
    if not title or not body:
        flash("Title and body required.")
        return redirect(url_for("post_edit", post_id=post_id))
    now = datetime.utcnow().isoformat()
    cur.execute(
        "UPDATE posts SET title = ?, body = ?, location = ?, updated_at = ? WHERE id = ?",
        (title, body, location, now, post_id)
    )
    upload_dir = get_upload_folder()
    for f in request.files.getlist("images"):
        if f and f.filename and allowed_file(f.filename):
            fn = secure_filename(f.filename)
            fn = str(post_id) + "_" + str(len(os.listdir(upload_dir)) + 1) + "_" + fn
            path = os.path.join(upload_dir, fn)
            f.save(path)
            resize_image_if_needed(path)
            cur.execute(
                "INSERT INTO post_images (post_id, filename, filepath, created_at) VALUES (?, ?, ?, ?)",
                (post_id, fn, fn, now)
            )
    conn.commit()
    conn.close()
    flash("Post updated.")
    return redirect(url_for("post_detail", post_id=post_id))

@app.route("/post/<int:post_id>/delete", methods=["POST"])
@contributor_required
def post_delete(post_id):
    uid = session["user_id"]
    role = session.get("role", "")
    conn = get_db()
    cur = conn.cursor()
    cur.execute("SELECT user_id FROM posts WHERE id = ?", (post_id,))
    row = cur.fetchone()
    if not row:
        conn.close()
        abort(404)
    if row[0] != uid and role != "admin":
        conn.close()
        abort(403)
    cur.execute("DELETE FROM post_images WHERE post_id = ?", (post_id,))
    cur.execute("DELETE FROM comments WHERE post_id = ?", (post_id,))
    cur.execute("DELETE FROM ratings WHERE post_id = ?", (post_id,))
    cur.execute("DELETE FROM posts WHERE id = ?", (post_id,))
    conn.commit()
    conn.close()
    flash("Post deleted.")
    return redirect(url_for("my_posts") if role != "admin" else url_for("admin_posts"))

@app.route("/post/<int:post_id>/comment", methods=["POST"])
@approved_user_required
def add_comment(post_id):
    body = request.form.get("body", "").strip()
    if not body:
        flash("Comment cannot be empty.")
        return redirect(url_for("post_detail", post_id=post_id))
    conn = get_db()
    cur = conn.cursor()
    cur.execute("SELECT id FROM posts WHERE id = ?", (post_id,))
    if not cur.fetchone():
        conn.close()
        abort(404)
    now = datetime.utcnow().isoformat()
    cur.execute(
        "INSERT INTO comments (post_id, user_id, body, created_at, reported, removed) VALUES (?, ?, ?, ?, 0, 0)",
        (post_id, session["user_id"], body, now)
    )
    conn.commit()
    conn.close()
    flash("Comment added.")
    return redirect(url_for("post_detail", post_id=post_id))

@app.route("/post/<int:post_id>/rate", methods=["POST"])
@approved_user_required
def rate_post(post_id):
    try:
        stars = int(request.form.get("stars", 0))
    except ValueError:
        stars = 0
    if stars < 1 or stars > 5:
        flash("Invalid rating.")
        return redirect(url_for("post_detail", post_id=post_id))
    conn = get_db()
    cur = conn.cursor()
    cur.execute("SELECT id FROM posts WHERE id = ?", (post_id,))
    if not cur.fetchone():
        conn.close()
        abort(404)
    now = datetime.utcnow().isoformat()
    cur.execute(
        "INSERT OR REPLACE INTO ratings (post_id, user_id, stars, created_at) VALUES (?, ?, ?, ?)",
        (post_id, session["user_id"], stars, now)
    )
    conn.commit()
    conn.close()
    flash("Rating saved.")
    return redirect(url_for("post_detail", post_id=post_id))

@app.route("/comment/<int:comment_id>/report", methods=["POST"])
@approved_user_required
def report_comment(comment_id):
    conn = get_db()
    cur = conn.cursor()
    cur.execute("SELECT post_id FROM comments WHERE id = ?", (comment_id,))
    row = cur.fetchone()
    if not row:
        conn.close()
        abort(404)
    cur.execute("UPDATE comments SET reported = 1 WHERE id = ?", (comment_id,))
    conn.commit()
    conn.close()
    flash("Comment reported to admin.")
    return redirect(url_for("post_detail", post_id=row[0]))

@app.route("/admin")
@admin_required
def admin_index():
    return redirect(url_for("admin_users"))

@app.route("/admin/users")
@admin_required
def admin_users():
    conn = get_db()
    cur = conn.cursor()
    cur.execute(
        "SELECT id, username, email, role, status, created_at FROM users ORDER BY created_at DESC"
    )
    users = [dict(row) for row in cur.fetchall()]
    conn.close()
    return render_template("admin/users.html", users=users)

@app.route("/admin/users/<int:user_id>/approve", methods=["POST"])
@admin_required
def admin_approve_user(user_id):
    conn = get_db()
    cur = conn.cursor()
    cur.execute("SELECT COUNT(*) FROM users WHERE status = 'approved'")
    if cur.fetchone()[0] >= MAX_MEMBERS:
        conn.close()
        flash("Membership cap reached. Cannot approve more users.")
        return redirect(url_for("admin_users"))
    cur.execute("UPDATE users SET status = 'approved' WHERE id = ?", (user_id,))
    conn.commit()
    conn.close()
    flash("User approved.")
    return redirect(url_for("admin_users"))

@app.route("/admin/users/<int:user_id>/reject", methods=["POST"])
@admin_required
def admin_reject_user(user_id):
    conn = get_db()
    cur = conn.cursor()
    cur.execute("DELETE FROM users WHERE id = ? AND status = 'pending'", (user_id,))
    conn.commit()
    conn.close()
    flash("User rejected.")
    return redirect(url_for("admin_users"))

@app.route("/admin/posts")
@admin_required
def admin_posts():
    conn = get_db()
    cur = conn.cursor()
    cur.execute(
        """SELECT p.id, p.title, p.location, p.created_at, u.username
           FROM posts p JOIN users u ON p.user_id = u.id ORDER BY p.created_at DESC"""
    )
    posts = [dict(row) for row in cur.fetchall()]
    conn.close()
    return render_template("admin/posts.html", posts=posts)

@app.route("/admin/comments")
@admin_required
def admin_comments():
    conn = get_db()
    cur = conn.cursor()
    cur.execute(
        """SELECT c.id, c.body, c.reported, c.removed, c.created_at, p.id as post_id, p.title, u.username
           FROM comments c JOIN posts p ON c.post_id = p.id JOIN users u ON c.user_id = u.id
           ORDER BY c.reported DESC, c.created_at DESC"""
    )
    comments = [dict(row) for row in cur.fetchall()]
    conn.close()
    return render_template("admin/comments.html", comments=comments)

@app.route("/admin/comments/<int:comment_id>/remove", methods=["POST"])
@admin_required
def admin_remove_comment(comment_id):
    conn = get_db()
    cur = conn.cursor()
    cur.execute("UPDATE comments SET removed = 1 WHERE id = ?", (comment_id,))
    conn.commit()
    conn.close()
    flash("Comment removed.")
    return redirect(url_for("admin_comments"))

@app.route("/admin/sidebar", methods=["GET", "POST"])
@admin_required
def admin_sidebar():
    conn = get_db()
    cur = conn.cursor()
    if request.method == "POST":
        show_recent = "1" if request.form.get("show_recent") == "on" else "0"
        show_search = "1" if request.form.get("show_search") == "on" else "0"
        cur.execute("UPDATE sidebar_settings SET value = ? WHERE key = 'show_recent'", (show_recent,))
        cur.execute("UPDATE sidebar_settings SET value = ? WHERE key = 'show_search'", (show_search,))
        conn.commit()
        flash("Sidebar updated.")
        conn.close()
        return redirect(url_for("admin_sidebar"))
    cur.execute("SELECT key, value FROM sidebar_settings")
    sidebar = {r[0]: r[1] for r in cur.fetchall()}
    conn.close()
    return render_template("admin/sidebar.html", sidebar=sidebar)

@app.route("/terms")
def terms():
    return render_template("terms.html")

@app.route("/privacy")
def privacy():
    return render_template("privacy.html")

if __name__ == "__main__":
    init_db()
    app.run(debug=True, port=5000)
