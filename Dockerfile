# go build
FROM golang:1.23-bookworm AS go-builder

# we get our main module as a binary from the source
RUN go install github.com/emoral435/repeticode@latest

# build using node and vite
FROM node:21.6.2 AS frontend-builder

# change to our main working directory
WORKDIR /app/frontend

# copy our frontend react app to the container
COPY ./frontend .

# produces our static HTML 'dist' folder, redirected to: /app/frontend
RUN npm i && npm run build

# combine both go-builder and frontend
FROM debian:bookworm-slim as package-builder

# switch into our applications folder
WORKDIR /app
RUN mkdir -p frontend/dist

COPY --from=go-builder \
      # copy our binary over
      /go/bin/repeticode \
      .

COPY --from=frontend-builder \
      # copy over our static html files
      /app/frontend/dist/ \
      .frontend/dist

# run our binary
CMD ["./repeticode"]