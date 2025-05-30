# go build
FROM golang:1.24-bookworm AS go-builder

# we get our main module as a binary from the source
WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -o /repetiswole

# build using node and vite
FROM node:23.11.0-slim AS frontend-builder

# change to our main working directory
WORKDIR /app/frontend

# copy our frontend react app to the container
COPY ./frontend/ .

# produces our static HTML 'dist' folder, redirected to: /app/frontend
RUN npm i && npm run build

# combine both go-builder and frontend
FROM debian:stable-slim as package-builder

# switch into our applications folder
WORKDIR /app
RUN mkdir -p frontend/dist

COPY --from=go-builder \
      # copy our binary over
      /repetiswole \
      .

COPY --from=frontend-builder \
      # copy over our static html files
      /app/frontend/dist \
      ./frontend/dist

RUN apt-get update && apt-get install -y ca-certificates

# # get the environment variables we need during our application
# railway env variables
ARG RAILWAY_PUBLIC_DOMAIN
ARG RAILWAY_PRIVATE_DOMAIN
ARG RAILWAY_PROJECT_NAME
ARG RAILWAY_ENVIRONMENT_NAME
ARG RAILWAY_SERVICE_NAME
ARG RAILWAY_PROJECT_ID
ARG RAILWAY_ENVIRONMENT_ID
ARG RAILWAY_SERVICE_ID

# app env variables
ARG GOOGLE_APPLICATION_CREDENTIALS_JSON_B64
ARG GOOGLE_FIREBASE_API_KEY
ARG MODE

ENV   GOOGLE_FIREBASE_API_KEY=$GOOGLE_FIREBASE_API_KEY \
      GOOGLE_APPLICATION_CREDENTIALS_JSON_B64=$GOOGLE_APPLICATION_CREDENTIALS_JSON_B64 \
      MODE=$MODE \
      RAILWAY_PUBLIC_DOMAIN=$RAILWAY_PUBLIC_DOMAIN \
      RAILWAY_PRIVATE_DOMAIN=$RAILWAY_PRIVATE_DOMAIN \
      RAILWAY_PROJECT_NAME=$RAILWAY_PROJECT_NAME \
      RAILWAY_ENVIRONMENT_NAME=$RAILWAY_ENVIRONMENT_NAME \
      RAILWAY_SERVICE_NAME=$RAILWAY_SERVICE_NAME \
      RAILWAY_PROJECT_ID=$RAILWAY_PROJECT_ID \
      RAILWAY_ENVIRONMENT_ID=$RAILWAY_ENVIRONMENT_ID \
      RAILWAY_SERVICE_ID=$RAILWAY_SERVICE_ID

RUN echo $GOOGLE_APPLICATION_CREDENTIALS_JSON_B64 | base64 -d > ./firebase-config.json
ENV GOOGLE_APPLICATION_CREDENTIALS=./firebase-config.json

EXPOSE 8080
# run our binary
CMD ["./repetiswole"]