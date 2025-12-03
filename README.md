## Travel Booking API

Backend service for searching flights, managing user profiles, and booking or canceling trips. Built with Express.js, MongoDB, and Mongoose, and ready for deployment on Vercel.

### Features
- RESTful routes for flights, users, and bookings (10 endpoints total)
- MongoDB persistence with Mongoose models
- JWT-based authentication with password hashing
- Validation, error handling, Helmet, CORS, and logging middleware
- Swagger UI documentation exposed at `/api-docs`
- Production-ready configuration for Vercel serverless deployment

### Getting Started
1. **Install dependencies**
   ```bash
   npm install
   ```
2. **Create `.env`** (see `env.example`)
   ```
   PORT=5000
   MONGO_URI=your-mongodb-uri
   JWT_SECRET=your-secret
   JWT_EXPIRES_IN=12h
   SWAGGER_SERVER_URL=http://localhost:5000
   ```
3. **Run locally**
   ```bash
   npm run dev
   ```
4. **Swagger docs** available at `http://localhost:5000/api-docs`.

### API Overview
| Method | Route | Description |
| --- | --- | --- |
| GET | `/api/v1/flights` | Search flights by city/date/passengers |
| GET | `/api/v1/flights/:flightId` | Fetch a specific flight |
| POST | `/api/v1/users` | Register user and receive JWT |
| GET | `/api/v1/users/:userId` | Authenticated user views their bookings |
| PUT | `/api/v1/users/:userId` | Update user profile |
| DELETE | `/api/v1/users/:userId` | Delete user account |
| POST | `/api/v1/bookings` | Create booking with seat check |
| GET | `/api/v1/bookings/:bookingId` | View booking details |
| PUT | `/api/v1/bookings/:bookingId` | Modify existing booking |
| DELETE | `/api/v1/bookings/:bookingId` | Cancel a booking |
| POST | `/api/v1/auth/login` | (Bonus) Login to obtain JWT |

All booking and user detail routes require the `Authorization: Bearer <token>` header except registration and login.

### Testing the API
- Use Postman/cURL to verify workflows (examples provided in Swagger docs)
- Typical flow:
  1. `POST /api/v1/users` → store returned token
  2. Seed/create flights (via Mongo shell or Compass)
  3. `GET /api/v1/flights?origin=LAX&destination=JFK`
  4. `POST /api/v1/bookings` with token to reserve seats
  5. `GET /api/v1/users/:userId` or `GET /api/v1/bookings/:bookingId`

### Deployment (Vercel)
1. Push repo to GitHub.
2. Import project in Vercel dashboard.
3. Add Environment Variables (`MONGO_URI`, `JWT_SECRET`, etc.).
4. Deploy – Vercel uses `vercel.json` to serve `src/server.js`.

### Project Guidelines Checklist
- [x] Follows layered structure (routes, controllers, middleware)
- [x] MongoDB connection + CRUD operations via Mongoose
- [x] Middleware: Helmet, CORS, logging, validation, auth, error handling
- [x] Ten documented endpoints (exceeding requirement of seven)
- [x] Swagger UI at `/api-docs`
- [x] Deployment configuration for Vercel
- [x] Security best practices (env vars, JWT, validation, consistent responses)

