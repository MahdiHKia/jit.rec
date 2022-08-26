FROM python:3.10-slim as base

WORKDIR /app

RUN pip install --no-cache-dir -U pip==22.1.2 setuptools==62.6.0 poetry==1.1.13

COPY pyproject.toml poetry.lock ./

RUN poetry config virtualenvs.create false \
  && poetry install --no-dev --no-interaction --no-ansi

COPY . .
RUN python manage.py collectstatic --noinput
