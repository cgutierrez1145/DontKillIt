# Mobile Testing Setup Guide

This guide will help you test the DontKillIt app on your Android or iOS phone.

## Prerequisites

### For Android:
- Android Studio installed on your computer
- Android phone with USB debugging enabled
- USB cable to connect phone to computer

### For iOS:
- Mac computer with Xcode installed
- iOS device (iPhone/iPad)
- USB cable to connect device to Mac
- Apple Developer account (free tier works for testing)

## Quick Start

### Step 1: Update Your Local IP Address

Your phone needs to connect to your computer's backend server. First, find your computer's local IP address:

**Current IP:** `10.0.0.78`

If your IP has changed, update these files:
1. `frontend/.env.mobile` - Update `VITE_API_URL`
2. `backend/app/config.py` - Update the IP in `ALLOWED_ORIGINS`

### Step 2: Start the Backend Server

```bash
cd backend
source venv/bin/activate
python3 -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

**Important:** The server must be running with `--host 0.0.0.0` so your phone can access it!

### Step 3: Build and Test on Android

```bash
cd frontend

# Build and open in Android Studio
npm run android
```

This will:
1. Build the app with mobile configuration
2. Sync files to the Android project
3. Open Android Studio

**In Android Studio:**
1. Wait for Gradle sync to complete
2. Connect your Android phone via USB
3. Enable USB debugging on your phone (Settings → Developer Options)
4. Click the green "Run" button (▶)
5. Select your phone from the device list
6. The app will install and launch on your phone!

### Step 4: Build and Test on iOS

```bash
cd frontend

# Build and open in Xcode
npm run ios
```

This will:
1. Build the app with mobile configuration
2. Sync files to the iOS project
3. Open Xcode

**In Xcode:**
1. Connect your iPhone via USB
2. Select your phone as the target device (top toolbar)
3. Sign the app:
   - Click on "App" in the left sidebar
   - Go to "Signing & Capabilities"
   - Check "Automatically manage signing"
   - Select your team (or create a free Apple Developer account)
4. Click the "Run" button (▶)
5. If prompted, trust the developer on your phone (Settings → General → Device Management)
6. The app will install and launch on your phone!

## Troubleshooting

### Cannot Connect to Backend

**Problem:** App shows connection errors or can't load data.

**Solution:**
1. Check that both devices are on the same WiFi network
2. Verify backend is running with `--host 0.0.0.0`
3. Test backend from your phone's browser: `http://10.0.0.78:8000/docs`
4. Check firewall settings - allow port 8000
5. Update IP address in `.env.mobile` if it changed

### Android Build Errors

**Problem:** Gradle sync fails or build errors.

**Solution:**
1. Make sure you have JDK 17 installed
2. In Android Studio: File → Invalidate Caches → Invalidate and Restart
3. Try: `cd android && ./gradlew clean`

### iOS Certificate/Signing Errors

**Problem:** Code signing error or untrusted developer.

**Solution:**
1. Make sure you're signed in with an Apple ID in Xcode
2. On your phone: Settings → General → VPN & Device Management → Trust your developer profile
3. For free accounts, you can only have 3 apps installed at once

### Camera Not Working

**Problem:** Camera permission denied or not working.

**Solution:**
1. Check app permissions in phone settings
2. Grant camera and photo library access
3. Restart the app after granting permissions

## Development Workflow

### Making Changes and Testing

When you make code changes:

```bash
# For Android
npm run sync:android

# For iOS
npm run sync:ios
```

Then in Android Studio or Xcode, just click Run again.

### Debugging

**Android:**
- Use Chrome DevTools: `chrome://inspect` in Chrome browser
- Or use Android Studio's Logcat

**iOS:**
- Use Safari Developer Tools (Safari → Develop → [Your Phone])
- Or use Xcode's console

## Network Configuration

### Same WiFi Network
Both your computer and phone must be on the same WiFi network. The app uses:
- Backend API: `http://10.0.0.78:8000`
- Web assets: Bundled in the app

### Testing on Different Network
If you need to test on a different network or deploy for real users, you'll need to:
1. Deploy the backend to a server with a public IP or domain
2. Update `VITE_API_URL` to point to that server
3. Rebuild the mobile app

## Build Scripts Reference

- `npm run build:mobile` - Build web app for mobile
- `npm run android` - Build and open Android Studio
- `npm run ios` - Build and open Xcode
- `npm run sync` - Sync web assets to both platforms
- `npm run sync:android` - Sync to Android only
- `npm run sync:ios` - Sync to iOS only

## What's Configured

### Capacitor Plugins Installed:
- **Camera** - Take photos for plant diagnosis and identification
- **Filesystem** - Save and manage plant photos

### CORS Configuration:
The backend accepts requests from:
- Mobile app schemes (capacitor://, ionic://)
- Local network IP (10.0.0.78)
- Localhost (for web development)

### Features Available on Mobile:
✅ User authentication
✅ Plant management (add, edit, delete)
✅ Photo upload for diagnosis
✅ Plant identification
✅ Watering schedules
✅ Feeding schedules
✅ Care recommendations
✅ Room analysis
✅ Did you know tips

## Next Steps

1. **Test all features** on your physical device
2. **Check camera functionality** for plant photos
3. **Test offline behavior** (if implemented)
4. **Consider adding push notifications** (requires additional setup)
5. **Optimize performance** for mobile

## Publishing to App Stores

When ready to publish:

### Android (Google Play):
1. Generate a signed APK/AAB
2. Create Google Play Developer account ($25 one-time)
3. Follow Google Play upload process

### iOS (App Store):
1. Join Apple Developer Program ($99/year)
2. Create app in App Store Connect
3. Archive and upload via Xcode

See Capacitor docs for detailed publishing guides:
https://capacitorjs.com/docs/deployment/android
https://capacitorjs.com/docs/deployment/ios

## Support

- Capacitor Docs: https://capacitorjs.com/docs
- Android Studio: https://developer.android.com/studio
- Xcode: https://developer.apple.com/xcode/
