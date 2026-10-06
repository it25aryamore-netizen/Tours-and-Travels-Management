# Backend

The Spring Boot 4 REST API uses Java 21, Spring Security with JWT, Spring Data JPA/Hibernate, and MySQL. For full project setup, environment variables, API access rules, Postman use, local run, and Docker deployment, see the [project README](../README.md).

## Build and run

```powershell
mvn clean package
mvn spring-boot:run
```

Set `DB_USERNAME`, `DB_PASSWORD`, `DB_URL` (optional for a local MySQL instance), `JWT_SECRET` (Base64 key of at least 32 bytes), `ADMIN_EMAIL`, and `ADMIN_PASSWORD` before starting. The admin initializer hashes the configured password with BCrypt. Public registration only creates CUSTOMER accounts.

`GET /api/destinations` and `GET /api/packages` are public. Protected requests use `Authorization: Bearer <token>`. Customers can read and create bookings only for their own account; ADMIN accounts can manage all records.
