# Backend Implementation Guide

This document outlines all the backend endpoints that need to be implemented for the Gold Rush Telegram mini app.

## Database Schema

### users
```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  telegram_id BIGINT UNIQUE NOT NULL,
  username VARCHAR(255),
  balance DECIMAL(10, 2) DEFAULT 0,
  total_keys INT DEFAULT 0,
  total_spins INT DEFAULT 0,
  wallet_address VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### tasks
```sql
CREATE TABLE tasks (
  id VARCHAR(255) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  reward INT DEFAULT 1,
  type VARCHAR(50),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### user_tasks
```sql
CREATE TABLE user_tasks (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id),
  task_id VARCHAR(255) REFERENCES tasks(id),
  completed_at TIMESTAMP,
  UNIQUE(user_id, task_id)
);
```

### wheel_spins
```sql
CREATE TABLE wheel_spins (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id),
  prize VARCHAR(100),
  prize_value INT,
  keys_spent INT DEFAULT 1,
  recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### withdrawals
```sql
CREATE TABLE withdrawals (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id),
  amount DECIMAL(10, 2),
  wallet_address VARCHAR(255),
  transaction_id VARCHAR(255),
  status VARCHAR(50) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP
);
```

## API Endpoints Implementation

### 1. Authentication

**POST /api/auth/verify**
```json
Request:
{
  "initData": "string (Telegram mini app init data)",
  "userId": 123456,
  "username": "user_nickname"
}

Response:
{
  "token": "jwt_token",
  "userId": 123456,
  "username": "user_nickname",
  "balance": 100,
  "totalKeys": 5
}
```

**Implementation Notes:**
- Verify Telegram init data using their cryptographic signature
- Create user if doesn't exist
- Generate JWT token for future requests
- Token should include userId and issue timestamp

### 2. User Profile

**GET /api/user/profile**
- **Headers:** Authorization: Bearer {token}
- **Response:**
```json
{
  "userId": 123456,
  "username": "user_nickname",
  "balance": 100,
  "totalKeys": 5,
  "totalSpins": 10,
  "walletAddress": "UQAr..."
}
```

### 3. Tasks

**GET /api/tasks**
- **Headers:** Authorization: Bearer {token}
- **Response:**
```json
[
  {
    "taskId": "watch_ad_1",
    "name": "Watch Video #1",
    "description": "Watch a 5 second video to earn keys",
    "reward": 1,
    "completed": false,
    "type": "video"
  }
]
```

**Implementation Notes:**
- Return tasks that haven't been completed by the user
- Can return completed tasks with `completed: true`
- Multiple completion should be allowed unless specified otherwise

**POST /api/tasks/{taskId}/complete**
- **Headers:** Authorization: Bearer {token}
- **Response:**
```json
{
  "success": true,
  "keysEarned": 1,
  "newBalance": 101
}
```

**Implementation Notes:**
- Verify user hasn't already completed this task (or allow re-completion)
- Add keys to user.total_keys
- Update user.updated_at
- Record completion in user_tasks table

### 4. Wheel Spins

**POST /api/wheel/spin**
- **Headers:** Authorization: Bearer {token}
- **Body:**
```json
{
  "prize": "20 💰",
  "keysSpent": 1,
  "prizeValue": 20,
  "timestamp": "2024-01-16T10:00:00Z"
}
```

- **Response:**
```json
{
  "success": true,
  "newBalance": 120,
  "totalWins": 1
}
```

**Implementation Notes:**
- Deduct 1 key from user.total_keys
- Add prizeValue to user.balance
- Record spin in wheel_spins table
- Verify keys are available before processing
- Update user.total_spins

### 5. Wallet Management

**POST /api/wallet/connect**
- **Headers:** Authorization: Bearer {token}
- **Body:**
```json
{
  "walletAddress": "UQAr9VH7dJVjTwBCpPh... (TON Wallet Address)"
}
```

- **Response:**
```json
{
  "connected": true,
  "walletAddress": "UQAr...",
  "balance": 120
}
```

**Implementation Notes:**
- Validate TON wallet address format
- Store in user.wallet_address (encrypted)
- Update user.updated_at

**POST /api/wallet/withdraw**
- **Headers:** Authorization: Bearer {token}
- **Body:**
```json
{
  "amount": 50,
  "timestamp": "2024-01-16T10:00:00Z"
}
```

- **Response:**
```json
{
  "success": true,
  "transactionId": "txn_abc123...",
  "newBalance": 70,
  "withdrawnAmount": 50
}
```

**Implementation Notes:**
- Verify user has sufficient balance
- Check minimum withdrawal (10 coins)
- Check wallet is connected
- Create withdrawal record with 'pending' status
- Deduct amount from user.balance
- Call TON blockchain to transfer funds
- Update withdrawal record status when complete
- Return transaction ID to user

### 6. Leaderboard

**GET /api/leaderboard?limit=10&offset=0**
- **Headers:** Authorization: Bearer {token}
- **Response:**
```json
[
  {
    "rank": 1,
    "userId": 123456,
    "username": "top_player",
    "balance": 1000,
    "totalSpins": 100
  }
]
```

**Implementation Notes:**
- Sort by balance descending
- Include pagination support
- Can cache for 5 minutes

## Security Checklist

- [ ] All endpoints require Bearer token (except /api/auth/verify)
- [ ] Verify token validity and expiration
- [ ] Validate Telegram init data signature
- [ ] Sanitize all user inputs
- [ ] Rate limit endpoints (prevent abuse)
- [ ] Log all transactions for audit
- [ ] Encrypt sensitive data (wallet addresses)
- [ ] Use HTTPS only
- [ ] Implement CORS properly
- [ ] Add request validation

## Error Handling

All endpoints should return appropriate HTTP status codes:
- 200: Success
- 400: Bad request (invalid input)
- 401: Unauthorized (invalid/missing token)
- 403: Forbidden (insufficient balance, etc.)
- 404: Not found
- 429: Too many requests (rate limited)
- 500: Server error

Error response format:
```json
{
  "error": "Error message",
  "code": "ERROR_CODE"
}
```

## Testing the API

### Using cURL

```bash
# Verify user
curl -X POST https://api.solfren.dev/api/auth/verify \
  -H "Content-Type: application/json" \
  -d '{"initData":"...", "userId":123456, "username":"test"}'

# Get profile
curl -X GET https://api.solfren.dev/api/user/profile \
  -H "Authorization: Bearer YOUR_TOKEN"

# Get tasks
curl -X GET https://api.solfren.dev/api/tasks \
  -H "Authorization: Bearer YOUR_TOKEN"

# Complete task
curl -X POST https://api.solfren.dev/api/tasks/watch_ad_1/complete \
  -H "Authorization: Bearer YOUR_TOKEN"

# Record spin
curl -X POST https://api.solfren.dev/api/wheel/spin \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"prize":"20 💰", "keysSpent":1, "prizeValue":20}'
```

## Deployment

1. Set up database with provided schema
2. Implement all endpoints with validation
3. Add authentication middleware (JWT verification)
4. Integrate TON blockchain for withdrawals
5. Set up monitoring and logging
6. Configure CORS for your frontend domain
7. Test thoroughly before production
8. Monitor API usage and performance

## Notes

- All timestamps should be in ISO 8601 format
- Balance and amounts should support decimals
- Keys are always integers
- Prize values can be 0 (Nothing prize)
- User can withdraw partial balance
- Tasks can potentially be completed multiple times per user
