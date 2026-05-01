# Team Task Manager - Ethara AI Assignment

A full-stack web app where users can:
- Signup/Login with JWT authentication
- Manage projects and team members
- Create, assign, and track tasks
- View a dashboard for task summary and overdue tasks

## Tech Stack
- Backend: Node.js, Express
- Database: Sequelize ORM (SQLite local, PostgreSQL in production via `DATABASE_URL`)
- Auth: JWT + bcrypt
- Frontend: Vanilla JS + Bootstrap
- Deployment: Railway

## Features Implemented
1. Authentication
   - `POST /api/auth/signup`
   - `POST /api/auth/login`

2. Role-based Access
   - System roles: `admin`, `member`
   - Only `admin` can create projects and add members
   - Task status can be updated by assignee or admin

3. Project & Team Management
   - Create project
   - Add members by email
   - List project members

4. Task Management
   - Create tasks within projects
   - Assign tasks to project members
   - Track statuses (`todo`, `in_progress`, `done`)

5. Dashboard
   - Total assigned tasks
   - Status-wise counts
   - Overdue task count and list

## Local Setup
1. Install dependencies:
   ```bash
   npm install
   ```
2. Create `.env` from `.env.example`:
   ```bash
   copy .env.example .env
   ```
3. Update `.env`:
   - Set `JWT_SECRET`
   - Set `ADMIN_EMAIL` (this email gets admin role on signup)
4. Start app:
   ```bash
   npm run dev
   ```
5. Open:
   - `http://localhost:5000`

## Railway Deployment (Mandatory)
1. Push code to GitHub repo.
2. In Railway:
   - New Project -> Deploy from GitHub repo.
   - Add PostgreSQL service.
3. Set environment variables in Railway:
   - `JWT_SECRET`
   - `ADMIN_EMAIL`
   - `NODE_ENV=production`
   - `DATABASE_URL` (from Railway PostgreSQL)
4. Start command:
   - `npm start`
5. Deploy and open generated public URL.

## API Quick Reference
- `POST /api/auth/signup`
- `POST /api/auth/login`
- `GET /api/projects`
- `POST /api/projects`
- `POST /api/projects/:projectId/members`
- `GET /api/projects/:projectId/members`
- `GET /api/projects/:projectId/tasks`
- `POST /api/projects/:projectId/tasks`
- `PATCH /api/tasks/:taskId/status`
- `GET /api/dashboard`


