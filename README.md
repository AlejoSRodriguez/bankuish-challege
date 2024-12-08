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

## Authentication

Most endpoints are protected and require authentication. To get started:

1. Use the **`/api/auth/signup`** endpoint to create an account and receive your credentials.
2. Log in with these credentials using the **`/api/auth/login`** endpoint to obtain an authentication token.
    - The response also includes the **user's local database ID**, which can be used to interact with other endpoints.
3. In the Swagger UI:
    - Click the **Authorize 🔒** button at the top-right corner.
    - Paste the token into the input field and confirm.
    - This will authorize your requests for protected endpoints.

---

| Endpoint      | Method | Description                  |
| ------------- | ------ | ---------------------------- |
| `/api/auth/signup` | POST   | Register a new user          |
| `/api/auth/login`  | POST   | Authenticate and get a token |

## 📄 API Docs

You can access the Swagger documentation at [http://localhost:3000/docs](http://localhost:3000/docs).  
The documentation provides an interactive interface to test all available endpoints.

### **Endpoints Overview**

| **Endpoint**       | **Method** | **Description**                                                |
|---------------------|------------|----------------------------------------------------------------|
| `api/auth/signup`      | POST       | Registers a new user with an email, password, and name.       |
| `api/auth/login`       | POST       | Authenticates a user and returns a token and local user ID.   |
| `api/auth/profile`     | GET        | Retrieves the profile of the authenticated user.             |
| `api/user-courses/start` | POST     | Starts a course for a user.                                   |
| `api/user-courses/complete` | POST | Marks a course as completed for a user.                      |
| `api/user-courses/unlockable` | GET | Lists courses the user can unlock based on prerequisites.    |
| `api/courses/sort`     | POST       | Sorts a list of courses based on their dependencies.         |
| `api/courses/create`   | POST       | Creates courses and their dependencies.                     |

---

### **Usage**

- **Interactive Testing:** Use the Swagger interface to test endpoints by providing input directly.
- **Authentication Required:** For protected endpoints, ensure you log in first and use the token to authorize requests.

> 💡 **Tip**: Each endpoint in the documentation includes sample input and output for your convenience.

## Testing 🧪

The API includes unit and e2e tests for all modules. To run the tests, use:

```bash
npm run test
```

## Author

Thank you for checking out this project!

- [@AlejoSRodriguez](https://github.com/AlejoSRodriguez)
