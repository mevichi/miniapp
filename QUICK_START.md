# 🚀 Quick Start Guide - Gold Rush Mini App

A complete Telegram mini app with task system, spinning wheel, and TON wallet integration.

## ⚡ Quick Setup (5 minutes)

### 1. Install & Run
```bash
cd nextjs-template
npm install
npm run dev
```
App runs on `http://localhost:3000`

### 2. Test with Telegram
- Open Telegram
- Launch your mini app bot
- App auto-authenticates with Telegram user data

### 3. Test Features

**👤 Home Page**
- View your stats: Keys, Balance, Total Spins
- Quick navigation to other features

**✓ Tasks Page** 
- Watch 5-second "ads" (simulated)
- Earn 1 key per ad watched
- Complete multiple times

**🎡 Wheel Page**
- Use keys to spin the wheel (1 key = 1 spin)
- Win coins: 10, 20, 50, 5, 100, or Nothing
- Results recorded in backend

**💰 Wallet Page**
- Connect your TON wallet address
- Withdraw coins (min 10)
- Track withdrawal history

**👤 Profile Page**
- View achievements
- Check statistics
- Logout option

## 📁 Key Files to Know

| File | Purpose |
|------|---------|
| `src/services/api.ts` | All backend API calls with comments |
| `src/context/AppContext.tsx` | Global state management |
| `src/components/*/` | Page components (Home, Tasks, Wheel, Wallet, Profile) |
| `src/app/page.tsx` | Main app entry point |
| `GAME_README.md` | Full feature documentation |
| `BACKEND_IMPLEMENTATION.md` | Backend API specs |

## 🔧 Customization

### Change Wheel Prizes
Edit `src/app/init-data/page.tsx`:
```typescript
const prizes = [
  { label: '10 💰', color: '#FF6B6B', value: 10 },
  { label: '20 💰', color: '#4ECDC4', value: 20 },
  // Add/modify prizes here
];
```

### Change Colors
Primary gradient colors in any `.module.css`:
```css
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
```

### Change API Endpoint
Update `src/services/api.ts`:
```typescript
const API_BASE_URL = 'https://api.solfren.dev';
```

### Modify Task Reward
Backend returns tasks - adjust reward amounts there

## 🔌 Backend Integration

### Without Backend (Development)
Create mock data in `src/services/api.ts`:
```typescript
export const getTasks = async (token: string) => {
  return [
    { taskId: 'test1', name: 'Test Task', reward: 1, completed: false },
  ];
};
```

### With Real Backend
1. Ensure backend implements all endpoints in `BACKEND_IMPLEMENTATION.md`
2. Update `API_BASE_URL` in `src/services/api.ts`
3. All calls include `Authorization: Bearer {token}` header
4. Backend verifies Telegram init data

## 📱 Mobile Responsiveness

App automatically adapts to:
- Mobile (< 480px): Optimized layout
- Tablet (480-768px): Enhanced spacing
- Desktop (> 768px): Full features

## 🎯 Flow Diagram

```
User Launches App
    ↓
[Authentication]
    ↓
Home Page (Dashboard)
    ├→ Tasks Page → Watch Ad → Earn Key
    ├→ Wheel Page → Use Key → Win Coins
    ├→ Wallet Page → Connect TON → Withdraw
    └→ Profile Page → View Stats → Achievements
```

## 🐛 Debugging

### Check Browser Console
```javascript
// View current user state
console.log('User:', user);

// Check token
console.log('Token:', token);

// Network tab to see API calls
```

### Common Issues

**"Need Keys" button disabled?**
- Complete some tasks first

**Spin not working?**
- Ensure you have at least 1 key
- Check console for API errors

**Withdrawal failing?**
- Connect wallet first
- Ensure balance > 10
- Check API errors

## 📊 State Management

Using React Context (`AppContext.tsx`):
```typescript
const { user, token, addKeys, spendKeys, updateBalance } = useApp();

// Available:
user.balance          // Current coins
user.totalKeys        // Available keys
user.totalSpins       // Total spins done
user.walletAddress    // Connected wallet
```

## 🌐 Environment Variables

Create `.env.local`:
```env
NEXT_PUBLIC_API_URL=https://api.solfren.dev
NEXT_PUBLIC_TELEGRAM_BOT_TOKEN=your_bot_token
```

## 📦 Build for Production

```bash
npm run build
npm start
```

Or deploy to Vercel:
```bash
npm install -g vercel
vercel --prod
```

## 💡 Pro Tips

1. **Test on Real Telegram**: Use Telegram Web to test actual mini app
2. **Check Network Tab**: Verify API calls in browser DevTools
3. **Use Mock Data**: Test UI without backend using mock API
4. **Check Animations**: View smooth animations in slow 3G mode
5. **Mobile First**: Always test on mobile-sized viewport first

## 🚀 Next Steps

1. ✅ Setup & test locally
2. 🔌 Implement backend endpoints
3. 🧪 Test with real Telegram bot
4. 📱 Deploy frontend to Vercel
5. 🚀 Deploy backend API
6. 🎉 Launch!

## 📞 Need Help?

- **API Issues?** → Check `BACKEND_IMPLEMENTATION.md`
- **Feature Questions?** → See `GAME_README.md`
- **Deployment Help?** → Read `TESTING_DEPLOYMENT.md`
- **Code Structure?** → Explore `src/` folder

## 🎨 Beautiful Features Included

✨ **Visual**
- Gradient backgrounds
- Smooth animations
- Responsive design
- Loading states
- Error messages

🎮 **Gameplay**
- Task system with rewards
- Lucky wheel with 6 prizes
- Balance tracking
- Achievement system
- Leaderboard ready

🔐 **Security**
- Telegram verification
- JWT authentication
- Token-based API calls
- Backend transaction verification

💼 **Professional**
- Production-ready code
- Well-documented
- Error handling
- Mobile optimized
- Analytics ready

---

**Made with ❤️ for Telegram Mini Apps**

Start by running: `npm run dev` 🚀
