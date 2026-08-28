# goit-web-hw-12

Contacts REST API built with FastAPI, SQLAlchemy, PostgreSQL, and Alembic.

## Features

- User registration and authentication.
- Password hashing with bcrypt.
- JWT authorization with access and refresh tokens.
- Role-based access for selected routes.
- Create, read, update, and delete contacts.
- Search contacts by name, surname, or email.
- Get contacts with birthdays in the next 7 days.
- PostgreSQL database connection.
- Alembic migrations.
- Swagger documentation.

## Technologies

- Python
- FastAPI
- SQLAlchemy
- PostgreSQL
- Alembic
- Docker Compose
- Pydantic
- Passlib
- python-jose

## Project Structure

```text
.
├── main.py
├── docker-compose.yml
├── alembic.ini
├── requirements.txt
├── frontend/
│   ├── index.html
│   └── script.js
├── migrations/
│   ├── env.py
│   └── versions/
└── src/
    ├── conf/
    │   └── config.py
    ├── database/
    │   └── db.py
    ├── entity/
    │   └── models.py
    ├── repository/
    │   ├── contacts.py
    │   └── users.py
    ├── routes/
    │   ├── auth.py
    │   └── contacts.py
    ├── services/
    │   ├── auth.py
    │   └── roles.py
    └── schemas/
        ├── contact.py
        └── user.py
```

## Environment Variables

Create a `.env` file in the project root using `.env.example` as a template:

```env
POSTGRES_USER=your_user
POSTGRES_PASSWORD=your_password
POSTGRES_DB=your_database
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
SECRET_KEY=your_secret_key
ALGORITHM=HS256
```

When running PostgreSQL through Docker Compose, these variables are used by the `db` service.

## Installation

Create and activate a virtual environment:

```bash
python3 -m venv venv
source venv/bin/activate
```

Install dependencies:

```bash
python -m pip install -r requirements.txt
```

## Run PostgreSQL

Start the database container:

```bash
docker compose up -d
```

Check running containers:

```bash
docker ps
```

## Migrations

Create a new migration after changing SQLAlchemy models:

```bash
alembic revision --autogenerate -m "Add user"
```

Apply migrations:

```bash
alembic upgrade head
```

Check current migration:

```bash
alembic current
```

## Run Application

Start the FastAPI server:

```bash
uvicorn main:app --reload
```

Application URLs:

```text
http://127.0.0.1:8000
http://127.0.0.1:8000/docs
http://127.0.0.1:8000/redoc
```

## Run Frontend

The project includes a simple frontend for working with contacts:

```text
frontend/index.html
```

First, start the FastAPI backend:

```bash
uvicorn main:app --reload
```

Then open `frontend/index.html` in a browser.

The frontend sends requests to:

```text
http://localhost:8000/api/contacts/
```

The `/api/contacts/` route is protected. Use Swagger authorization or send an `Authorization: Bearer <access_token>` header when calling protected routes.

## API Endpoints

### Health Check

```http
GET /api/healthchecker
```

### Auth

Register a new user:

```http
POST /api/auth/signup
```

Request body:

```json
{
  "username": "natalia",
  "email": "natalia@example.com",
  "password": "123456"
}
```

Password length must be from 6 to 8 characters. If a user with the same email already exists, the server returns `409 Conflict`.

Successful signup returns `201 Created` and user data:

```json
{
  "id": 1,
  "username": "natalia",
  "email": "natalia@example.com",
  "role": "user"
}
```

Login:

```http
POST /api/auth/login
```

The login route uses `OAuth2PasswordRequestForm`, so Swagger shows the fields as `username` and `password`. Enter the user's email in the `username` field:

```text
username: natalia@example.com
password: 123456
```

If the user does not exist or the password is incorrect, the server returns `401 Unauthorized`.

Successful login returns JWT tokens:

```json
{
  "access_token": "...",
  "refresh_token": "...",
  "token_type": "bearer"
}
```

Refresh tokens:

```http
GET /api/auth/refresh_token
```

This route expects the `refresh_token` in the `Authorization` header:

```http
Authorization: Bearer <refresh_token>
```

In Swagger, use the `Authorize` button and paste only the token value.

### Contacts

Get current user's contacts. Requires `access_token`:

```http
GET /api/contacts/
```

Get current user's contacts with pagination. Requires `access_token`:

```http
GET /api/contacts/?limit=10&offset=0
```

Search current user's contacts by name, surname, or email. Requires `access_token`:

```http
GET /api/contacts/?query=ivan
GET /api/contacts/?query=petrenko
GET /api/contacts/?query=gmail.com
```

Get all contacts without authentication:

```http
GET /api/contacts/all?limit=10&offset=0
GET /api/contacts/all?limit=10&offset=0&query=ivan
```

Get current user's contacts with birthdays in the next 7 days. Requires `access_token` and role `admin` or `moderator`:

```http
GET /api/contacts/birthdays
```

Get one contact by ID. Requires `access_token`:

```http
GET /api/contacts/{contact_id}
```

Create a contact. Requires `access_token` and returns `201 Created`:

```http
POST /api/contacts/
```

Request body:

```json
{
  "name": "Ivan",
  "surname": "Petrenko",
  "email": "ivan@example.com",
  "phone": "+380501234567",
  "birthday": "1995-08-13",
  "info": "Friend from university"
}
```

The `info` field is optional:

```json
{
  "name": "Ivan",
  "surname": "Petrenko",
  "email": "ivan@example.com",
  "phone": "+380501234567",
  "birthday": "1995-08-13"
}
```

Update a contact. Requires `access_token`:

```http
PUT /api/contacts/{contact_id}
```

Delete a contact. Requires `access_token`:

```http
DELETE /api/contacts/{contact_id}
```

### Authorization In Swagger

For protected contact routes, first call `POST /api/auth/login`, copy `access_token`, click `Authorize`, and paste only the token value.

For `GET /api/auth/refresh_token`, use `refresh_token` instead of `access_token`.

## Useful Commands

Stop Docker containers:

```bash
docker compose down
```



