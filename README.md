# Monea

Monea is a production-quality, premium personal money management web application designed for a single user (with robust backend support for multi-tenant RBAC). It features a sophisticated UI, high-security authentication architectures, and strict server-side analytics.

## Architecture & Technology Stack

The application follows a clean modular monolith architecture:

- **Frontend**: React, Vite, React Router, Tailwind CSS, Recharts, Lucide React
- **Backend**: Node.js, Express, MongoDB, Mongoose
- **Security**: JWT, bcrypt, express-rate-limit, Helmet, Custom Double-Submit CSRF

### Folder Structure
```
/
├── server/
│   ├── src/
│   │   ├── config/        # Environment and DB config
│   │   ├── controllers/   # Route handlers
│   │   ├── middleware/    # Auth, error, CSRF middleware
│   │   ├── models/        # Mongoose schemas
│   │   ├── routes/        # API route definitions
│   │   ├── services/      # Auth logic
│   │   ├── utils/         # Tokens and Logger
│   │   └── app.js & server.js
└── client/
    ├── src/
    │   ├── components/    # Reusable UI (Modals)
    │   ├── features/      # AuthContext
    │   ├── layouts/       # Main, Auth layouts
    │   ├── pages/         # Dashboard, Transactions, Analytics, Settings
    │   ├── services/      # Axios instance with interceptors
    │   └── utils/         # Currency formatter
```

## Authentication & Security Architecture

Monea implements a strict security model appropriate for financial data:

1. **Bootstrap Registration**:
   Public registration is disabled by default. It can be enabled via the `ALLOW_REGISTRATION=true` environment variable, or automatically allowed if the database has 0 users.
2. **Short-Lived Access Tokens**:
   Authentication relies on a 15-minute JWT (`accessToken`) sent via an `HttpOnly`, `Strict` cookie.
3. **Database-Backed Refresh Tokens**:
   A long-lived opaque `refreshToken` is hashed and stored in the database (`Session` model). It is also sent to the client via an `HttpOnly`, `Strict` cookie (scoped to the `/api/auth/refresh` path).
4. **Session Revocation**:
   Logging out deletes the specific session. Changing a password explicitly deletes *all* sessions associated with that user.
5. **CSRF Protection**:
   A custom Double-Submit Cookie pattern is implemented. The server sends an `XSRF-TOKEN` cookie, which the Axios interceptor reads and attaches to the `X-CSRF-Token` header for all state-mutating requests (POST, PUT, DELETE).
6. **API Ownership**:
   All financial resource mutations and queries explicitly enforce `{ userId: req.user.id }`. The frontend's `userId` is never trusted.

## Environment Setup

Create a `.env` file in the `server` directory based on `.env.example`:

```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/monea
JWT_SECRET=your_super_secret_jwt_key
COOKIE_SECRET=your_super_secret_cookie_key
CLIENT_URL=http://localhost:5173
ALLOW_REGISTRATION=true
```

## Running Locally

1. **Start MongoDB**: Ensure you have a local MongoDB instance running or use MongoDB Atlas.
2. **Install Dependencies**:
   ```bash
   cd server && npm install
   cd ../client && npm install
   ```
3. **Start the Backend**:
   ```bash
   cd server && npm run dev
   ```
4. **Start the Frontend**:
   ```bash
   cd client && npm run dev
   ```

## Development & Seed Data

*To be implemented in Phase 12.*
