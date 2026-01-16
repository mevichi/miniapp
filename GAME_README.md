# Gold Rush - Telegram Mini App

A beautiful Telegram mini app that lets users earn coins by completing tasks, spinning a lucky wheel, and withdrawing to TON wallet.

## 🚀 Features

### Core Gameplay
- **📺 Tasks System**: Watch ads (5-second timeout) to earn keys
- **🎡 Lucky Wheel**: Spin the wheel using keys for coins and rewards
- **💰 Balance Management**: Track earnings and balance
- **🔗 TON Wallet Integration**: Connect wallet and withdraw coins

### Pages
- **🏠 Home**: Dashboard with quick stats and navigation
- **✓ Tasks**: View and complete tasks to earn keys
- **🎡 Wheel**: Spin the wheel (costs 1 key per spin)
- **💰 Wallet**: Connect TON wallet and withdraw coins
- **👤 Profile**: View statistics and achievements

## 🏗️ Project Structure

```
src/
├── app/
│   ├── layout.tsx           # Root layout with providers
│   ├── page.tsx             # Main app entry with AppProvider
│   ├── init-data/
│   │   ├── page.tsx         # Wheel page component
│   │   └── wheel.module.css # Wheel styling
├── components/
│   ├── AppContainer/        # Main app container with navigation
│   ├── Navigation/          # Bottom navigation bar
│   ├── HomePage/            # Home page component
│   ├── TasksPage/           # Tasks listing with ad watching
│   ├── WalletPage/          # Wallet management
│   └── ProfilePage/         # User profile & stats
├── context/
│   └── AppContext.tsx       # Global app state management
├── services/
│   └── api.ts              # Backend API integration
```

## 🔌 Backend API Integration

All backend calls are documented in `src/services/api.ts` with comments for deployment. The API base URL is `https://api.solfren.dev`.

### Available Endpoints

#### Authentication
```typescript
// POST /api/auth/verify
verifyUser(initData, userId, username)
// Returns: { token, userId, username, balance, totalKeys }
```

#### User Profile
```typescript
// GET /api/user/profile
getUserProfile(token)
// Returns: { userId, username, balance, totalKeys, totalSpins, wins }
```

#### Tasks
```typescript
// GET /api/tasks
getTasks(token)
// Returns: Array<{ taskId, name, description, reward, completed, type }>

// POST /api/tasks/{taskId}/complete
completeTask(token, taskId)
// Returns: { success, keysEarned, newBalance }
```

#### Wheel & Prizes
```typescript
// POST /api/wheel/spin
recordWheelSpin(token, prize, keysSpent, prizeValue)
// Returns: { success, newBalance, totalWins }
```

#### Wallet
```typescript
// POST /api/wallet/connect
connectWallet(token, walletAddress)
// Returns: { connected, walletAddress, balance }

// POST /api/wallet/withdraw
withdrawCoins(token, amount)
// Returns: { success, transactionId, newBalance, withdrawnAmount }
```

#### Leaderboard
```typescript
// GET /api/leaderboard?limit=10&offset=0
getLeaderboard(token, limit, offset)
// Returns: Array<{ rank, userId, username, balance, totalSpins }>
```

## 📱 UI/UX Features

- **Beautiful Gradients**: Purple gradient theme (#667eea to #764ba2)
- **Smooth Animations**: Floating titles, slide-ups, bouncing effects
- **Responsive Design**: Optimized for mobile devices
- **Loading States**: Spinners and progress indicators
- **Error Handling**: User-friendly error messages
- **Interactive Elements**: Hover effects and active states

## 🎮 Game Mechanics

### Keys System
- Complete tasks to earn keys
- Each key = 1 spin on the wheel
- Keys are deducted when spinning

### Wheel Prizes
- 10 💰, 20 💰, 50 💰, 5 💰, 100 💰 (Bonus), or Nothing
- Prize values added to user balance
- All spins are recorded on backend

### Withdrawal
- Minimum withdrawal: 10 coins
- Requires connected TON wallet
- Instant processing through backend

## 🔐 Security

- All API calls include Bearer token authentication
- User verification through Telegram init data
- Backend verification for all transactions
- Wallet addresses are encrypted and secure

## 🚀 Deployment Checklist

1. **Environment Variables**
   - Ensure `NEXT_PUBLIC_API_URL` points to https://api.solfren.dev
   - Telegram Mini App token configuration

2. **Backend Requirements**
   - Implement all endpoints in `src/services/api.ts`
   - Add database tables for: users, tasks, wheel_spins, withdrawals
   - Implement token validation middleware
   - TON wallet integration for withdrawals

3. **Frontend Build**
   ```bash
   npm install
   npm run build
   npm start
   ```

4. **Testing**
   - Test user authentication with Telegram SDK
   - Test task completion and key earning
   - Test wheel spinning with key deduction
   - Test wallet connection and withdrawal

## 💡 Implementation Notes

- **Ad Watching**: Currently uses 5-second timeout simulation. Replace with real ad provider (e.g., Google Mobile Ads) in `TasksPage.tsx`
- **Task Data**: Tasks are fetched from backend. Modify task rewards and types as needed
- **Wheel Prizes**: Prize values in `init-data/page.tsx` can be adjusted
- **Animations**: CSS animations are in respective `.module.css` files

## 🎨 Customization

### Colors
- Primary: `#667eea` → `#764ba2` (purple gradient)
- Success: `#4CAF50` (green)
- Warning: `#FFD700` (gold)
- Error: `#f44336` (red)

### Typography
- Headings: 28-36px, font-weight 800
- Body: 14px, font-weight 500
- Labels: 12-13px, font-weight 600

## 📦 Dependencies

- `@tma.js/sdk-react`: Telegram Mini App SDK
- `@telegram-apps/telegram-ui`: Telegram UI components
- `next-intl`: Internationalization
- React 18+
- Next.js 13+

## 🔧 Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## 📄 License

This project is part of the Gold Rush game platform.

## 🤝 Support

For backend integration questions, refer to API endpoints in `src/services/api.ts` with inline comments for each endpoint.
