# Task 1 - Contacts REST API

FastAPI REST API for contacts with authentication, email verification, password reset, Redis caching/rate limiting, and Cloudinary avatar upload.

## Features

- User signup and login with JWT access/refresh tokens
- Email confirmation for registered users
- Password reset by email token
- Protected contacts CRUD
- Search contacts by name, surname, or email
- Birthdays in the next 7 days
- CORS enabled
- Redis cache for current authenticated user
- Redis rate limiting for contacts routes
- Cloudinary avatar update
- Simple frontend client

## Project Structure

```text
task1/
├── main.py
├── alembic.ini
├── frontend/
│   ├── index.html
│   ├── script.js
│   └── styles.css
├── migrations/
└── src/
    ├── conf/
    ├── database/
    ├── entity/
    ├── repository/
    ├── routes/
    ├── schemas/
    └── services/
```

## Environment Variables

Create `.env` in the project root:

```text
goit-web-hw-13/.env
```

Example:

```env
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=contacts_db
POSTGRES_HOST=localhost
POSTGRES_PORT=5432

SECRET_KEY=your_secret_key
ALGORITHM=HS256

MAIL_USERNAME=your_email@example.com
MAIL_PASSWORD=your_email_password
MAIL_FROM=your_email@example.com
MAIL_PORT=465
MAIL_SERVER=smtp.example.com
MAIL_FROM_NAME=Contacts App

REDIS_DOMAIN=localhost
REDIS_PORT=6390
REDIS_PASSWORD=your_redis_password

CLD_NAME=your_cloudinary_cloud_name
CLD_API_KEY=your_cloudinary_api_key
CLD_API_SECRET=your_cloudinary_api_secret
```

Do not commit real secrets to Git.

## Install Dependencies

From the repository root:

```bash
python3 -m venv venv
source venv/bin/activate
python -m pip install -r requirements.txt
```

## Run Services

PostgreSQL and Redis are started from the root `docker-compose.yml`:

```bash
cd /goit-web-hw-13
docker compose up -d
```

Check Redis:

```bash
docker exec -it goit_web_hw_13_redis redis-cli -a your_redis_password ping
```

Expected:

```text
PONG
```

## Run Migrations

From `task1`:

```bash
cd /goit-web-hw-13/task1
../venv/bin/python -m alembic upgrade head
```

Create a new migration:

```bash
../venv/bin/python -m alembic revision --autogenerate -m "Migration name"
```

## Run Backend

From `task1`:

```bash
cd /goit-web-hw-13/task1
../venv/bin/python -m uvicorn main:app --reload
```

API docs:

```text
http://127.0.0.1:8000/docs
```

## Run Frontend

In a second terminal:

```bash
cd /goit-web-hw-13/task1/frontend
python3 -m http.server 5500 --bind 127.0.0.1
```

Open:

```text
http://127.0.0.1:5500
```

The frontend sends API requests to:

```text
http://localhost:8000/api
```

## Main API Routes

Auth:

```text
POST /api/auth/signup
POST /api/auth/login
GET  /api/auth/refresh_token
GET  /api/auth/confirmed_email/{token}
POST /api/auth/request_email
POST /api/auth/request_password_reset
POST /api/auth/reset_password
```

Users:

```text
GET   /api/users/me
PATCH /api/users/avatar
```

Contacts:

```text
GET    /api/contacts/
GET    /api/contacts/{contact_id}
GET    /api/contacts/birthdays
POST   /api/contacts/
PUT    /api/contacts/{contact_id}
DELETE /api/contacts/{contact_id}
```

## Verification Flow

1. Register with `POST /api/auth/signup`.
2. Open the email confirmation link.
3. Login with `POST /api/auth/login`.
4. Use the access token for protected routes.

## Password Reset Flow

1. Request reset email with `POST /api/auth/request_password_reset`.
2. Copy the reset token from the email link.
3. Send token and new password to `POST /api/auth/reset_password`.
4. Login with the new password.

## Avatar Upload

1. Login and authorize with Bearer token.
2. Send image file to `PATCH /api/users/avatar`.
3. The image is uploaded to Cloudinary.
4. The Cloudinary URL is saved in `user.avatar`.

## Redis Cache And Rate Limit

Current user cache is created when protected routes call:

```python
auth_service.get_current_user
```

Rate limiting is applied to contact routes. If the limit is exceeded, API returns:

```text
429 Too Many Requests
```
