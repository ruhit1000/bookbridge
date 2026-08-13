# BookBridge

**Live Demo:** [https://bookbridge-frontend.vercel.app](https://bookbridge-frontend.vercel.app)

BookBridge is a modern platform that helps users discover books people are willing to lend, or list their own library to share with others. 

The application facilitates a robust borrowing workflow: users can browse books, submit borrow requests, and book owners can approve or reject these requests. The platform manages the entire lifecycle, ensuring availability status is automatically updated when a book is borrowed or returned.

## Features

- **Authentication**: Secure JWT-based registration and login with bcrypt password hashing.
- **Book Management**: Full CRUD capabilities for books with real image uploads via ImgBB.
- **Search & Discovery**: Instantly search books by title or author across categories.
- **Borrowing Workflow**: Request to borrow, owner approval/rejection, and return confirmation.
- **Status Syncing**: Automated availability status updates (`AVAILABLE`, `BORROWED`, `UNAVAILABLE`).
- **Data Integrity**: Soft-deletes for users and books to maintain borrowing history without breaking relations.

## Technology Stack

BookBridge is built on a scalable full-stack architecture:

- **Frontend**: Next.js, React, Tailwind CSS
- **Backend API**: Express.js, TypeScript, Node.js
- **Database**: PostgreSQL
- **ORM**: Prisma ORM
- **Security**: JWT, bcrypt, express-rate-limit, CORS

## Architecture

The application is structured securely with a strict separation between the client interface and database.

```text
       Frontend (Next.js)
              ↓
          REST API
              ↓
  Express + TypeScript Backend
              ↓
          Prisma ORM
              ↓
      PostgreSQL Database
```

### Main Models

- **User**: The participants in the network.
- **Category**: Predefined genres/tags for books.
- **Book**: Books listed by users (owners).
- **BorrowRequest**: The transaction record between a borrower and a book owner, tracking the state (`PENDING`, `APPROVED`, `REJECTED`, `RETURNED`).

## API Overview

The backend exposes a secure REST API under `/api/v1`.
All routes (except Auth and `GET /books`) require a valid Bearer JWT.

- `/auth` - Login and Registration
- `/books` - Book discovery and management
- `/borrow-requests` - Creating and updating borrowing transactions
- `/categories` - Book genre classification
- `/users` - User profile management

## Setup

### 1. Database & Backend Setup

Navigate to the `backend` directory:
```bash
cd backend
npm install
```

Copy the environment template and fill it out:
```bash
cp .env.example .env
```
*(Ensure you set `DATABASE_URL`, `JWT_SECRET`, and `FRONTEND_URL`)*

Run migrations to set up PostgreSQL:
```bash
npx prisma migrate deploy
npx prisma generate
```

Start the development server:
```bash
npm run dev
```

### 2. Frontend Setup

Navigate to the `frontend` directory:
```bash
cd frontend
npm install
```

Copy the environment template:
```bash
cp .env.example .env.local
```
*(Ensure you provide your ImgBB API key and Backend API URL)*

Start the frontend development server:
```bash
npm run dev
```

## Production Deployment

When deploying to a production environment:

1. **Database**: Use `npx prisma migrate deploy` for schema updates. Never use `reset` or `db push` in production.
2. **Backend**: 
   - Compile using `npm run build`.
   - Set `NODE_ENV=production`.
   - Start using `npm run start` (runs `node dist/server.js`).
3. **Frontend**: 
   - Build using `npm run build`.
   - Start using `npm run start`.
   - Ensure `NEXT_PUBLIC_API_URL` points to the deployed backend URL.

## Future Roadmap

The following features are planned but not yet implemented:

- Permanent book exchange
- Advanced search filtering
- Push notifications and email alerts
- Reviews and ratings system
- Location-aware borrowing distances
- Personalized book recommendations
- Dedicated mobile application
