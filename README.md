# COMP 440: Online Store Database Project

### Phase 1 Video Link: https://youtu.be/wrSrChX4lJ4

## Overview

This project implements a secure, full-stack online marketplace web application for the COMP 440 Database Design course (Summer 2025). Users can currently register and log in, and in future phases of the project they will be able to post items for sale, search listings by category, and write reviews. Advanced analytics queries will allow insights into user behavior and item performance. The application emphasizes security, particularly protection against SQL injection attacks.

## Product Vision

- **Secure & Robust**: Protect all database operations using parameterized queries, input validation, and least-privilege database accounts. Passwords are hashed before storage.
- **Modern Stack**: Python 3.10 + Flask backend, MySQL database, and React 18 frontend for a responsive and maintainable codebase.
- **Phased Delivery**: Development follows three course phases, each delivering a working increment of functionality:
  1. User Authentication (registration & login)
  2. Item Posting, Searching & Reviewing
  3. Advanced Queries & Analytics

## Tech Stack

- **Backend**: Python 3.10, Flask, Flask-Login, PyMySQL
- **Frontend**: React 18 and Vite
- **Database**: MySQL 8.4 LTS
- **ORM / Querying**: SQLAlchemy for parameterized SQL queries
- **Security**: Input validation, parameterized statements, and hashed passwords using bcrypt

## Project Structure

```
/ (root)
├── backend/               # Flask application
│   ├── app.py             # Flask entry point
│   ├── models.py          # SQLAlchemy models or schema definitions
│   ├── routes/            # Blueprint modules (auth, items, reviews, analytics)
│   ├── config.py          # Configuration (env variables)
│   └──requirements.txt    # Python dependencies
├── frontend/              # React application
│   ├── public/            # Static assets
│   ├── src/               # React components, services, styles
│   ├── package.json       # JS dependencies & scripts
│   └── vite.config.js     # Proxy configuration
├── package.json           # Global dependencies & scripts
└── README.md              # This file
```

## Build

To create tables with SQLAlchemy via our app, run these commands from a terminal:
        cd backend
        flask shell
        from models import db; db.create_all()

## Team Members & Contributions

| Member            | Contributions                                          |
| ----------------- | ------------------------------------------------------ |
| **Bella Felipe**  | TBD                                                    |
| **Sarah Hussein** | TBD                                                    |
| **Christine Nguyen** | TBD                                                 |
| **Robert Ashe**   | TBD                                                    |

## License

This project is developed for academic purposes in COMP 440. All rights retained by the authors.
