# GOIT Web HW 13

Repository with two separate Python web projects:

- `task1` - FastAPI REST API for contacts
- `task2` - Django quotes application

Both projects can use one shared virtual environment from the repository root, but each project is started from its own folder.

## Project Structure

```text
goit-web-hw-13/
├── task1/                  # FastAPI contacts REST API
├── task2/                  # Django quotes project
├── docker/                 # Docker init scripts
├── docker-compose.yml      # PostgreSQL and Redis services
├── requirements.txt        # Shared dependencies
├── .env.example            # Example environment variables
└── README.md
```

## Services

Docker Compose starts:

- PostgreSQL for both projects
- Redis for `task1`

The projects use different PostgreSQL databases:

```env
POSTGRES_DB=goit_contacts_db
POSTGRES_DB_QUOTES=goit_quotes_db
```

`task1` uses `POSTGRES_DB`.

`task2` uses `POSTGRES_DB_QUOTES`.

Redis is used only by `task1` for caching and rate limiting.

## Environment Variables

Create `.env` in the repository root. Use `.env.example` as a template.

Required variables:

```env
POSTGRES_USER=your_postgres_user
POSTGRES_PASSWORD=your_postgres_password
POSTGRES_DB=goit_contacts_db
POSTGRES_DB_QUOTES=goit_quotes_db
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
REDIS_PORT=6380
REDIS_PASSWORD=your_redis_password

CLD_NAME=your_cloudinary_name
CLD_API_KEY=your_cloudinary_api_key
CLD_API_SECRET=your_cloudinary_api_secret

DEBUG=True
ALLOWED_HOSTS=127.0.0.1,localhost
```

Do not commit real secrets, passwords, API keys, or tokens.

## Install Dependencies

From the repository root:

```bash
cd goit-web-hw-13
source venv/bin/activate
python -m pip install -r requirements.txt
```

If the virtual environment does not exist yet:

```bash
python3 -m venv venv
source venv/bin/activate
python -m pip install -r requirements.txt
```

## Start Docker Services

From the repository root:

```bash
docker compose up -d
```

This starts PostgreSQL and Redis.

PostgreSQL creates the main database from `POSTGRES_DB`. The Django database from `POSTGRES_DB_QUOTES` is created by:

```text
docker/postgres/init/create-databases.sh
```

Important: Docker init scripts run only when the PostgreSQL volume is created for the first time. If the volume already existed, the script will not run again.

## Task 1 - FastAPI Contacts API

Go to the `task1` folder:

```bash
cd goit-web-hw-13/task1
```

Apply Alembic migrations:

```bash
../venv/bin/python -m alembic upgrade head
```

Run FastAPI:

```bash
../venv/bin/python -m uvicorn main:app --reload
```

Open Swagger:

```text
http://127.0.0.1:8000/docs
```

Task 1 includes:

- contacts CRUD
- authentication with JWT
- email verification
- password reset
- CORS
- Redis cache for current user
- Redis rate limiting for contacts routes
- Cloudinary avatar upload

More details:

```text
task1/README.md
```

## Task 1 Frontend

Run a simple static server:

```bash
cd goit-web-hw-13/task1/frontend
python3 -m http.server 5500 --bind 127.0.0.1
```

Open:

```text
http://127.0.0.1:5500/
```

The frontend sends API requests to:

```text
http://localhost:8000/api
```

So FastAPI must be running on port `8000`.

## Task 2 - Django Quotes App

Go to the `task2` folder:

```bash
cd goit-web-hw-13/task2
```

Apply Django migrations:

```bash
../venv/bin/python manage.py migrate
```

Create admin user:

```bash
../venv/bin/python manage.py createsuperuser
```

Run Django:

```bash
../venv/bin/python manage.py runserver
```

Open:

```text
http://127.0.0.1:8000/
```

Admin:

```text
http://127.0.0.1:8000/admin/
```

Task 2 includes:

- quotes list
- author detail pages
- tag detail pages
- user signup/login/logout
- password reset by email
- PostgreSQL settings from `.env`

More details:

```text
task2/README.md
```

## Database Commands

Check databases inside PostgreSQL:

```bash
docker exec -it goit_web_hw_13_db psql -U your_postgres_user -d goit_contacts_db -c "\l"
```

Expected databases:

```text
goit_contacts_db
goit_quotes_db
```

If `goit_quotes_db` was not created because the volume already existed, either create it manually once or recreate the volume.

Create manually without deleting data:

```bash
docker exec -it goit_web_hw_13_db createdb -U your_postgres_user goit_quotes_db
```

Recreate volume from scratch:

```bash
docker compose down -v
docker compose up -d
```

Warning: `docker compose down -v` deletes PostgreSQL data.

## Common Commands

Check installed package:

```bash
python -m pip show Django fastapi-mail pydantic-settings
```

Check FastAPI syntax example:

```bash
../venv/bin/python -m py_compile task1/src/routes/auth.py
```

Run Django checks:

```bash
cd task2
../venv/bin/python manage.py check
```

## Notes

- Run `task1` commands from the `task1` folder.
- Run `task2` commands from the `task2` folder.
- Use the shared root `venv` with `../venv/bin/python` when inside `task1` or `task2`.
- Docker creates databases, but project tables are created by migrations.
- `task1` tables are created by Alembic.
- `task2` tables are created by Django migrations.
