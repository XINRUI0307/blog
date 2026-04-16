# Travel Blog — Manual Baseline (Flask + SQLite)

This directory contains the **manual baseline** implementation of a role-managed travel photo blog.

The manual version is intentionally written with:
- **Flask + SQLite**
- **explicit SQL** (no ORM abstractions)
- **explicit session + permission checks** (easy to trace)

The goal is **clarity and explainability**—so it can later be compared against an **AI-assisted version** that implements the same requirements.

---

## 1) Scope & Requirements (What This Version Covers)

### User system
- User registration and login
- New accounts are created with `status = pending`
- An admin must approve users (`status = approved`) before they can use interactive features

### Content system
- Contributors can create posts
- Each post can contain **multiple images**
- Server-side rendered pages (Flask templates)

### Governance / moderation
- Approved users can comment and rate
- Users can report comments
- Admin can remove comments (**soft delete**)
- Removed comments are filtered out in the UI

### Non-goals (intentional omissions)
This manual baseline prioritizes traceability over completeness. Common features that are *out of scope* may include:
- OAuth / third-party auth providers
- Rich text editor / markdown editing UI
- Full-text search
- Distributed storage (S3, CDN, etc.)
- Complex async processing / background job queues

(Adjust this list to match your repo reality.)

---

## 2) Role & Status Model (RBAC)

This project separates **role** and **status**:

- **role** = capabilities (what a user is allowed to do)
  - `reader`
  - `contributor`
  - `admin`
- **status** = eligibility gate for interactive features
  - `pending`
  - `approved`

Typical flow:
1. A user registers → `status = pending`
2. Admin approves them → `status = approved`
3. Only `approved` users can comment/rate; only `contributor` users can create posts.

This split is deliberate: it makes the “approved by admin” requirement explicit and independent from long-term capability assignment.

---

## 3) Core Flows (Behavioral Summary)

### Registration → approval
1. User registers
2. Account is created as `pending`
3. Admin approves the user
4. User gains access to interactive features

### Posting (contributors)
1. Authenticated contributor creates a post
2. Uploads one or more images
3. Images are processed server-side (e.g., resized) and associated with the post

### Commenting / reporting / removal
1. Approved user posts a comment
2. Another user can report the comment
3. Admin can remove the comment (soft delete)
4. Frontend hides removed comments (`removed = 0` only)

---

## 4) Database Design & Data Integrity

SQLite is used as a simple baseline database.

### Tables
- `users`
- `posts`
- `post_images`
- `comments`
- `ratings`
- `sidebar_settings`

### Key constraints (DB-enforced)
- `users.username` is `UNIQUE`
- `users.email` is `UNIQUE`
- `ratings` has `UNIQUE(post_id, user_id)` to ensure **one rating per user per post**
- `stars` is constrained to **1–5** via:
  - `CHECK (stars >= 1 AND stars <= 5)`

### Moderation fields (soft delete + reporting)
- `comments.reported = 1` when reported
- `comments.removed = 1` when removed by admin
- The UI filters out removed comments (`removed = 0`)

Design note: enforcing invariants at the database layer makes the behavior predictable and reduces reliance on application-layer checks.

---

## 5) Tech Stack (Baseline Choices)

- Backend: **Python 3 + Flask**
- Database: **SQLite**
- Templates: **Jinja2**
- Image handling: **Pillow** (resize large uploads)
- Production (optional): **Gunicorn + Nginx**

---

## 6) Project Structure (Manual Version)

> Update the paths below to match the repo exactly.

Typical layout expectations for this version:
- `app.py` (or equivalent): Flask app entry point / route registration
- `templates/`: Jinja templates (server-rendered pages)
- `static/`: CSS/JS assets and possibly uploaded content (depending on implementation)
- `schema.sql` / init scripts: database schema and initialization logic

If you paste a real `tree` output here, reviewers will understand the codebase much faster.

---

## 7) How to Run (Minimal, for Reviewers)

Clone the repository:

```bash
git clone https://github.com/XINRUI0307/blog.git
cd blog
Create and activate a virtual environment:

bash
python -m venv .venv
# Windows:
#   .venv\Scripts\activate
# macOS/Linux:
#   source .venv/bin/activate
Install dependencies:

bash
pip install -r requirements.txt
Run the application:

bash
python app.py
If your real entry point differs (e.g., flask --app ... run), update this section to match the repo.

8) Demo / Test Accounts (Recommended Approach)
If the project includes demo accounts, prefer documenting how they are created (seed script, fixtures, admin bootstrap flow) rather than committing real passwords in a public README.

If you need placeholders:

Admin: admin / <set-in-local-env>
User: user / <set-in-local-env>
9) Production Notes (Optional: Gunicorn + Nginx)
Install Gunicorn:

bash
pip install gunicorn
Run (example):

bash
gunicorn -w 4 -b 127.0.0.1:8000 app:app
Nginx (example):

Nginx
server {
    listen 80;
    server_name your_domain.com;

    location / {
        proxy_pass http://127.0.0.1:8000;

        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
10) Comparison Plan: Manual vs AI-assisted Version
This manual baseline is intended to be compared to an AI-assisted implementation along dimensions such as:

Traceability: can a reviewer follow auth/permission decisions end-to-end?
Correctness: are DB invariants enforced consistently?
Security posture: where and how are permission checks applied?
Maintainability: duplication vs abstraction, code organization
Testability: ease of writing deterministic tests
Operational readiness: deployability and configuration clarity
