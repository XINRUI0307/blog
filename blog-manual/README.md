# Travel Blog — Manual Version (Flask + SQLite)

This is the **manual baseline** implementation of a role-managed travel photo blog.
It is built with **Flask + SQLite** using explicit SQL and explicit session/permission checks.

The goal of this version is **clarity and explainability** (easy to trace “what happens and why”),
so it can be compared later with an **AI-assisted version** that implements the same requirements.

---

## What You Can Do (High-level)

### User System
- Register and login
- New accounts are **pending** by default
- Admin approves users before they can fully participate

### Content System
- Contributors can create posts
- Each post can contain **multiple images**
- Server-side rendered pages (Flask templates)

### Governance / Moderation
- Approved users can comment and rate
- Users can **report** comments
- Admin can **remove** comments (soft delete)
- Removed comments are filtered out on the frontend

---

## Role & Status Model (RBAC)

This project separates **role** and **status**:

- **role** = what the user is allowed to do (capability)
  - `reader`
  - `contributor`
  - `admin`
- **status** = whether the user is eligible to use interactive features
  - `pending`
  - `approved`

Typical flow:
1. A user registers → `status = pending`
2. Admin approves them → `status = approved`
3. Only then can they comment/rate; and only contributors can create posts.

---

## Database & Data Integrity

SQLite is used as a simple baseline database.

Tables:
- `users`
- `posts`
- `post_images`
- `comments`
- `ratings`
- `sidebar_settings`

Key constraints (enforced at DB level):
- `users.username` and `users.email` are `UNIQUE`
- `ratings` has `UNIQUE(post_id, user_id)` to ensure **one rating per user per post**
- `stars` is constrained to **1–5** via `CHECK (stars >= 1 AND stars <= 5)`

Soft delete moderation:
- `comments.reported` is set to `1` when reported
- `comments.removed` is set to `1` when admin removes it
- The frontend shows only `removed = 0`

---

## Tech Stack

- Backend: **Python 3 + Flask**
- Database: **SQLite**
- Templates: Jinja2 (Flask templates)
- Image handling: Pillow (resize large uploads)
- Production (optional): Gunicorn + Nginx

---

## Project Structure (Manual Version)
