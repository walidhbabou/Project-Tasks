# Project-Tasks

## Tech Stack
- **Backend:** Java 17, Spring Boot 3, Maven (mvnw)
- **Frontend:** React (Vite, TypeScript), Tailwind CSS, shadcn/ui, Radix UI, TanStack Query
- **Database:** MySQL 8
- **DevOps:** Docker, Docker Compose

## How to Run the Backend
- **Prerequisites:** JDK 17, MySQL running locally (see Database Setup), Maven wrapper included
- **Config:** Edit `backend/src/main/resources/application.properties` if needed (port, DB credentials)
- **Start (Windows PowerShell):**

```powershell
cd backend
./mvnw.cmd spring-boot:run
```

- **Start (macOS/Linux):**

```bash
cd backend
./mvnw spring-boot:run
```

- The API listens on `http://localhost:8000`.

## How to Run the Frontend
- **Prerequisites:** Node.js 18+ (or Bun), npm
- **Environment:** `VITE_API_URL` defaults to `http://localhost:8000/api`
- **Install & run (npm):**

```bash
cd frontend
npm install
npm run dev
```

- **Install & run (Bun):**

```bash
cd frontend
bun install
bun run dev
```

- The app runs on `http://localhost:5173` by default.

## Database Setup (MySQL)
- Ensure MySQL is running on `localhost:3306`.
- Default backend settings (from `application.properties`):
	- `spring.datasource.url=jdbc:mysql://127.0.0.1:3306/backend?createDatabaseIfNotExist=true`
	- `spring.datasource.username=root`
	- `spring.datasource.password=` (empty)
- The database `backend` will be auto-created if it does not exist.
- If you use different credentials/host, update `backend/src/main/resources/application.properties` accordingly.

## Optional: Run with Docker Compose
- From the repository root:

```bash
docker compose up --build
```

- Note: If paths differ in `docker-compose.yml`, adjust build contexts to match your local folders (e.g., backend folder name).
