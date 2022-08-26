FROM node:16.14.0-slim as builder

WORKDIR /app

ADD package.json yarn.lock ./
RUN yarn install

COPY . .
RUN yarn build
RUN rm -rf /app/static/js/*.map

FROM nginx:1.23.1-alpine
WORKDIR /app

COPY --from=builder /app/build/ /var/www/
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY env_config_template.js generate_env_config.sh ./
RUN chmod +x "/app/generate_env_config.sh"

ENTRYPOINT [ "generate_env_config.sh", "-t", "env_config_template.js", "-e", "/var/www/env.js" ]
