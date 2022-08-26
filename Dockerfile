FROM nginx:1.23.1-alpine as base

COPY --from=python:3.10-alpine /usr/ /usr/
ENV PATH /usr/local/bin:$PATH
RUN apk update && apk add --no-cache gcc musl-dev linux-headers bash
RUN pip install --no-cache-dir -U pip==22.1.2 setuptools==62.6.0 poetry==1.1.13


FROM node:16.14.0-alpine as frontend_builder
WORKDIR /app

# ARG BACKEND_HOST
# ARG SSL_ENABLED
# ENV REACT_APP_BACKEND_HOST $BACKEND_HOST
# ENV REACT_APP_SSL_ENABLED $SSL_ENABLED

ADD frontend/package.json frontend/yarn.lock ./
RUN yarn install

COPY frontend .
RUN yarn build
RUN rm -rf /app/static/js/*.map


FROM base
WORKDIR /app

WORKDIR /app/backend

COPY backend/pyproject.toml backend/poetry.lock ./
RUN poetry config virtualenvs.create false \
  && poetry install --no-dev --no-interaction --no-ansi

COPY --from=frontend_builder /app/build/ /app/frontend/
COPY nginx/templates /etc/nginx/templates
COPY nginx/nginx.conf /etc/nginx/nginx.conf
COPY nginx/http-single-docker.conf /etc/nginx/http.conf
COPY ./frontend/env_config_template.js ./frontend/generate_env_config.sh /docker-entrypoint.d/
COPY backend .

RUN python manage.py collectstatic --noinput

COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.d/*
ENTRYPOINT ["/docker-entrypoint.sh"]

CMD ["python", "run_single_docker.py"]
