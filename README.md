# Bankuish API 🚀

Welcome to the Bankuish API!

## Overview:

- **NestJS and PostgreSQL:** This API is built using the NestJS framework and PostgreSQL as the database.

- **Environment Variables:** The API configuration is managed using environment variable files. There are two files: .env.prod for the production environment and .env.dev for the development environment. The NODE_ENV variable determines which file to use, defaulting to the development file.

- **Docker Support:** The project includes Docker support for both production and development. A Dockerfile is provided for production and a Dockerfile.dev for development.

- **Docker Compose:** A docker-compose.yml file is included to simplify development. It uses Dockerfile.dev and spins up a PostgreSQL database instance alongside the application.

- **Swagger Documentation:** Swagger integration provides detailed API documentation, accessible at /docs.

## Usage:

### Option 1: Docker Compose

Using docker-compose is the recommended way to set up the environment quickly:

```bash
docker-compose up
```
This command starts all services defined in the docker-compose.yml file.

### Option 2: Run with PostgreSQL Credentials
If you prefer to load PostgreSQL credentials from a .env.prod file, you can run:

```bash
pnpm run start:dev
```

### Option 3: Run Only the Database
You can start only the PostgreSQL database using:

```bash
docker-compose up db
```
This will start only the database service defined in the docker-compose.yml file. In a separate terminal, start the application using Option 2.

## API Docs
You can access the Swagger documentation at http://localhost:3000/docs. The documentation allows you to easily test all endpoints.

### Authentication

Most endpoints are protected and require authentication. First, execute the /api/seed endpoint to generate an admin user and retrieve credentials. Use these credentials to log in and obtain a token. Once you have the token, click the Authorize 🔒 button at the top of the Swagger UI and paste the token into the input field to authorize your requests.

## Testing 🧪

The API includes unit and e2e tests for all modules. To run the tests, use:
```bash
pnpm run test
```

## Author
Thank you for checking out this project!

- [@AlejoSRodriguez](https://github.com/AlejoSRodriguez)