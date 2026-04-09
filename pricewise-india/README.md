# PriceWise India

PriceWise India is a full-stack grocery and quick-commerce price comparison platform built for Indian users. It helps users search products, compare prices across multiple platforms, save alerts, and track price drops from one place.

## Overview

This project combines a React frontend with an Express backend and aggregates pricing data from multiple mock grocery and food delivery platforms. It includes authentication, alert management, admin tools, charts, caching, email notifications, and real-time updates.

## Features

- Compare prices across Blinkit, Zepto, BigBasket, DMart, JioMart, Swiggy, and Zomato
- Search products by item and city
- View cheapest results instantly
- Save and manage personal price alerts
- Receive real-time price alert notifications
- Access an admin panel for user and scrape operations
- Visualize trends with chart components
- Use Redis caching with graceful fallback if Redis is unavailable
- Send price-drop emails through SMTP

## Tech Stack

### Frontend

- React 18
- Vite
- React Router DOM
- Tailwind CSS
- Recharts
- Socket.IO Client

### Backend

- Node.js
- Express
- MongoDB with Mongoose
- JWT Authentication
- Joi Validation
- Socket.IO
- Nodemailer
- Node Cron
- Redis with ioredis

## Project Structure

```text
pricewise-india/
├─ frontend/
│  ├─ src/
│  │  ├─ components/
│  │  ├─ context/
│  │  ├─ pages/
│  │  └─ services/
│  └─ package.json
├─ backend/
│  ├─ controllers/
│  ├─ middleware/
│  ├─ models/
│  ├─ services/
│  ├─ socket/
│  └─ server.js
├─ package.json
└─ README.md
```

## Key Pages

- `Home` for landing and product search
- `Results` for product comparison output
- `Dashboard` for alerts and account-related features
- `AdminPanel` for admin-only controls
- `Login` and `Register` for authentication

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/your-username/pricewise-india.git
cd pricewise-india
```

### 2. Install dependencies

From the project root:

```bash
npm install
npm install --prefix frontend
npm install --prefix backend
```

Or use the helper script:

```bash
npm run install:all
```

### 3. Configure environment variables

Create and fill these files:

- `frontend/.env`
- `backend/.env`

Example `frontend/.env`:

```env
VITE_API_URL=http://localhost:5000
```

Example `backend/.env`:

```env
MONGO_URI=mongodb+srv://your-mongo-uri
JWT_SECRET=your_jwt_secret
ENCRYPTION_KEY=your_64_char_hex_key
REDIS_URL=redis://127.0.0.1:6379
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email
SMTP_PASS=your_app_password
CLIENT_URL=http://localhost:5173
PORT=5000
NODE_ENV=development
```

Notes:

- `REDIS_URL` is optional.
- `JWT_SECRET` should be strong and private.
- `CLIENT_URL` should match your frontend origin.

### 4. Run the app

Start both frontend and backend from the root:

```bash
npm run dev
```

Or run them separately:

```bash
cd frontend
npm run dev
```

```bash
cd backend
npm run dev
```

### 5. Open the app

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:5000`

Example API route:

`http://localhost:5000/api/prices/compare?item=milk&city=Mumbai`

## Available Scripts

### Root

- `npm run dev` starts frontend and backend together
- `npm run install:all` installs dependencies for all packages

### Frontend

- `npm run dev`
- `npm run build`
- `npm run preview`
- `npm run lint`

### Backend

- `npm run dev`
- `npm run start`

## API Highlights

### Public Routes

- `GET /api/prices/compare`
- `GET /api/prices/cheapest`
- `GET /api/prices/history`

### Authentication Routes

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`

### User Routes

- `GET /api/user/me`
- `PUT /api/user/me`

### Alert Routes

- `GET /api/alerts`
- `POST /api/alerts`
- `DELETE /api/alerts/:id`

### Admin Routes

- `GET /api/admin/users`
- `PUT /api/admin/users/:id/ban`
- `DELETE /api/admin/users/:id`
- `GET /api/admin/logs`
- `POST /api/admin/scrape`

## Authentication

User data is stored directly in MongoDB. The backend issues JWTs after login or registration, and protected routes use bearer-token authentication. Alerts, admin checks, and notifications reference internal database user IDs.

## Real-Time Notifications

Socket.IO is used to send live price alerts to authenticated users. Each user joins a room tied to their internal user ID after socket authentication.

## Deployment

- Deploy the frontend on Vercel, Netlify, or any static host
- Deploy the backend on Render, Railway, or any Node host
- Use MongoDB Atlas for the database
- Use Redis Cloud or a local Redis instance for caching if needed
- Update `CLIENT_URL` and `VITE_API_URL` for production

## Future Improvements

- Production-grade data integrations instead of mock scrapers
- Better alert creation flow from the comparison table
- Saved searches and personalization
- More admin analytics
- Automated tests for frontend and backend

## License

Everyone can make changes to this mern full stack application this was my second project to sharpen my skills......
@saicharansuddala
