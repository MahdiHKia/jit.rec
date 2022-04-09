FROM python:3.10-slim as base

WORKDIR /app

FROM base as builder
RUN pip install --no-cache-dir poetry==1.1.13
COPY pyproject.toml poetry.lock ./
RUN poetry export -f requirements.txt --output requirements.txt


FROM base as final
COPY --from=builder /app/requirements.txt ./requirements.txt
RUN pip install --no-cache-dir -U pip==22.1.2 setuptools==62.6.0
RUN pip install --no-cache-dir -r requirements.txt

COPY . .
RUN python manage.py collectstatic --noinput
