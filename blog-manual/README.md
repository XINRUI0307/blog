# README

## Overview
This project is designed to help you understand the functionalities and features available. It brings clarity to the roles and workflows involved in managing the application effectively.

## Features
- **Roles:** Different users have specific roles, enabling structured access and interaction with the system.
- **Workflow:** Streamlined processes ensure efficiency in achieving tasks and objectives.

## Project Structure
The project is organized in a way that makes it easy to understand and navigate through the various components. Key directories include:
- `/src` for source code
- `/tests` for unit tests and documentation
- `/deploy` for deployment scripts and configurations

## Requirements
To run this project effectively, ensure you have the following installed:
- Python 3.x
- Node.js
you might also need additional libraries, which can be installed via `pip install -r requirements.txt`.

## Setup (Step-by-step)
1. Clone the repository:
   ```bash
   git clone https://github.com/XINRUI0307/blog.git
   cd blog
   ```
2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
3. Run the application:
   ```bash
   python app.py
   ```

## Demo Accounts
You can use the following demo accounts to explore the application:
- **Admin:**
  - Username: admin
  - Password: password123
- **User:**
  - Username: user
  - Password: user123

## Production Notes (Gunicorn + Nginx)
For production deployment, it’s recommended to use Gunicorn as a WSGI server and Nginx as a reverse proxy:
1. Install Gunicorn:
   ```bash
   pip install gunicorn
   ```
2. Start the Gunicorn server:
   ```bash
   gunicorn -w 4 app:app
   ```
3. Configure Nginx to proxy requests:
   Edit your Nginx configuration file to include:
   ```
   server {
       listen 80;
       server_name your_domain.com;

       location / {
           proxy_pass http://127.0.0.1:8000;
           proxy_set_header Host $host;
       }
   }
   ```

For more details, refer to the `/deploy/` directory for complete deployment scripts.