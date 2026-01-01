# 🌱 DontKillIt - Plant Care Application

A full-stack plant care application to help you keep your plants alive and thriving!

## Features (Planned)

- 🪴 **Plant Profiles** - Track all your plants with custom notes and photos
- 💧 **Watering Schedules** - Never forget to water your plants again
- 🌿 **Feeding Schedules** - Keep track of fertilizing schedules
- 📸 **Plant Diagnosis** - Upload photos of sick plants and get solutions from web search
- 🔔 **Email Reminders** - Get notified when it's time to care for your plants
- 🤖 **AI-Powered** - Plant identification using PlantNet API

## Tech Stack

### Backend
- **FastAPI** - Modern Python web framework
- **PostgreSQL** - Robust relational database
- **SQLAlchemy** - ORM for database operations
- **Alembic** - Database migrations
- **JWT** - Secure authentication
- **APScheduler** - Background task scheduling

### Frontend
- **React 18** - Modern UI library
- **Vite** - Lightning-fast build tool
- **Material-UI (MUI)** - Beautiful component library with plant-themed design
- **React Router** - Client-side routing
- **React Query** - Powerful server state management
- **Axios** - HTTP client

### External APIs
- **Google Custom Search API** - For plant problem solutions
- **PlantNet API** - Plant species identification
- **Resend** - Email notifications

## Project Structure

```
DontKillIt/
├── backend/
│   ├── app/
│   │   ├── models/      # Database models
│   │   ├── schemas/     # Pydantic schemas
│   │   ├── routers/     # API endpoints
│   │   ├── services/    # Business logic
│   │   └── utils/       # Helper functions
│   ├── alembic/         # Database migrations
│   ├── uploads/         # User-uploaded photos
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/  # React components
│   │   ├── pages/       # Page components
│   │   ├── hooks/       # Custom hooks
│   │   ├── services/    # API client
│   │   └── context/     # React context
│   └── package.json
└── docker-compose.yml   # PostgreSQL container
```

## Getting Started

### Prerequisites
- Python 3.10+
- Node.js 18+
- Docker & Docker Compose (for PostgreSQL)

### Backend Setup

1. **Start PostgreSQL**
   ```bash
   docker-compose up -d
   ```

2. **Create virtual environment and install dependencies**
   ```bash
   cd backend
   python3 -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -r requirements.txt
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env and add your API keys
   ```

4. **Run the backend**
   ```bash
   python -m uvicorn app.main:app --reload
   ```

   Backend will be available at: http://localhost:8000
   API documentation: http://localhost:8000/docs

### Frontend Setup

1. **Install dependencies**
   ```bash
   cd frontend
   npm install
   ```

2. **Run the development server**
   ```bash
   npm run dev
   ```

   Frontend will be available at: http://localhost:5173

## API Keys Setup

You'll need to obtain API keys for the following services:

### Google Custom Search API
1. Go to https://console.cloud.google.com/
2. Create a new project
3. Enable "Custom Search API"
4. Create API credentials
5. Set up Custom Search Engine at https://programmablesearchengine.google.com/

### PlantNet API
1. Go to https://my.plantnet.org/
2. Sign up for an account
3. Get your API key from the dashboard

### Resend Email API
1. Go to https://resend.com/
2. Sign up for an account
3. Create an API key

Add all keys to your `backend/.env` file.

## Development Status

### ✅ Sprint 1 - Foundation (Complete)
- Project structure setup
- Backend FastAPI application
- Frontend React application with Material-UI
- Database configuration
- Basic routing and navigation

### 🚧 Sprint 2 - Authentication (Next)
- User registration and login
- JWT token authentication
- Protected routes
- Password hashing

### 📋 Upcoming Sprints
- Sprint 3: Plant Management (CRUD operations)
- Sprint 4: Watering & Feeding Schedules
- Sprint 5: Photo Diagnosis & Web Search
- Sprint 6: Email Notifications
- Sprint 7: Polish & Testing

## Contributing

This is a personal learning project, but suggestions and feedback are welcome!

## License

MIT License - See LICENSE file for details

---

Built with ❤️ to keep plants alive 🌿
