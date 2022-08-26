JIT.REC

- [Introduction](#introduction)
- [Deployment](#deployment)
  * [Single Container Deployment](#single-container-deployment)
    + [1. Pre Build Image From Dockerhub](#1-pre-build-image-from-dockerhub)
    + [2. Build Latest Image Locally](#2-build-latest-image-locally)
  * [Multi Container Deployment (Scalable)](#multi-container-deployment--scalable-)
- [Development](#development)
- [Usage](#usage)
  * [Basic](#basic)
  * [Advanced](#advanced)
- [Environment Variables](#environment-variables)
  * [COMMON ENVs](#common-envs)
    + [SSL_ENABLED](#ssl-enabled)
    + [BACKEND_HOST](#backend-host)
    + [FRONTEND_HOST](#frontend-host)
    + [RTMP_HOST](#rtmp-host)
    + [RTMP_PORT](#rtmp-port)
    + [RTMP_WORKERS](#rtmp-workers)
  * [DockerCompose ENVs](#dockercompose-envs)
    + [FRONTEND_DOCKER_FILE](#frontend-docker-file)
  * [Backend ENVs](#backend-envs)
    + [SECRET_KEY](#secret-key)
    + [DEFAULT_DATABASE_URL](#default-database-url)
    + [DEBUG](#debug)
    + [RECORD_TOKEN_TTL_MINUTES](#record-token-ttl-minutes)
  * [NGINX ENVs](#nginx-envs)
    + [BACKEND_INTERNAL_HOSTNAME](#backend-internal-hostname)
    + [FRONTEND_INTERNAL_HOSTNAME](#frontend-internal-hostname)
    + [RTMP_INTERNAL_HOSTNAME](#rtmp-internal-hostname)

# Introduction
Jit.Rec is a video recorder using RTMP protocol built using Python and Django for the backend and React.js for the frontend; You can use this project to record and manage RTMP video streams ( like jit.si meetings )

# Deployment

## Single Container Deployment
Fast deploy for testing and small use-cases

### 1. Pre Build Image From Dockerhub
All releases of jit.rec are available in [DockerHub](https://hub.docker.com/r/mahdihkia/jit_rec).
Follow these steps to deploy the project on your machine

1. Create a folder of your choice and `cd` to it
2. Create a file named `prod.env` and copy [single-docker.example.env](env/single-docker.example.env) contents into it
3. Read [Environment Variables](#environment-variables) and modify needed variables inside `prod.env`
4. Make a directory named data.
5. Run this command `docker run --rm --name jitrec --env-file prod.env -p 80:80 -p 1935:1935 -v $PWD/data:/app/backend/data mahdihkia/jit_rec:latest`
6. Visit http://rec.lcoalhost

### 2. Build Latest Image Locally

1. Clone project and `cd` to it
2. Create a file named `prod.env` and copy [single-docker.example.env](env/single-docker.example.env) contents into it
3. Read [Environment Variables](#environment-variables) and modify needed variables inside `prod.env`
4. Make a directory named data.
5. Run `docker build . -t`jit_rec_local
6. Run this command `docker run --rm --name jitrec --env-file prod.env -p 80:80 -p 1935:1935 -v $PWD/data:/app/backend/data jit_rec_local:latest`
5. Visit http://rec.lcoalhost

## Multi Container Deployment (Scalable)
You can follow these steps to deploy the project using multiple containers. 
Also, you can inspire your container-orchestration-system config files from dockercompose.yaml file
1. Clone project and `cd` to it
2. Create a file named `prod.env` and copy [prod.example.env](env/prod.example.env) contents into it
3. Read [Environment Variables](#environment-variables) and modify needed variables inside `prod.env`
4. Run `docker compose --env-file prod.env up -d`
5. Visit http://rec.lcoalhost

# Development
You can use this command to boot up all needed containers for development.
```
docker compose --env-file env/dev.env up -d
```
# Usage

## Basic
1. Login as admin using folloing credentioals
	+ default_admin_email : `admin@jit.rec`
	+ default_admin_password : `adminpassword`
2. Create a recording
3. Click on Copy URL button
4. For recording a meet.jit.si meeting, go to "More Action">"Start Live Stream" and paste copied URL from step 3
5. For recording a stream from ffmpeg, run `ffmpeg -i {video_file_path} -c:v copy -c:a copy -f flv {url_copied_from_step_3}`

## Advanced
1. visit `http://{backend_host}/admin` to use Django Admin
2. visit `http://{backend_host}/api/schema/swagger-ui/` to see APIs swagger docs
3. visit `http://{backend_host}/api/schema/` to see APIs swagger yaml

# Environment Variables
## COMMON ENVs
### SSL_ENABLED
Set this `true` if project is behind https ingress. default is `false`
### BACKEND_HOST
Set a subdomain of you main domain in order to cookies work properly. default is `api.rec.localhost`
### FRONTEND_HOST
Set main domain you want to host jit.rec on it. default is `rec.localhost`
### RTMP_HOST
Set domain you want to host rtmp recorder service on it. default is `rtmp.rec.localhost`
### RTMP_PORT
Set post you want to host rtmp recorder service on it. default is `1935`
### RTMP_WORKERS
RTMP service can run using multiple workers. The recommended value is CPU cores count. default is 2

## DockerCompose ENVs
### FRONTEND_DOCKER_FILE
Frontend production Dockerfile is different from the development Dockerfile. Use `Dockerfile` for production and `Dockerfile.dev` for development environment 

## Backend ENVs
### SECRET_KEY
This SECRET_KEY is used for password hashing and JWT secret. Set a strong value for it and keep it safe. default is an insecure one
### DEFAULT_DATABASE_URL
This value supports all databases that Django supports
### DEBUG
Use `false` for production and `true` for development environment. default is `true` 
### RECORD_TOKEN_TTL_MINUTES
RTMP Recording URLs have an expiration time, this variable specifics after how many minutes URLs must expire. default is `1440`


## NGINX ENVs
### BACKEND_INTERNAL_HOSTNAME
Cluster address for backend container
### FRONTEND_INTERNAL_HOSTNAME
Cluster address for frontend container
### RTMP_INTERNAL_HOSTNAME
Cluster address for rtmp_service container
