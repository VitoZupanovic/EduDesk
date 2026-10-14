# EduDesk

A university team project inspired by Infoeduka, built with ASP.NET Core and React. EduDesk allows administrators, lecturers, and students to manage courses, learning material links, notifications, and user accounts.

This repository is published with the team's permission to showcase the project and my contribution. The application was developed collaboratively.

## My contribution — Vito Zupanovic

### Backend
- Authentication controller and related DTOs
- Login and administrator-controlled user registration
- Password change functionality
- JWT token generation and authentication security
- Unit tests

### Frontend
- Application logo
- Navbar with an avatar dropdown menu
- Reusable confirmation modal
- Login and registration pages
- Change password page
- Authentication services

### Database
- Shared responsibility for database design and implementation, divided equally among team members

## Features

- JWT authentication and role-based access for Admin, Lecturer, and Student
- Administrator-controlled user creation
- User and course management
- Student enrollment in courses
- Course material links
- Course notifications
- Password changes
- Responsive React interface
- Backend unit tests

## Technologies

- C# and .NET 8
- ASP.NET Core Web API
- Entity Framework Core
- SQL Server
- React and Vite
- Bootstrap
- xUnit

## Repository structure

- Backend/ — Web API, solution, and unit tests
- Frontend/ — React application and demo course files
- Database/ — SQL schema and sample data
- docs/Wireframes.pdf — application wireframes

## Local setup

### Database

Create a SQL Server database named EduDeskDb and run:

1. Database/SQLQuery_CreateTables.sql
2. Database/SQLQuery_DataInsert.sql

The seed script contains fictional sample records.

### Backend

1. Open Backend/Elmer_PAAD_Infoeduka.sln in Visual Studio.
2. Copy Backend/Elmer_PAAD_Infoeduka/appsettings.Example.json to appsettings.json in the same folder.
3. Replace the connection string placeholders with your local SQL Server settings.
4. Replace the JWT key placeholder with a randomly generated secret of at least 32 bytes.
5. Set Elmer_PAAD_Infoeduka as the startup project and run it in Development mode.

Local configuration files are excluded from Git.

The default API address is http://localhost:5289.
Swagger is available at /swagger.

### Frontend

Use a current Node.js LTS release.

1. Open a terminal in Frontend/.
2. Copy .env.example to .env.
3. Check that VITE_API_BASE_URL matches your backend address.
4. Run:

```bash
npm ci
npm run dev
```

The default frontend address is http://localhost:5173.

### Tests

From Backend/, run:

```bash
dotnet test Elmer_PAAD_Infoeduka.sln
```

## Demo account limitation

The supplied seed password hashes are not compatible with the backend's ASP.NET Core PasswordHasher format. The seeded accounts therefore require valid replacement hashes before login can be demonstrated.

User creation is restricted to administrators, so the first local administrator must be initialized separately.

## Credits

EduDesk was developed by the Elmer PAAD team.
The contribution section describes my work; the remaining functionality was implemented by my teammates or developed jointly.