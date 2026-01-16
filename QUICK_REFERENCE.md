# 🎯 Quick Reference Card

## 🚀 Start Here (60 seconds)

```bash
# 1. Install
cd nextjs-template && npm install

# 2. Run
npm run dev

# 3. Open
http://localhost:3000
```

## 📖 Documentation Quick Links

| Document | Purpose | Time |
|----------|---------|------|
| [INDEX.md](./INDEX.md) | 📍 YOU ARE HERE - Navigation hub | 2 min |
| [QUICK_START.md](./QUICK_START.md) | ⚡ Get running in 5 minutes | 5 min |
| [IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md) | ✅ What was built | 10 min |
| [GAME_README.md](./GAME_README.md) | 🎮 Game features explained | 10 min |
| [FILE_STRUCTURE.md](./FILE_STRUCTURE.md) | 📁 Project structure | 10 min |
| [ARCHITECTURE.md](./ARCHITECTURE.md) | 🏛️ System design | 15 min |
| [BACKEND_IMPLEMENTATION.md](./BACKEND_IMPLEMENTATION.md) | 🔌 API & Database | 20 min |
| [TESTING_DEPLOYMENT.md](./TESTING_DEPLOYMENT.md) | 🧪 Testing & Deploy | 15 min |

## 🎮 Game Features at a Glance

```
┌─ HOME (Dashboard)
├─ TASKS (Earn Keys)
│  └─ Watch 5s Ad → +1 Key
├─ WHEEL (Play Game)
│  └─ Use 1 Key → Win Coins
├─ WALLET (Withdraw)
│  └─ Connect → Withdraw Coins
└─ PROFILE (Stats)
   └─ View Achievements
```

## 🔌 API Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/auth/verify` | Authenticate user |
| GET | `/api/user/profile` | Get user data |
| GET | `/api/tasks` | List tasks |
| POST | `/api/tasks/{id}/complete` | Complete task |
| POST | `/api/wheel/spin` | Record spin |
| POST | `/api/wallet/connect` | Connect wallet |
| POST | `/api/wallet/withdraw` | Withdraw coins |

## 💾 Database Tables

```sql
users              # User data (balance, keys, wallet)
tasks              # Available tasks
user_tasks         # Task completion tracking
wheel_spins        # Spin history
withdrawals        # Withdrawal history
```

## 🎨 Color Palette

```
Primary:   #667eea → #764ba2 (Purple gradient)
Success:   #4CAF50 (Green)
Warning:   #FFD700 (Gold)
Error:     #f44336 (Red)
```

## 📁 Key Files

```
Frontend Entry:        src/app/page.tsx
State Management:      src/context/AppContext.tsx
API Client:            src/services/api.ts
Wheel Page:            src/app/init-data/page.tsx
Home Page:             src/components/HomePage.tsx
Tasks Page:            src/components/TasksPage.tsx
Wallet Page:           src/components/WalletPage.tsx
Profile Page:          src/components/ProfilePage.tsx
Navigation:            src/components/Navigation.tsx
```

## 🔑 Important Numbers

```
Spin Duration:         4 seconds
Ad Watch Duration:     5 seconds
Minimum Withdrawal:    10 coins
Prize Values:          0, 5, 10, 20, 50, 100 coins
Number of Prizes:      6 segments
Number of Pages:       5 pages
API Endpoints:         7+ endpoints
Documentation Files:   8 files
```

## 🛠️ Customization Hotspots

| What | Where | Line |
|------|-------|------|
| Wheel prizes | `src/app/init-data/page.tsx` | 24-30 |
| Task rewards | Backend API | N/A |
| Colors | `*.module.css` | First gradient |
| Spin speed | `src/app/init-data/page.tsx` | 60 |
| Min withdrawal | `src/components/WalletPage.tsx` | ~30 |

## 🔐 Security Checklist

- ✅ Telegram init data verification
- ✅ JWT token authentication
- ✅ Authorization headers
- ✅ Input validation
- ✅ Error message sanitization
- ✅ No localStorage for sensitive data
- ✅ Backend verification required

## 🧪 Test with These Commands

```bash
# Development server
npm run dev

# Build
npm run build

# Production server
npm start

# Lint
npm run lint
```

## 🚀 Deployment Paths

```
Frontend:  npm run build → Vercel / Docker
Backend:   Implement API → Cloud Platform
Database:  PostgreSQL / MySQL → Managed Service
Blockchain: TON SDK → Mainnet / Testnet
```

## 📊 Feature Checklist

### Home Page
- ✅ User stats (Keys, Balance, Spins)
- ✅ Quick action cards
- ✅ Navigation links

### Tasks Page
- ✅ Task list from backend
- ✅ Ad watching (5s timeout)
- ✅ Key rewards

### Wheel Page
- ✅ Interactive SVG wheel
- ✅ Smooth animations
- ✅ Prize rewards
- ✅ Backend recording

### Wallet Page
- ✅ Wallet connection
- ✅ Withdrawal form
- ✅ Balance updates

### Profile Page
- ✅ User statistics
- ✅ Achievements
- ✅ Logout

## 🎯 What Happens When...

| Action | Result | Where |
|--------|--------|-------|
| User opens app | Auto-authenticates | AppContainer.tsx |
| User watches ad | Timer counts down | TasksPage.tsx |
| User clicks claim | Keys added | AppContext.tsx |
| User spins wheel | Animation plays | init-data/page.tsx |
| User wins | Balance updates | AppContext.tsx |
| User withdraws | Coins transferred | Backend |

## 🔄 Request Flow

```
User Action
    ↓
Component calls useApp()
    ↓
AppContext updates state
    ↓
API service sends request
    ↓
Backend processes
    ↓
Response updates state
    ↓
UI re-renders
```

## ⚠️ Common Issues

| Issue | Solution |
|-------|----------|
| Wheel won't spin | Check if user has keys |
| Tasks not loading | Check API response |
| Wallet not connecting | Validate address format |
| Keys not updating | Refresh page, check console |
| Slow animations | Check browser performance |

## 📱 Responsive Breakpoints

```
Mobile:    < 480px
Tablet:    480px - 768px
Desktop:   > 768px
```

## 💡 Pro Tips

1. **Test locally first**: `npm run dev`
2. **Check console**: Always check browser DevTools
3. **Use Postman**: Test API endpoints independently
4. **Start simple**: Implement one feature at a time
5. **Use mock data**: Test UI without backend
6. **Read comments**: Every API call is documented
7. **Follow patterns**: Copy existing components

## 🎓 Learning Resources

- **Frontend**: React docs, TypeScript handbook
- **Backend**: Node.js, Express docs
- **Database**: PostgreSQL tutorial
- **Blockchain**: TON documentation
- **Mini Apps**: Telegram Mini Apps docs

## 📞 Getting Help

1. **First question?** → Check [INDEX.md](./INDEX.md)
2. **How to start?** → [QUICK_START.md](./QUICK_START.md)
3. **How it works?** → [ARCHITECTURE.md](./ARCHITECTURE.md)
4. **Need API details?** → [BACKEND_IMPLEMENTATION.md](./BACKEND_IMPLEMENTATION.md)
5. **How to deploy?** → [TESTING_DEPLOYMENT.md](./TESTING_DEPLOYMENT.md)

## ✨ Summary

**What you have:**
- ✅ Complete frontend (5 pages)
- ✅ Beautiful UI with animations
- ✅ State management
- ✅ API client ready
- ✅ 8 documentation files

**What to do next:**
1. Run: `npm run dev`
2. Test: In Telegram mini app
3. Implement: Backend API
4. Deploy: Frontend + Backend

**You're ready to build!** 🚀

---

**Start**: [QUICK_START.md](./QUICK_START.md)  
**Questions**: Check [INDEX.md](./INDEX.md)  
**Code**: Explore `src/` folder  
**Deploy**: Follow [TESTING_DEPLOYMENT.md](./TESTING_DEPLOYMENT.md)  

Good luck! 🎉
