# API Routes

The following routes are available within the service.

## Table Of Contents

[See here for auto-generation a markdown table](https://www.tablesgenerator.com/markdown_tables)

| Endpoint (assuming base URL = localhost \| railway.app) | Description                                                                                                                                                                                                | Source    |
|---------------------------------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|-----------|
| GET /                                                   | Serves frontend                                                                                                                                                                                            | server.go |
| POST /api/v1/register/email                             | Registers a user within our Firebase database tied to their email, with a display name and password (passed within the request body)                                                                       | server.go |
