# Testing & Deployment Guide

## Local Testing

### Prerequisites
- Node.js 18+
- npm or pnpm
- Telegram Mini App configured

### Setup

1. **Install dependencies**
```bash
cd nextjs-template
npm install
# or
pnpm install
```

2. **Environment Variables**
Create `.env.local`:
```env
NEXT_PUBLIC_API_URL=https://api.solfren.dev
NEXT_PUBLIC_TELEGRAM_BOT_TOKEN=your_bot_token
```

3. **Run development server**
```bash
npm run dev
# App will be available at http://localhost:3000
```

4. **Test in Telegram Mini App**
- Open Telegram
- Search for your mini app bot
- Click to launch the app
- Test will run in iframe context

## Features Testing Checklist

### Authentication
- [ ] User successfully verified on app load
- [ ] Telegram user data properly captured
- [ ] Token stored and used in subsequent requests
- [ ] Logout clears session

### Home Page
- [ ] Display user stats (keys, balance, spins)
- [ ] Navigation to all pages works
- [ ] Quick action cards functional
- [ ] Responsive on mobile

### Tasks Page
- [ ] Tasks load from backend
- [ ] Ad watching simulation (5s timer) works
- [ ] Progress bar fills correctly
- [ ] "Claim" button appears after timer completes
- [ ] Keys awarded after completion
- [ ] Completed tasks marked properly
- [ ] Multiple tasks can be completed

### Wheel Page
- [ ] Displays current key count
- [ ] Spin button disabled when no keys
- [ ] Smooth wheel rotation animation
- [ ] Prize selected randomly
- [ ] Result displayed with correct color
- [ ] Key deducted after spin
- [ ] Balance updated with prize value
- [ ] Backend records spin correctly

### Wallet Page
- [ ] Connect wallet form works
- [ ] Wallet address displays when connected
- [ ] Withdrawal form validates input
- [ ] Min/max amounts enforced
- [ ] Quick amount buttons functional
- [ ] Successful withdrawal shows message
- [ ] Balance updates after withdrawal

### Profile Page
- [ ] User info displays correctly
- [ ] Stats show accurate numbers
- [ ] Achievements unlock based on activity
- [ ] Logout button functional

### Navigation
- [ ] All menu items functional
- [ ] Active page indicator works
- [ ] Smooth transitions between pages
- [ ] Bottom nav sticky on scroll

## API Testing

### Mock Backend for Development

Create `__mocks__/api.ts` to test without backend:

```typescript
// Mock task responses
export const getTasks = async (token: string) => {
  return [
    {
      taskId: 'watch_ad_1',
      name: 'Watch Ad #1',
      description: 'Watch a video to earn keys',
      reward: 1,
      completed: false,
      type: 'video',
    },
    {
      taskId: 'watch_ad_2',
      name: 'Watch Ad #2',
      description: 'Watch another video',
      reward: 1,
      completed: false,
      type: 'video',
    },
  ];
};

// Mock spin recording
export const recordWheelSpin = async (
  token: string,
  prize: string,
  keysSpent: number,
  prizeValue: number
) => {
  return {
    success: true,
    newBalance: Math.floor(Math.random() * 500) + 50,
    totalWins: Math.floor(Math.random() * 20) + 1,
  };
};
```

### Using Postman

1. **Set up collection**
   - Base URL: https://api.solfren.dev
   - Authentication: Bearer Token

2. **Test endpoints**
   - First call `/api/auth/verify` to get token
   - Copy token to Authorization header
   - Test remaining endpoints

3. **Example requests**

**POST /api/auth/verify**
```json
{
  "initData": "query_id=AAHdF6IQAAAAA90XohC...",
  "userId": 123456,
  "username": "testuser"
}
```

**GET /api/tasks**
- Headers: `Authorization: Bearer {token}`

**POST /api/tasks/watch_ad_1/complete**
- Headers: `Authorization: Bearer {token}`

**POST /api/wheel/spin**
```json
{
  "prize": "50 💰",
  "keysSpent": 1,
  "prizeValue": 50,
  "timestamp": "2024-01-16T10:30:00Z"
}
```

## Performance Optimization

### Frontend
- [ ] Images optimized with Next.js Image component
- [ ] CSS modules used for component styling
- [ ] Animations use CSS transforms (GPU accelerated)
- [ ] Lazy loading for route components
- [ ] Memoization for expensive computations

### Backend
- [ ] Database queries optimized with indexes
- [ ] Caching for frequently accessed data
- [ ] Rate limiting implemented
- [ ] Response compression enabled
- [ ] CDN for static assets

## Production Deployment

### Vercel (Recommended)

1. **Connect repository**
```bash
npm install -g vercel
vercel
```

2. **Set environment variables**
   - NEXT_PUBLIC_API_URL
   - NEXT_PUBLIC_TELEGRAM_BOT_TOKEN

3. **Deploy**
```bash
vercel --prod
```

### Docker Deployment

1. **Create Dockerfile**
```dockerfile
FROM node:18-alpine

WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm && pnpm install

COPY . .
RUN pnpm build

EXPOSE 3000
CMD ["pnpm", "start"]
```

2. **Build and run**
```bash
docker build -t gold-rush .
docker run -p 3000:3000 gold-rush
```

### Environment Variables

**Production**
```env
NEXT_PUBLIC_API_URL=https://api.solfren.dev
NEXT_PUBLIC_TELEGRAM_BOT_TOKEN=prod_token
NODE_ENV=production
```

**Staging**
```env
NEXT_PUBLIC_API_URL=https://staging-api.solfren.dev
NEXT_PUBLIC_TELEGRAM_BOT_TOKEN=staging_token
NODE_ENV=production
```

## Monitoring

### Frontend Metrics
- Page load time
- Time to interactive
- User engagement metrics
- Error tracking (Sentry)

### Backend Metrics
- API response time
- Error rates
- Database performance
- Transaction volume

### Tools
- Vercel Analytics
- Sentry for error tracking
- DataDog or similar for APM

## Common Issues & Solutions

### Issue: "Not authenticated" error
- **Solution**: Clear local storage, refresh app, re-authenticate

### Issue: Wheel not spinning
- **Solution**: Check if user has keys, refresh page, check console for errors

### Issue: Keys not updating
- **Solution**: Wait for API response, check network tab, verify token

### Issue: Slow page load
- **Solution**: Check network tab for slow API calls, optimize images, enable compression

## Support & Documentation

- **API Documentation**: See [BACKEND_IMPLEMENTATION.md](./BACKEND_IMPLEMENTATION.md)
- **Game Features**: See [GAME_README.md](./GAME_README.md)
- **Code Structure**: See [Project Structure](#project-structure)

## Next Steps

1. Implement backend with provided API specs
2. Connect real Telegram Mini App bot
3. Integrate TON wallet for real withdrawals
4. Set up monitoring and analytics
5. Deploy to production
6. Gather user feedback
7. Iterate and improve features
