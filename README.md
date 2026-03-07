# 🎰 Telegram Mini App - Gold Rush

A Telegram mini app where users can spin wheels, watch ads to earn coins, complete tasks, and invite friends to earn rewards.

## 🚀 Quick Start

```bash
# Install dependencies
pnpm install

# Run in development
pnpm run dev
```

The app runs on `http://localhost:3000` (or next available port).

---

## ✨ Features

### 🎡 Spin the Wheel
- Interactive spinning wheel game
- Win coins (1, 2, 5, 10, 20, 50) or "Nothing"
- Earn 1 diamond per spin
- Uses weighted probabilities (1 is most common, 50 is rare)

### 📺 Watch Ads
- Earn keys by watching advertisements
- Complete ad milestones to earn bonus coins
- Daily rewards and special tasks

### 🎮 Tasks & Missions
- **Subscription Tasks**: Join Telegram channels/groups
- **Launch Bot Tasks**: Launch Telegram bots (@username or t.me links)
- **Visit Website Tasks**: Visit external URLs
- Create paid tasks for other users to complete
- Earn TON cryptocurrency for task completions

### 💰 Wallet Management
- Connect TON wallet (TonConnect)
- Withdraw coins to wallet
- Transaction history tracking
- Minimum/maximum withdrawal limits

### 🎁 Referral System
- Unique referral codes for each user
- Share via Telegram
- **Referral Rewards:**
  - Referred user: 50 coins + 1 key (instant on signup)
  - Referrer: 100 coins + 1 key (after referral completes 3 tasks)
  - Referrer: 20% ongoing of all coins the referred user earns

### 🏆 Leaderboard
- Top users by balance
- Individual user rankings

### 📊 User Profile
- Balance, keys, and diamonds tracking
- Spin statistics
- Wallet connection status
- Achievement badges

---

## 📱 Pages

| Page | Route | Description |
|------|-------|-------------|
| Home | `/` | Main dashboard with stats |
| Ads | `/ads` | Watch ads to earn keys |
| Tasks | `/tasks` | Browse and complete tasks |
| Wallet | `/wallet` | Manage TON wallet |
| Profile | `/profile` | User stats and settings |
| Wheel | `/wheel` | Spin the wheel game |
| Treasury | `/treasury` | Open treasure boxes |
| Referral | `/referral` | Invite friends and earn |

---

## 🔌 API Endpoints

### Frontend Integration
All API calls go through `src/services/api.ts` to the backend at `https://miniapp-backend-g0k3.onrender.com`

### Authentication
- `verifyUser()` - Verify Telegram user and get JWT token
- Accepts referral code on signup

### User
- `getUserProfile()` - Fetch user profile and stats
- `updateUserProfile()` - Update username

### Tasks
- `getTasks()` - Get available tasks
- `completeTask()` - Complete a task and earn rewards

### Wheel
- `spinWheel()` - Record a wheel spin result

### Wallet
- `connectWallet()` - Connect TON wallet
- `withdrawCoins()` - Withdraw coins
- `getWithdrawals()` - Get withdrawal history

### Referral
- `getReferralCode()` - Get user's referral code
- `applyReferralCode()` - Apply referral code on signup
- `getReferralStats()` - Get referral stats and referred users

### Leaderboard
- `getLeaderboard()` - Get top users

---

## 🛠 Tech Stack

- **Framework**: Next.js 16
- **Language**: TypeScript
- **Styling**: CSS Modules
- **Telegram**: @tma.js/sdk-react
- **Wallet**: TonConnect UI
- **State**: React Context

---

## 📁 Project Structure

```
miniapp-frontend/
├── src/
│   ├── app/                    # Next.js app router
│   │   ├── page.tsx            # Home page
│   │   └── ...
│   ├── components/             # React components
│   │   ├── HomePage/           # Dashboard
│   │   ├── AdsPage/            # Ad watching
│   │   ├── TasksPage/          # Task listing & creation
│   │   ├── WalletPage/         # Wallet management
│   │   ├── ProfilePage/        # User profile
│   │   ├── WheelPage/          # Spin wheel
│   │   ├── TreasuryPage/       # Treasure boxes
│   │   ├── ReferralPage/       # Referral system
│   │   ├── Navigation/         # Bottom nav
│   │   └── ...
│   ├── context/
│   │   └── AppContext.tsx      # Global state
│   ├── services/
│   │   └── api.ts              # API client
│   └── utils/
│       ├── types.ts            # TypeScript types
│       └── devMode.ts          # Dev utilities
├── public/
├── package.json
└── README.md
```

---

## 🎨 Design System

### Color Palette
- **Primary**: Blue (#3b82f6 → #60a5fa)
- **Success**: Green (#10b981 → #34d399)
- **Accent**: Amber (#f59e0b → #fbbf24)
- **Background**: Dark slate (#1e293b)

### Components
- Gradient backgrounds on cards
- Slide animations on page load
- Mobile-optimized bottom navigation
- Consistent border-radius (12-20px)

---

## 🔧 Configuration

### Environment Variables
```env
NEXT_PUBLIC_ENV=dev  # Use mock data
```

### API Base URL
Update in `src/services/api.ts`:
- Development: `http://localhost:3000`
- Production: `https://miniapp-backend-g0k3.onrender.com`

---

## 📄 License

MIT
