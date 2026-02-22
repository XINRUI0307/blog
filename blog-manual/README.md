# Flask + SQLite Travel Photo Blog

## Overview
This project is a travel photo blog built using Flask and SQLite. It allows users to share and organize travel photos, providing an interactive platform for travel enthusiasts.

## Features
- **User Roles**: Admin and regular users with different permissions.
- **Status Indicators**: Indicate image upload status and user activities.

## Tech Stack
- **Backend**: Flask
- **Database**: SQLite
- **Web Server**: Gunicorn for serving the app; Nginx for managing client requests.

## Project Structure
- `app.py`: Main application file.
- `database.py`: Handles database connections and queries.
- `auth_utils.py`: Authentication-related functionalities.
- `config.py`: Configuration settings for the application.
- `templates/`: Contains HTML templates for rendering views.
- `static/uploads`: Directory for storing uploaded images.
- `deploy/`: Configuration and scripts for deployment.

## Local Setup Steps
1. Navigate to the project directory: `cd blog-manual`
2. Create a virtual environment: `venv .venv`
3. Activate the virtual environment:
   - On Windows: `.venv\Scripts\activate`
   - On macOS/Linux: `source .venv/bin/activate`
4. Install dependencies: `pip install -r requirements.txt`
5. Initialize admin user: `python init_admin.py`
6. Run the application: `python app.py`

## Default Admin Credentials
- **Username**: admin
- **Password**: admin123

## Optional Demo Data Seed Scripts
- `seed_demo_data.py`: Script to populate the blog with demo data.
- `seed_demo_images.py`: Script to add demo images into the blog.

## Production Notes
- Refer to `deploy/nginx-manual.conf` for Nginx configuration.
- Use `deploy/run.sh` to start the application with Gunicorn and Nginx.