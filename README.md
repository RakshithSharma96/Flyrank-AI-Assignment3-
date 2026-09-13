# FlyRank Auth API

A REST API built with Node.js and Express that implements user authentication using Supabase Auth and JWT-protected routes.

## Features

- User signup
- User login
- JWT-based authentication
- Protected routes
- Reusable authentication middleware
- User logout
- Swagger API documentation
- Bearer token authentication in Swagger

## Tech Stack

- Node.js
- Express
- Supabase Auth
- JWT
- Swagger UI

## Project Structure

```text
flyrank-auth/
├── middleware/
│   └── auth.js
├── .env
├── .env.example
├── .gitignore
├── package.json
├── package-lock.json
├── README.md
└── server.js