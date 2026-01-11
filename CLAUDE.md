# DontKillIt - Project Context for Claude

## Project Overview
DontKillIt is a plant care management application that helps users track and care for their houseplants. Users can identify plants via photo, set watering/feeding schedules, receive care reminders, and diagnose plant problems.

## Tech Stack
- **Backend**: FastAPI (Python), PostgreSQL, SQLAlchemy
- **Frontend**: React, Material UI, React Query, Vite
- **APIs**: PlantNet (identification), Perenual (enrichment), ASPCA (pet toxicity)
- **Auth**: JWT-based authentication

## Project Structure
```
backend/
  app/
    models/       # SQLAlchemy models
    routers/      # API endpoints
    schemas/      # Pydantic schemas
    services/     # Business logic (plantnet, pet_toxicity, perenual, etc.)
    utils/        # Auth, logging, rate limiting
frontend/
  src/
    components/   # Reusable UI components
    pages/        # Page components
    hooks/        # React Query hooks
    services/     # API client
    context/      # Auth context
```

## Lessons Learned

### Session: January 2026

1. **Missing Routes**: When adding new functionality (like plant editing), ensure both the page component AND the route in App.jsx are created. The edit plant feature was broken because the route `/plants/:id/edit` didn't exist.

2. **Input Validation**: HTML `max` attribute on number inputs only suggests a limit but doesn't prevent users from typing larger values. Always add JavaScript validation in onChange handlers:
   ```javascript
   onChange={(e) => {
     const value = parseInt(e.target.value) || 1;
     setFrequencyDays(Math.min(30, Math.max(1, value)));
   }}
   ```

3. **Backend + Frontend Validation**: Always validate on both sides. Frontend for UX, backend schemas for security:
   ```python
   frequency_days: int = Field(..., ge=1, le=30)
   ```

4. **Delete Confirmations**: Replace browser `window.confirm()` with Material UI Dialog for better UX and consistent styling.

5. **Schedule Defaults**:
   - Watering: 7 days default, 1-30 days range
   - Feeding: 30 days default, 1-30 days range

6. **Edit Pages Need All Features**: When creating an edit page, include all relevant management sections (like ScheduleCard for watering/feeding), not just the form.

## Roadmap

### Completed
- [x] Plant identification via PlantNet API
- [x] Pet toxicity detection (ASPCA database)
- [x] Watering and feeding schedules
- [x] Plant editing functionality
- [x] Delete confirmation dialogs
- [x] Schedule validation (1-30 days)
- [x] Data enrichment services (Perenual API)

### In Progress
- [ ] Data enrichment job integration
- [ ] WebSocket real-time notifications

### Future Enhancements
- [ ] Smart watering suggestions based on plant type
- [ ] Seasonal care adjustments
- [ ] Plant health history/trends
- [ ] Multiple photos per plant
- [ ] Plant grouping by room/location
- [ ] Care reminders via push notifications
- [ ] Offline mode support
- [ ] Plant sharing/social features

## Important Notes

### Files to Never Commit
- `API Keys/` - Contains sensitive API keys
- `backend/uploads/photos/` - User uploaded images
- `.env` files - Environment secrets

### API Keys Required
- `PLANTNET_API_KEY` - Plant identification
- `PERENUAL_API_KEY` - Plant data enrichment (100 requests/day free tier)
- `RESEND_API_KEY` - Email notifications

### Running the App
```bash
# Backend
cd backend
source venv/bin/activate
uvicorn app.main:app --reload

# Frontend
cd frontend
npm run dev
```

## Common Issues

1. **Static files not serving**: Ensure `backend/uploads/photos/` directory exists before starting the app (it's created by photo_storage service on first import, but the static mount check happens earlier in main.py).

2. **Schedule not showing on edit page**: ScheduleCard component must be included in EditPlantPage.

3. **Photo not displaying**: Use `getPhotoUrl()` helper to prepend the API base URL to photo paths.
