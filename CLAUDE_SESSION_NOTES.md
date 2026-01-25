# DontKillIt - Development Session Notes

**Last Updated:** 2026-01-25
**Session Duration:** ~2 hours

---

## Summary

Fixed critical login bugs, added navigation improvements, cleaned up customer-facing UI, and prepared asset structure for UI redesign.

---

## Completed This Session

### 1. Fixed Login Flash/Redirect Loop

**Problem:** After entering credentials, screen flashed and returned to login page.

**Root Causes:**
- `LoginPage.jsx` had synchronous redirect during render
- `api.js` interceptor redirected on 401 for auth endpoints
- `RegisterPage.jsx` had same issue

**Fixes Applied:**

| File | Change |
|------|--------|
| `frontend/src/pages/LoginPage.jsx` | Changed `if (isAuthenticated) navigate('/')` to `useEffect` hook |
| `frontend/src/pages/RegisterPage.jsx` | Same fix |
| `frontend/src/services/api.js` | Skip 401 redirect for `/auth/*` endpoints |

---

### 2. Fixed Password Reset Flow

**Problem:** "Failed to reset email" error, rate limiter parameter conflict.

**Fixes Applied:**

| File | Change |
|------|--------|
| `backend/app/routers/auth.py` | Renamed `http_request` → `request`, `request` → `data` |
| `backend/app/routers/auth.py` | Changed default reset URL from `localhost` to `10.0.0.78` |
| Database | Created missing `password_reset_tokens` table |

**Password Reset Flow (Working):**
1. User clicks "Forgot Password" on login page
2. Enters email, receives reset link via Resend
3. Clicks link, enters new password
4. Password updated, redirected to login

---

### 3. Added Back Buttons

**Created:** `frontend/src/components/common/BackButton.jsx`

```jsx
// Usage
<BackButton />              // Goes to previous page
<BackButton to="/plants" /> // Goes to specific route
<BackButton variant="button" label="Back to Plants" />
```

**Pages Updated:**
- SettingsPage
- CareTipsPage
- AddPlantPage
- WateringSchedulePage
- FeedingSchedulePage
- EnrichmentPage
- EditPlantPage

**Already Had Back Buttons:**
- PlantDetailPage
- DiagnosisPage
- IdentifyPlantPage
- DiagnosisSelectPage
- All Preview pages

---

### 4. Customer View Cleanup

**Removed from navigation:**
- Data Enrichment (admin feature, still accessible at `/enrichment`)

**Added to navigation:**
- Settings

**Current Customer Menu:**
- My Plants
- Identify Plant
- Care Tips
- Watering Schedule
- Feeding Schedule
- Settings
- Logout

---

### 5. Image Asset Structure

**Created folder structure:**
```
frontend/public/images/
├── icons/          → Care tip icons, badges (200x200px)
├── illustrations/  → Login, empty states, onboarding (800x600px)
├── states/         → Success/error feedback (300x300px)
└── placeholders/   → Default plant image (400x400px)
```

**AI Image Prompts:** See conversation history for 24 detailed prompts with exact sizes and descriptions.

---

## Pending / Backburner

### Two-Factor Authentication (2FA)

**Status:** Planned, not implemented

**User Requirements:**
- TOTP (Google Authenticator) - FREE
- Email codes - Uses existing Resend
- Backup recovery codes - FREE

**Recommendation:** Start with TOTP-only

**Plan File:** `/home/cag1145/.claude/plans/linear-puzzling-giraffe.md`

**Quick Summary:**
1. Add fields to User model: `totp_secret`, `two_fa_enabled`, `backup_codes_hash`
2. Install: `pip install pyotp qrcode[pil]`
3. Create `/backend/app/routers/two_fa.py`
4. Modify login to return temp token if 2FA enabled
5. Frontend: TwoFAVerifyPage, TwoFASetupPage, SecuritySettingsPage

---

## Current State

### Test Account
- **Email:** cgutierrez1145@gmail.com
- **Password:** NewTestPass123

### Servers
```bash
# Backend
cd /home/cag1145/DontKillIt/backend
source venv/bin/activate
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload

# Frontend
cd /home/cag1145/DontKillIt/frontend
npm run dev
```

### URLs
- **Frontend:** http://10.0.0.78:5173
- **Backend:** http://10.0.0.78:8000
- **API Docs:** http://10.0.0.78:8000/docs

### Database
- SQLite: `/backend/test.db`

---

## Next Steps (Suggested)

1. Generate and add images using AI prompts provided
2. Implement 2FA (TOTP first)
3. Add user profile/account settings page
4. Mobile responsive testing
5. Production deployment prep

---

## Files Modified This Session

```
backend/app/routers/auth.py
frontend/src/App.jsx
frontend/src/components/common/BackButton.jsx (new)
frontend/src/pages/AddPlantPage.jsx
frontend/src/pages/CareTipsPage.jsx
frontend/src/pages/EditPlantPage.jsx
frontend/src/pages/EnrichmentPage.jsx
frontend/src/pages/FeedingSchedulePage.jsx
frontend/src/pages/LoginPage.jsx
frontend/src/pages/RegisterPage.jsx
frontend/src/pages/SettingsPage.jsx
frontend/src/pages/WateringSchedulePage.jsx
frontend/src/services/api.js
frontend/public/images/ (new folder structure)
```

---

## Git

**Latest Commit:** `9ab5ffe`
**Branch:** main
**Remote:** github.com:cgutierrez1145/DontKillIt.git
