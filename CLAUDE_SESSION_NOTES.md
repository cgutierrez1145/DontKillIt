# DontKillIt - Development Session Notes

## Last Updated: 2026-01-25

---

## Completed This Session

### 5. Customer View - Hidden Admin Features
- Removed "Data Enrichment" from navigation menu (still accessible at `/enrichment` for developers)
- Added "Settings" to navigation menu for customers

**Current Customer Menu:**
- My Plants, Identify Plant, Care Tips, Watering Schedule, Feeding Schedule, Settings, Logout

---

### 4. Added Back Buttons to All Pages
**Created:** Reusable `BackButton` component at `/frontend/src/components/common/BackButton.jsx`

**Pages Updated with Back Buttons:**
- `SettingsPage.jsx`
- `CareTipsPage.jsx`
- `AddPlantPage.jsx`
- `WateringSchedulePage.jsx`
- `FeedingSchedulePage.jsx`
- `EnrichmentPage.jsx`
- `EditPlantPage.jsx`

**Pages Already Had Back Buttons:**
- PlantDetailPage, DiagnosisPage, IdentifyPlantPage, DiagnosisSelectPage
- All Preview pages (WateringPreviewPage, FeedingPreviewPage, etc.)

**Main/Auth Pages (no back button needed):**
- HomePage, PlantsPage, LoginPage, RegisterPage, ForgotPasswordPage, ResetPasswordPage

---

### 1. Fixed Login Flash/Redirect Loop
**Problem:** After entering credentials, screen would flash and return to login page.

**Root Causes Fixed:**
- `LoginPage.jsx` - Changed synchronous redirect to `useEffect` hook (line 27-32)
- `RegisterPage.jsx` - Same fix applied
- `api.js` - Fixed 401 interceptor to skip redirect for auth endpoints (line 43-51)

**Files Modified:**
- `/frontend/src/pages/LoginPage.jsx`
- `/frontend/src/pages/RegisterPage.jsx`
- `/frontend/src/services/api.js`

### 2. Fixed Password Reset Flow
**Problem:** "Failed to reset email" error and rate limiter parameter naming issue.

**Fixes:**
- `auth.py` - Renamed `http_request` to `request` and `request` to `data` for rate limiter compatibility (forgot_password and reset_password endpoints)
- Created missing `password_reset_tokens` database table
- Updated default reset URL from `localhost` to `10.0.0.78` for network access

**Files Modified:**
- `/backend/app/routers/auth.py`

### 3. Password Reset Tested Successfully
- User received reset email via Resend
- Reset link works with network IP (10.0.0.78)
- Password successfully reset and login works

---

## Pending / Backburner Items

### 1. Two-Factor Authentication (2FA)
**Status:** Planned but not implemented

**User Requirements:**
- TOTP (Google Authenticator style) - FREE
- Email codes option - Uses existing Resend
- Backup/recovery codes - FREE

**Recommendation:** Start with TOTP-only (simpler, free, more secure)

**Plan File:** `/home/cag1145/.claude/plans/linear-puzzling-giraffe.md`

**Implementation Summary:**
1. Backend:
   - Add fields to User model: `totp_secret`, `two_fa_enabled`, `two_fa_method`, `backup_codes_hash`
   - Install: `pip install pyotp qrcode[pil] cryptography`
   - Create `/backend/app/routers/two_fa.py` with endpoints
   - Modify login to return temp token if 2FA enabled

2. Frontend:
   - Install: `npm install qrcode.react`
   - Create `TwoFAVerifyPage.jsx` - code entry during login
   - Create `TwoFASetupPage.jsx` - QR code display
   - Create `SecuritySettingsPage.jsx` - manage 2FA
   - Update AuthContext for 2FA state

---

## Current User Account
- **Email:** cgutierrez1145@gmail.com
- **Password:** NewTestPass123 (set during testing)

---

## Server Status
- **Frontend:** http://10.0.0.78:5173 (Vite dev server)
- **Backend:** http://10.0.0.78:8000 (Uvicorn with reload)
- **Database:** SQLite at `/backend/test.db`

---

## Quick Start Commands
```bash
# Start backend
cd /home/cag1145/DontKillIt/backend
source venv/bin/activate
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload

# Start frontend
cd /home/cag1145/DontKillIt/frontend
npm run dev
```

---

## Notes
- Resend API is configured for emails (password reset works)
- Rate limiting is enabled on auth endpoints
- Frontend uses network IP 10.0.0.78 for mobile/external access
