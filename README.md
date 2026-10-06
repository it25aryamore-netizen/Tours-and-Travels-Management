# Tours and Travels Management

A travel agency management application with a React customer experience and a Spring Boot REST API. Customers can discover destinations, compare packages, register or sign in, and submit bookings that are stored in MySQL. Administrators can manage destinations, packages, and bookings.

## Technology stack

- Frontend: React, Vite, Bootstrap 5
- Backend: Java 21, Spring Boot, Spring Security, JWT
- Persistence: MySQL 8, Spring Data JPA / Hibernate
- API testing: Postman collection at `backend/postman/Tours and Travels Agency API.postman_collection.json`
- Deployment: Docker and Docker Compose

## Folder structure

```text
frontend/       React/Vite application, API client, and static web-server image
backend/        Spring Boot API, JPA entities, security, and API image
database/       MySQL schema and idempotent demo data
docker-compose.yml
```

## Database setup

The SQL setup is in `database/schema.sql` and `database/seed.sql`. Schema creation matches the JPA entities; seed data adds four destinations and four packages and does not insert a user or a plain-text password.

For a local MySQL instance, create the database and apply the scripts in order using MySQL Workbench or the MySQL CLI. In PowerShell, for example:

```powershell
Get-Content .\database\schema.sql | mysql -u root -p
Get-Content .\database\seed.sql | mysql -u root -p tours_travels_db
```

The Docker Compose MySQL service applies both scripts automatically when its data volume is first initialized.

## Environment variables

Copy `.env.example` to `.env` and fill the blank secrets before using Compose. `.env` is ignored by Git.

| Variable | Purpose |
| --- | --- |
| `DB_USERNAME` | MySQL application account (default `tours_app`) |
| `DB_PASSWORD` | Password for the application account and local MySQL root account |
| `DB_URL` | JDBC URL; use `mysql` as the Compose hostname |
| `JWT_SECRET` | Base64-encoded key of at least 32 random bytes for HS256 |
| `ADMIN_EMAIL` | Email for the environment-provisioned administrator |
| `ADMIN_PASSWORD` | Administrator password; stored as a BCrypt hash |
| `CORS_ALLOWED_ORIGINS` | Comma-separated, exact browser origins allowed by the API |
| `VITE_API_BASE_URL` | API origin compiled into the frontend; defaults to `http://localhost:8080` |
| `FRONTEND_PORT` | Host port for the Compose frontend (default `80`) |

Generate a JWT secret in PowerShell:

```powershell
$bytes = New-Object byte[] 32
$rng = [System.Security.Cryptography.RandomNumberGenerator]::Create()
$rng.GetBytes($bytes)
[Convert]::ToBase64String($bytes)
$rng.Dispose()
```

Copy the printed Base64 value into `JWT_SECRET`. Never commit `.env`, real credentials, or signing keys. The frontend API origin is a Vite build-time value: set `VITE_API_BASE_URL` to the deployed HTTPS API origin and rebuild the frontend image for production.

## Run locally

Start MySQL and apply the schema and seed scripts, then configure the backend environment. Required local variables are `DB_USERNAME`, `DB_PASSWORD`, `JWT_SECRET`, `ADMIN_EMAIL`, and `ADMIN_PASSWORD`. The default database URL targets `localhost:3306`; configure `DB_URL` if the MySQL server differs.

Backend (from `backend/`):

```powershell
mvn spring-boot:run
```

Frontend (from `frontend/`):

```powershell
npm ci
npm run dev
```

The Vite development server defaults to `http://localhost:5173`; it connects to `http://localhost:8080` unless `VITE_API_BASE_URL` is set. The backend accepts `APP_CORS_ALLOWED_ORIGINS` (comma-separated) to configure exact CORS origins. The administrator is provisioned from `ADMIN_EMAIL` and `ADMIN_PASSWORD` at startup; no admin password is placed in the SQL seed.

## REST API

The API base URL is `http://localhost:8080`. JSON API routes:

| Resource | Routes | Access |
| --- | --- | --- |
| Authentication | `POST /api/auth/register`, `POST /api/auth/login` | Public |
| Destinations | `GET /api/destinations[/{id}]`, `POST /api/destinations`, `PUT /api/destinations/{id}`, `DELETE /api/destinations/{id}` | Public reads; ADMIN writes |
| Packages | `GET /api/packages[/{id}]`, `POST /api/packages`, `PUT /api/packages/{id}`, `DELETE /api/packages/{id}` | Public reads; ADMIN writes |
| Customers | `GET /api/customers/me`; collection, ID, create, update, and delete under `/api/customers` | Own profile for CUSTOMER; ADMIN management |
| Bookings | Collection and ID `GET`, `POST`, `PUT /api/bookings/{id}`, `DELETE /api/bookings/{id}` | CUSTOMER can create/read only their own bookings; ADMIN can manage all |

Send protected requests with `Authorization: Bearer <token>`. Public registration only accepts the `CUSTOMER` role. Package requests refer to a destination as `{ "destination": { "id": 1 } }`; booking requests use `customer` and `travelPackage` objects containing existing IDs. Booking records are persisted in MySQL and returned by `GET /api/bookings` for the authenticated customer.

## Postman

Import `backend/postman/Tours and Travels Agency API.postman_collection.json` into Postman. Set `baseUrl` if the API is not at localhost. Register/login requests save their returned JWT into the collection's `token` variable, inherited as bearer authentication by protected requests. Use **Login administrator** with the `adminEmail` and `adminPassword` variables (configure these in a local Postman environment, not in a committed collection) before testing admin CRUD endpoints. Create related records before requests that need their IDs, then set `destinationId`, `packageId`, `customerId`, and `bookingId` to the returned IDs in the collection variables.

## Docker Compose

After populating `.env` with strong values for the required credentials and a generated JWT secret:

```powershell
docker compose up --build
```

The frontend is served at `http://localhost` (or the configured `FRONTEND_PORT`), the REST API at `http://localhost:8080`, and MySQL is available internally to the Compose network. The MySQL health check gates backend startup. The production container profile uses Hibernate schema validation; the committed SQL scripts own table creation. Persisted database data is stored in the `mysql-data` volume.

## Production deployment

Deploy the Compose stack on a Docker host, supply secrets through the deployment environment or an untracked `.env`, set `VITE_API_BASE_URL` to the deployed backend's HTTPS URL, and set `CORS_ALLOWED_ORIGINS` to the exact HTTPS frontend origin(s). Rebuild the frontend image whenever the API URL changes. Terminate TLS at a trusted reverse proxy/load balancer, restrict access to the MySQL network and host ports, configure backups for `mysql-data`, and rotate credentials outside source control. Do not deploy with the local fallback API URL, a weak JWT key, or development credentials.

## Verification commands

```powershell
cd backend
mvn clean package

cd ..\frontend
npm run lint
npm run build

cd ..
docker compose config
docker compose build
```
