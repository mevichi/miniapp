# Development Mode Setup Guide

## Overview
The app now supports a **dev mode** that allows you to test locally without Telegram authentication or actual API calls. This is perfect for rapid development and testing.

## How to Enable Dev Mode

### 1. Environment Variable
The `.env` file already contains:
```
NEXT_PUBLIC_ENV=dev
```

### 2. What Dev Mode Does
When `NEXT_PUBLIC_ENV=dev`, the application will:
- ✅ Automatically log in with mock user data (no Telegram token required)
- ✅ Skip all real API calls and return mock responses
- ✅ Provide realistic test data for all features
- ✅ Log dev mode information to the browser console

### 3. Mock User Data
In dev mode, you'll be logged in as:
- **Username**: `devuser`
- **User ID**: `123456789`
- **Starting Balance**: 500 coins
- **Starting Keys**: 10

## Features in Dev Mode

### User Authentication
- Auto-login on app load with mock credentials
- No Telegram Mini App required
- Works in standalone browser environment

### Tasks
- Mock tasks available (watch ads, referrals)
- Complete tasks instantly
- Keys are awarded on completion

### Wheel
- Spin the wheel with mock keys
- Prize results are recorded locally
- Balance updates in real-time

### Wallet
- Connect wallet addresses (mock)
- Withdraw coins (mock)
- Transaction history (mock)

### Leaderboard
- View mock leaderboard data
- See your position among other players

## Testing the App

### Start Development Server
```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

The app will automatically:
1. Load in dev mode (check console for "🔧 Development Mode Enabled")
2. Auto-login with mock user data
3. Show you the home page with test data

### What to Verify
- [ ] App loads without Telegram
- [ ] User is auto-logged in as "devuser"
- [ ] Mock balance (500) and keys (10) are displayed
- [ ] Can navigate between pages
- [ ] Can spin the wheel
- [ ] Can complete tasks
- [ ] Can interact with wallet features
- [ ] Console shows dev mode info messages

## Switching Back to Production

To test against the real backend:
1. Change `.env`:
   ```
   NEXT_PUBLIC_ENV=production
   ```
2. Open the app in Telegram Mini App
3. Real API calls will be made with your Telegram credentials

## Console Output
When running in dev mode, you'll see helpful info logs:
- 🔧 Development Mode Enabled
- 📱 Dev Mode: Using mock verification response
- ✅ Dev Mode: Task completed
- 🎡 Dev Mode: Wheel spin recorded
- 💳 Dev Mode: Wallet connected
- 💸 Dev Mode: Withdrawal requested

## Troubleshooting

### App not in dev mode?
Check that:
1. `.env` contains `NEXT_PUBLIC_ENV=dev`
2. You restarted the dev server after changing `.env`
3. Browser DevTools console shows dev mode messages

### Want to test with real API?
1. Update `.env` to `NEXT_PUBLIC_ENV=production`
2. Open app in Telegram Mini App
3. Restart dev server

## Notes
- Dev mode is automatically disabled in production builds
- Mock data is hardcoded - changes won't persist
- All API calls return instant responses in dev mode
- Perfect for UI/UX testing and feature development
