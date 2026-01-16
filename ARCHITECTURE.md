# Architecture Overview

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    TELEGRAM MINI APP                        │
│                  (nextjs-template)                          │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                      Frontend Layer                         │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  src/app/page.tsx (Main Entry)                        │ │
│  │  └─ AppProvider + AppContainer                        │ │
│  └────────────────────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  Navigation (Bottom Bar)                              │ │
│  │  ├─ Home    ├─ Tasks   ├─ Wheel   ├─ Wallet  ├─ Profile
│  └────────────────────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  Page Components                                       │ │
│  │  ├─ HomePage.tsx      (Dashboard)                     │ │
│  │  ├─ TasksPage.tsx     (Task List + Ad Watching)      │ │
│  │  ├─ Wheel Page        (Spin Mechanism)               │ │
│  │  ├─ WalletPage.tsx    (Wallet Connection)            │ │
│  │  └─ ProfilePage.tsx   (User Stats)                   │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                    State Management                         │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  AppContext.tsx (React Context)                       │ │
│  │  ├─ user state (balance, keys, wallet)               │ │
│  │  ├─ token state (JWT)                                │ │
│  │  ├─ login/logout functions                           │ │
│  │  ├─ key/balance update functions                     │ │
│  │  └─ task completion handlers                         │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                    API Layer                                │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  src/services/api.ts (API Client)                     │ │
│  │  ├─ verifyUser()                                      │ │
│  │  ├─ getTasks()                                        │ │
│  │  ├─ completeTask()                                    │ │
│  │  ├─ recordWheelSpin()                                 │ │
│  │  ├─ connectWallet()                                   │ │
│  │  ├─ withdrawCoins()                                   │ │
│  │  └─ getLeaderboard()                                  │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                   Backend API                               │
│              https://api.solfren.dev                        │
│                                                             │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  Authentication                                       │ │
│  │  POST /api/auth/verify → JWT Token                   │ │
│  └────────────────────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  User Management                                      │ │
│  │  GET /api/user/profile → User Data                   │ │
│  └────────────────────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  Tasks System                                         │ │
│  │  GET /api/tasks → Task List                          │ │
│  │  POST /api/tasks/{id}/complete → Keys Reward         │ │
│  └────────────────────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  Wheel & Prizes                                       │ │
│  │  POST /api/wheel/spin → Record Prize & Balance       │ │
│  └────────────────────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  Wallet Management                                    │ │
│  │  POST /api/wallet/connect → Save Wallet              │ │
│  │  POST /api/wallet/withdraw → Process Withdrawal      │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                    Database Layer                           │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  PostgreSQL / MySQL                                   │ │
│  │  ├─ users (balance, keys, wallet)                    │ │
│  │  ├─ tasks (available tasks)                          │ │
│  │  ├─ user_tasks (completion tracking)                 │ │
│  │  ├─ wheel_spins (spin history)                       │ │
│  │  └─ withdrawals (transaction history)                │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                  Blockchain (TON)                           │
│           Wallet Withdrawals & Transfers                    │
└─────────────────────────────────────────────────────────────┘
```

## 📊 Data Flow

### User Authentication Flow
```
1. App Loads
   ↓
2. getInitData() from Telegram SDK
   ↓
3. POST /api/auth/verify (initData, userId, username)
   ↓
4. Backend verifies signature
   ↓
5. Backend creates/updates user
   ↓
6. Backend returns JWT token
   ↓
7. Token stored in AppContext
   ↓
8. All future requests include token in Authorization header
```

### Task Completion Flow
```
1. User on Tasks Page
   ↓
2. User clicks "Watch Ad"
   ↓
3. 5-second timer starts
   ↓
4. Progress bar fills
   ↓
5. User clicks "Claim" button
   ↓
6. POST /api/tasks/{taskId}/complete (token)
   ↓
7. Backend validates user hasn't completed before (optional)
   ↓
8. Backend updates user.total_keys += reward
   ↓
9. Backend returns { keysEarned, newBalance }
   ↓
10. Frontend updates AppContext
    ↓
11. UI shows success message
```

### Wheel Spin Flow
```
1. User on Wheel Page
   ↓
2. User clicks "Spin Now!"
   ↓
3. Check: user.totalKeys >= 1
   ↓
4. Deduct 1 key from UI (spendKeys())
   ↓
5. Start wheel animation
   ↓
6. Select random prize
   ↓
7. Stop wheel on prize
   ↓
8. POST /api/wheel/spin (prize, keysSpent, prizeValue)
   ↓
9. Backend deducts key from user
   ↓
10. Backend adds prize value to user balance
    ↓
11. Backend returns { newBalance, totalWins }
    ↓
12. Frontend updates balance
    ↓
13. Show celebration animation
```

### Withdrawal Flow
```
1. User on Wallet Page
   ↓
2. User enters amount
   ↓
3. Validation:
   - User has wallet connected?
   - Amount > minimum (10)?
   - Balance >= amount?
   ↓
4. User clicks "Withdraw"
   ↓
5. POST /api/wallet/withdraw (amount)
   ↓
6. Backend validates:
   - Balance sufficient
   - Wallet address valid
   - Not exceeding limits
   ↓
7. Backend deducts from user balance
   ↓
8. Backend initiates TON transfer
   ↓
9. Backend creates withdrawal record
   ↓
10. Backend returns { transactionId, newBalance }
    ↓
11. Frontend updates balance
    ↓
12. Show success message with transaction ID
```

## 🔄 Component Interaction

```
AppContainer
├── Navigation (props: currentPage, onNavigate)
└── Page Renderer
    ├── HomePage
    │   └─ useApp: { user, onNavigate }
    │
    ├── TasksPage
    │   ├─ useApp: { user, token, addKeys }
    │   └─ API: getTasks, completeTask
    │
    ├── WheelPage (src/app/init-data/page.tsx)
    │   ├─ useApp: { user, token, spendKeys, updateBalance }
    │   └─ API: recordWheelSpin
    │
    ├── WalletPage
    │   ├─ useApp: { user, token, connectWallet, withdrawCoins }
    │   └─ API: connectWallet, withdrawCoins
    │
    └── ProfilePage
        └─ useApp: { user, logout }
```

## 🔐 Security Layers

```
Client (Frontend)
    ↓
1. Telegram Init Data Verification
    ↓
2. JWT Token Storage (In Memory)
    ↓
3. Token Included in All API Calls
    ↓
Backend (API)
    ↓
4. Telegram Signature Verification
    ↓
5. JWT Token Validation
    ↓
6. Rate Limiting
    ↓
7. Input Validation
    ↓
8. Business Logic Verification
    ↓
Database
    ↓
9. Encrypted Wallet Addresses
    ↓
10. Transaction Logging
    ↓
Blockchain (TON)
    ↓
11. Smart Contract Verification
    ↓
12. Immutable Transaction Records
```

## 📈 Scalability Considerations

### Current Design
- **Single Page App**: All pages in one context
- **Client-side State**: React Context (suitable for current scale)
- **Direct API Calls**: No middleware layer

### Future Scaling
- **Redux/Zustand**: For complex state management
- **API Caching**: Redis for frequently accessed data
- **Background Jobs**: For withdrawal processing
- **Load Balancing**: Multiple API servers
- **Database Sharding**: By user ID or time period
- **CDN**: For static assets
- **Message Queue**: For asynchronous processing

## 🎯 Performance Metrics

### Frontend
- **FCP** (First Contentful Paint): < 1s
- **LCP** (Largest Contentful Paint): < 2s
- **CLS** (Cumulative Layout Shift): < 0.1
- **Bundle Size**: ~150KB (gzipped)

### Backend (Target)
- **API Response Time**: < 200ms
- **Database Query Time**: < 50ms
- **Throughput**: 1000+ req/sec
- **Availability**: 99.9%

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend Framework** | Next.js 13+ |
| **UI Library** | React 18+ |
| **State Management** | React Context |
| **Styling** | CSS Modules |
| **Mobile SDK** | @tma.js/sdk-react |
| **HTTP Client** | Fetch API |
| **Backend** | Node.js/Express or Python/FastAPI |
| **Database** | PostgreSQL/MySQL |
| **Cache** | Redis (optional) |
| **Blockchain** | TON SDK |
| **Deployment** | Vercel (Frontend) + Cloud (Backend) |

## 📱 Client Capabilities

- **Desktop/Mobile**: Responsive design
- **Offline**: Limited (requires online for API)
- **Progressive Enhancement**: Works in iframe
- **Accessibility**: Keyboard navigation, ARIA labels
- **Internationalization**: Ready for i18n

---

This architecture is designed to be:
- ✅ Scalable (can grow with user base)
- ✅ Maintainable (clear separation of concerns)
- ✅ Secure (multiple security layers)
- ✅ Fast (optimized performance)
- ✅ Reliable (error handling throughout)
