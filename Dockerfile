# go build
FROM golang:1.23-bookworm AS go-builder

# we get our main module as a binary from the source
WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -o /repeticode

# build using node and vite
FROM node:21.6.2 AS frontend-builder

# change to our main working directory
WORKDIR /app/frontend

# copy our frontend react app to the container
COPY ./frontend/ .

# produces our static HTML 'dist' folder, redirected to: /app/frontend
RUN npm i && npm run build

# combine both go-builder and frontend
FROM debian:bookworm-slim as package-builder

# switch into our applications folder
WORKDIR /app
RUN mkdir -p frontend/dist

COPY --from=go-builder \
      # copy our binary over
      /repeticode \
      .

COPY --from=frontend-builder \
      # copy over our static html files
      /app/frontend/dist \
      ./frontend/dist

COPY Makefile .env* /app/

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
ARG HASHING_KEY
ARG GOOGLE_CLIENT_ID
ARG GOOGLE_CLIENT_SECRET

ENV HASHING_KEY=$HASHING_KEY \
      GOOGLE_CLIENT_ID=$GOOGLE_CLIENT_ID \
      GOOGLE_CLIENT_SECRET=$GOOGLE_CLIENT_SECRET \
      RAILWAY_PUBLIC_DOMAIN=$RAILWAY_PUBLIC_DOMAIN \
      RAILWAY_PRIVATE_DOMAIN=$RAILWAY_PRIVATE_DOMAIN \
      RAILWAY_PROJECT_NAME=$RAILWAY_PROJECT_NAME \
      RAILWAY_ENVIRONMENT_NAME=$RAILWAY_ENVIRONMENT_NAME \
      RAILWAY_SERVICE_NAME=$RAILWAY_SERVICE_NAME \
      RAILWAY_PROJECT_ID=$RAILWAY_PROJECT_ID \
      RAILWAY_ENVIRONMENT_ID=$RAILWAY_ENVIRONMENT_ID \
      RAILWAY_SERVICE_ID=$RAILWAY_SERVICE_ID

EXPOSE 8080
# run our binary
CMD ["./repeticode"]