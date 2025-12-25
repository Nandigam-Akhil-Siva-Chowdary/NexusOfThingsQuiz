# Nexus Quiz App

A full-stack quiz application built with React (frontend) and Node.js/Express (backend), using MongoDB for data persistence.

## Project Structure

```
quiz-app/
├── frontend/          # React.js frontend application
│   ├── src/
│   │   ├── pages/     # Page components
│   │   ├── App.js     # Main app component
│   │   └── index.js   # Entry point
│   └── package.json
├── backend/           # Node.js/Express backend API
│   ├── routes/        # API routes
│   ├── models/        # MongoDB models
│   ├── server.js      # Server entry point
│   └── package.json
├── render.yaml        # Render.com deployment configuration
├── .env.example       # Environment variables template
└── package.json       # Root package.json
```

## Prerequisites

- Node.js >= 16.0.0
- npm or yarn
- MongoDB Atlas account (for cloud database)

## Installation

### 1. Install Dependencies

```bash
# Install root dependencies
npm install

# Install frontend dependencies
cd frontend
npm install

# Install backend dependencies
cd ../backend
npm install
```

### 2. Environment Setup

Copy `.env.example` to `.env` in the root directory and configure:

```bash
cp .env.example .env
```

Edit `.env` with your actual values:

- `MONGODB_URI`: Your MongoDB Atlas connection string
- `ADMIN_USERNAME` and `ADMIN_PASSWORD`: Admin credentials
- `REACT_APP_API_URL`: Backend API URL
- Other configuration values

## Development

### Start Backend Server

```bash
cd backend
npm run dev
```

The server will run on `http://localhost:10000`

### Start Frontend Development Server

```bash
cd frontend
npm start
```

The app will open at `http://localhost:3000`

## Production Build

### Frontend

```bash
cd frontend
npm run build
```

### Backend

No build needed - runs directly with Node.js

## Deployment

### Render.com

The project includes `render.yaml` for automatic deployment on Render:

1. Push code to GitHub
2. Connect repository to Render.com
3. Set environment variables in Render dashboard:
   - `MONGODB_URI`
   - `ADMIN_USERNAME`
   - `ADMIN_PASSWORD`
   - `FRONTEND_URL` (your Render frontend URL)
4. Render will automatically deploy on push

## Features

- User authentication and quiz participation
- Admin dashboard for quiz management
- Real-time quiz sessions
- Results tracking and export
- CSV upload/download capabilities
- Responsive Material-UI interface

## API Endpoints

### Authentication

- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration

### Quiz

- `GET /api/quiz/questions` - Get quiz questions
- `POST /api/quiz/submit` - Submit quiz answers

### Admin

- `POST /api/admin/login` - Admin login
- `GET /api/admin/participants` - Get all participants
- `GET /api/admin/results/:sessionId` - Get session results

## Security Notes

- **NEVER** commit `.env` files with real credentials
- Always use environment variables for sensitive data
- Change default admin credentials in production
- Use HTTPS in production
- Implement proper JWT authentication
- Keep dependencies updated

## Tech Stack

**Frontend:**

- React 18
- Material-UI (MUI)
- Axios for HTTP requests
- React Router for navigation

**Backend:**

- Node.js & Express
- MongoDB with Mongoose
- CORS for cross-origin requests
- Multer for file uploads

## License

Proprietary - All rights reserved

## Support

For issues or questions, contact the development team.
