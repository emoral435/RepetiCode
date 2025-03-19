# API Routes

The following routes are available within the service.

## Table Of Contents

[See here for auto-generation a markdown table](https://www.tablesgenerator.com/markdown_tables)

| Endpoint (assuming base URL = localhost \| railway.app) | Description                                                                                                          |
|---------------------------------------------------------|----------------------------------------------------------------------------------------------------------------------|
| /                                                       | Serves frontend                                                                                                      |
| /auth/{provider}                                        | Redirects user to providers authentication page, leading to the /auth/{provider}/callback afterwards                 |
| /auth/{provider}/callback                               | Deals with the logic after the provider redirects back to our application–either the user was authenticated, or not! |
| /logout/{provider}                                      | Logs the user out                                                                                                    |

## app