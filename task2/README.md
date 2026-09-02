# Task 2 - Django Quotes

Django application for storing and browsing quotes, authors, and tags.

The project lives in the `task2` folder and is independent from `task1`. It uses its own PostgreSQL database name from `POSTGRES_DB_QUOTES`, while `task1` can continue using `POSTGRES_DB`.

## Features

- User registration, login, and logout
- Password reset by email
- Quotes list with pagination
- Author detail pages
- Tag detail pages
- Add author for authenticated users
- Add quote for authenticated users
- Environment variables loaded from `.env` in `settings.py`
- PostgreSQL database connection through environment variables

## Project Structure

```text
task2/
├── manage.py
├── quotes_project/
│   ├── settings.py
│   ├── urls.py
│   ├── asgi.py
│   └── wsgi.py
├── quotes/
│   ├── models.py
│   ├── views.py
│   ├── urls.py
│   ├── forms.py
│   ├── templates/
│   └── static/
├── users/
│   ├── views.py
│   ├── urls.py
│   ├── forms.py
│   └── templates/
└── utils/
    ├── authors.json
    └── qoutes.json
```

## Environment Variables

Create or update `.env` in the project root:

```env
SECRET_KEY=your-django-secret-key
DEBUG=True
ALLOWED_HOSTS=127.0.0.1,localhost

POSTGRES_USER=your_postgres_user
POSTGRES_PASSWORD=your_postgres_password
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_DB_QUOTES=goit_quotes_db

MAIL_SERVER=smtp.meta.ua
MAIL_PORT=465
MAIL_USERNAME=your_email@meta.ua
MAIL_PASSWORD=your_email_password_or_app_password
MAIL_FROM=your_email@meta.ua
```

Do not commit real passwords, tokens, or API keys.

`task2/quotes_project/settings.py` loads variables from:

- `task2/.env`
- root `.env`

So you can keep one shared root `.env` for both tasks if it is more convenient.

## Install Dependencies

From the repository root:

```bash
cd /goit-web-hw-13
source venv/bin/activate
python -m pip install -r requirements.txt
```

If Django or dotenv is missing, install the dependencies into the active shared `venv`, not into system Python.

## PostgreSQL With Docker Compose

Start PostgreSQL from the repository root:

```bash
docker compose up -d
```

If `POSTGRES_DB_QUOTES` does not exist yet, create it inside the running PostgreSQL container. Use the same user as `POSTGRES_USER` from `.env`:

```bash
docker exec -it goit_web_hw_13_db createdb -U your_postgres_user goit_quotes_db
```

If the database already exists, this command is not needed.

## Run Migrations

Run commands from the `task2` folder:

```bash
cd /goit-web-hw-13/task2
../venv/bin/python manage.py migrate
```

## Create Admin User

```bash
cd /goit-web-hw-13/task2
../venv/bin/python manage.py createsuperuser
```

Then open:

```text
http://127.0.0.1:8000/admin/
```

## Run Server

```bash
cd /goit-web-hw-13/task2
../venv/bin/python manage.py runserver
```

Open the app:

```text
http://127.0.0.1:8000/
```

## Routes

Main app:

```text
GET /                         Quotes list
GET /page/<page>/             Quotes pagination
GET /author/<author_id>/      Author detail
GET /tag/<tag_name>/          Quotes by tag
GET,POST /author/             Add author, login required
GET,POST /quote/              Add quote, login required
```

Users:

```text
GET,POST /users/signup/                                Registration
GET,POST /users/login/                                 Login
GET /users/logout/                                     Logout
GET,POST /users/reset-password/                        Request password reset email
GET /users/reset-password/done/                        Password reset email sent page
GET,POST /users/reset-password/confirm/<uidb64>/<token>/  Set new password
GET /users/reset-password/complete/                    Password reset complete page
```

Admin:

```text
GET /admin/
```

## Password Reset

Password reset uses Django built-in password reset views and SMTP settings from `.env`.

For meta.ua, use:

```env
MAIL_SERVER=smtp.meta.ua
MAIL_PORT=465
MAIL_USERNAME=your_email@meta.ua
MAIL_PASSWORD=your_email_password_or_app_password
MAIL_FROM=your_email@meta.ua
```

The reset link is available on the login page:

```text
Forgot Password?
```

After entering an email, Django sends a password reset link. The user opens the link, enters a new password, and then logs in with the new password.

## Load Initial Quotes

The project has JSON files in `task2/utils/` and custom management commands in `quotes/management/commands/`.

To load quotes, run:

```bash
cd /goit-web-hw-13/task2
../venv/bin/python manage.py load_quotes
```

There is also a command:

```bash
../venv/bin/python manage.py migrate_mongo
```

Use it only if your MongoDB migration settings/data are configured.

## Common Issues

### `ModuleNotFoundError: No module named 'django'`

The wrong Python interpreter is active. Use the shared root virtual environment:

```bash
cd /goit-web-hw-13
source venv/bin/activate
cd task2
../venv/bin/python manage.py runserver
```

### `ModuleNotFoundError: No module named 'dotenv'`

Install project dependencies into the active `venv`:

```bash
python -m pip install -r requirements.txt
```

### `database "goit_quotes_db" does not exist`

Create the task2 database:

```bash
docker exec -it goit_web_hw_13_db createdb -U your_postgres_user goit_quotes_db
```

Make sure `.env` contains:

```env
POSTGRES_DB_QUOTES=goit_quotes_db
```

### `connection refused` for PostgreSQL

PostgreSQL is not running or the port is different.

Start Docker services:

```bash
docker compose up -d
```

Then check containers:

```bash
docker ps
```

## Quick Start

```bash
cd /goit-web-hw-13
source venv/bin/activate
docker compose up -d

cd task2
../venv/bin/python manage.py migrate
../venv/bin/python manage.py runserver
```

Open:

```text
http://127.0.0.1:8000/
```
