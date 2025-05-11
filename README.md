# Customer Management API

A simple CRUD application for managing customer data

## Features

- CRUD operations for Customer entities.
- Validation:
  - Unique Email.
  - Unique combination of FirstName, LastName, and DateOfBirth.
  - Valid Email format.
  - Valid **Mobile** Phone Number (using `google-libphonenumber`).
  - Basic Bank Account Number format check (non-empty, length).
- API documentation via Swagger UI (`/api-docs`).

## Architecture & Patterns

- **NestJS Framework**
- **Clean Architecture:** Separation into Core (Domain), Application, Infrastructure, and Presentation layers.
- **Domain-Driven Design (DDD):** Customer Aggregate Root, Value Objects (Email, PhoneNumber).
- **CQRS:** Command Query Responsibility Segregation using `@nestjs/cqrs`. Commands for writes, Queries for reads.
- **Repository Pattern:** Abstracting data persistence (`ICustomerRepository`).
- **Dependency Injection:** Used throughout via NestJS.
- **TDD/BDD:** Development driven by tests (Unit, Integration, E2E using Jest/Supertest).
- **Database:** PostgreSQL with TypeORM.
- **Phone Number Storage:** Stored as `varchar` in E.164 format for simplicity and compatibility.

## Setup & Running

1.  **Prerequisites:** Node.js (v16+), npm, Docker (optional, for database)
2.  **Clone:** `git clone ...`
3.  **Install Dependencies:** `npm install`
4.  **Database Setup:**
    - **Option A (Docker):**
      - Ensure Docker is running.
      - Copy `.env.example` to `.env` and update `DB_PASSWORD` if needed.
      - Run `docker-compose up -d` (Add a `docker-compose.yml` for PostgreSQL).
    - **Option B (Manual):**
      - Set up a PostgreSQL database.
      - Create a database (e.g., `customer_management`).
      - Copy `.env.example` to `.env` and fill in your `DB_HOST`, `DB_PORT`, `DB_USERNAME`, `DB_PASSWORD`, `DB_NAME`.
5.  **Run Migrations (if applicable):** `npm run typeorm migration:run` (Need to add TypeORM CLI config and migration scripts) - _Note: Currently uses `synchronize: true` for dev, disable for prod and use migrations._
6.  **Run Application:** `npm run start:dev`
7.  **Access API:** `http://localhost:3000` (or configured port)
8.  **Access Swagger Docs:** `http://localhost:3000/api-docs`

## Running Tests

- **Unit Tests:** `npm run test`
- **Integration Tests:** (Configure separately if needed)
- **E2E Tests:** `npm run test:e2e` (Ensure database is running)
- **Cucumber Tests:** `npm run test:cucumber` (Ensure database is running) [report](cucumber-report.html)
- **Test Coverage:** `npm run test:cov`
