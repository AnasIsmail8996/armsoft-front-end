# Backend Integration Guide - Authentication

## Critical: /auth/user Endpoint

Your frontend now calls `GET /auth/user` on app startup to validate the session. This endpoint **MUST** exist and work correctly.

---

## Endpoint Requirements

### **GET /auth/user** (or /auth/me)

**Purpose:** Validate token from httpOnly cookie and return user data

**Expected Request:**
```
GET /auth/user
Cookie: token=eyJhbGciOiJIUzI1NiIs...
Content-Type: application/json
```

**Expected Response (200 - Success):**
```json
{
    "user": {
        "id": "user_id_123",
        "email": "user@example.com",
        "name": "John Doe",
        "createdAt": "2024-05-16T10:00:00Z"
    },
    "message": "User authenticated"
}
```

**Error Response (401 - Unauthorized):**
```json
{
    "message": "Unauthorized"
}
```

---

## Node.js/Express Implementation

### **1. Middleware - Verify Token from Cookie**

```javascript
// middleware/authMiddleware.js

import jwt from 'jsonwebtoken';

export const verifyToken = (req, res, next) => {
    try {
        // Read token from httpOnly cookie
        const token = req.cookies.token;

        if (!token) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        // Verify JWT
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // Attach user to request
        next();
    } catch (error) {
        console.error('Token verification failed:', error);
        return res.status(401).json({ message: 'Unauthorized' });
    }
};
```

### **2. Route Handler**

```javascript
// routes/auth.js

import { Router } from 'express';
import { verifyToken } from '../middleware/authMiddleware.js';
import User from '../models/User.js';

const router = Router();

// Get current user
router.get('/user', verifyToken, async (req, res) => {
    try {
        // req.user comes from middleware (decoded JWT)
        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(401).json({ message: 'User not found' });
        }

        res.json({
            user: {
                id: user._id,
                email: user.email,
                name: user.name,
                createdAt: user.createdAt,
            },
            message: 'User authenticated',
        });
    } catch (error) {
        console.error('Error fetching user:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

export default router;
```

### **3. Login - Set httpOnly Cookie**

```javascript
// routes/auth.js (Login endpoint)

router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validate credentials
        const user = await User.findOne({ email });
        if (!user || !(await user.comparePassword(password))) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Create JWT
        const token = jwt.sign(
            { id: user._id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        // Set httpOnly cookie
        res.cookie('token', token, {
            httpOnly: true,           // JS cannot access
            secure: true,             // HTTPS only (set to false for localhost)
            sameSite: 'Strict',       // CSRF protection
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        });

        res.json({
            user: {
                id: user._id,
                email: user.email,
                name: user.name,
            },
            message: 'Login successful',
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});
```

### **4. Logout - Clear Cookie**

```javascript
router.post('/logout', (req, res) => {
    try {
        // Clear the httpOnly cookie
        res.clearCookie('token');
        res.json({ message: 'Logged out successfully' });
    } catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});
```

---

## Express App Configuration

```javascript
// app.js (or main server file)

import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import authRoutes from './routes/auth.js';

const app = express();

// Middleware
app.use(express.json());
app.use(cookieParser()); // IMPORTANT: Parse cookies

// CORS configuration
app.use(cors({
    origin: ['http://localhost:5173', 'https://yourdomain.com'],
    credentials: true,  // IMPORTANT: Allow credentials (cookies)
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Routes
app.use('/api/auth', authRoutes);

export default app;
```

---

## Cookie Configuration Explained

```javascript
res.cookie('token', token, {
    httpOnly: true,           // ✅ Secure from XSS attacks
    secure: true,             // ✅ HTTPS only (production)
    sameSite: 'Strict',       // ✅ CSRF protection
    maxAge: 7 * 24 * 60 * 60 * 1000, // ✅ Expires in 7 days
});
```

| Option | Purpose | Value |
|--------|---------|-------|
| `httpOnly` | Block JS access | Always `true` |
| `secure` | HTTPS only | `true` (prod), `false` (localhost) |
| `sameSite` | CSRF protection | `'Strict'` (recommended) |
| `maxAge` | Expiration time | 7 days (or your choice) |
| `path` | Cookie scope | `/` (default) |
| `domain` | Cookie domain | Default is current domain |

---

## Development vs Production

### **Development (localhost)**
```javascript
res.cookie('token', token, {
    httpOnly: true,
    secure: false,  // ⚠️ HTTP works locally
    sameSite: 'Lax',
    maxAge: 7 * 24 * 60 * 60 * 1000,
});
```

### **Production (HTTPS)**
```javascript
res.cookie('token', token, {
    httpOnly: true,
    secure: true,   // ✅ HTTPS only
    sameSite: 'Strict',
    maxAge: 7 * 24 * 60 * 60 * 1000,
});
```

---

## CORS Headers

**Frontend makes requests with `withCredentials: true`**

**Backend MUST respond with:**
```
Access-Control-Allow-Credentials: true
Access-Control-Allow-Origin: http://localhost:5173
```

**Express CORS config:**
```javascript
app.use(cors({
    origin: ['http://localhost:5173', 'https://yourdomain.com'],
    credentials: true,  // ✅ This allows credentials
}));
```

---

## Testing the Endpoint

### **Using Postman**

1. Login first:
   - Method: POST
   - URL: http://localhost:3000/api/auth/login
   - Body: `{ "email": "user@test.com", "password": "password" }`
   - Response includes Set-Cookie header

2. Get user:
   - Method: GET
   - URL: http://localhost:3000/api/auth/user
   - Postman automatically sends cookies (check "Send postman cookies")
   - Should return user data

### **Using cURL**

```bash
# Login and save cookies
curl -c cookies.txt -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@test.com","password":"password"}'

# Use cookies in next request
curl -b cookies.txt http://localhost:3000/api/auth/user
```

### **Using Frontend Code**

```javascript
// This will work once backend is set up
const response = await fetch('http://localhost:3000/api/auth/user', {
    credentials: 'include',  // Send cookies
});
const data = await response.json();
console.log(data.user);
```

---

## Error Handling

### **401 Unauthorized Responses**

Frontend will:
1. Receive 401 from /auth/user
2. Set `isAuthenticated = false`
3. Redirect to /login

**Example error handler in axios:**
```javascript
apiClient.interceptors.response.use(
    response => response,
    error => {
        if (error.response?.status === 401) {
            // Token invalid/expired
            // Frontend redux will handle redirect
        }
        return Promise.reject(error);
    }
);
```

---

## Database Schema Example

```javascript
// models/User.js

const UserSchema = new Schema({
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    name: {
        type: String,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

// Method to verify password
UserSchema.methods.comparePassword = async function (password) {
    return bcrypt.compare(password, this.password);
};

export default model('User', UserSchema);
```

---

## Environment Variables

**Backend .env:**
```
JWT_SECRET=your_super_secret_key_change_this
MONGODB_URI=mongodb://localhost:27017/your_db
NODE_ENV=development
```

**Frontend .env:**
```
VITE_BASE_URI=http://localhost:3000/api
```

---

## Verification Checklist

- [ ] POST /auth/login sets httpOnly cookie
- [ ] GET /auth/user reads token from cookie
- [ ] GET /auth/user returns user data on valid token
- [ ] GET /auth/user returns 401 on invalid/expired token
- [ ] POST /auth/logout clears cookie
- [ ] CORS allows credentials: true
- [ ] cookie-parser middleware installed and used
- [ ] JWT secret is strong and secure
- [ ] secure: true in production (HTTPS)
- [ ] sameSite: 'Strict' for CSRF protection

---

## Common Backend Issues

### ❌ "Cannot read property 'token' of undefined"
**Solution:** Ensure `cookie-parser` middleware is used before routes

```javascript
app.use(cookieParser());  // Before routes
app.use('/api/auth', authRoutes);
```

### ❌ "CORS error: Credentials are not included"
**Solution:** Set `credentials: true` in CORS config

```javascript
app.use(cors({
    credentials: true,  // ✅ Enable credentials
    origin: 'http://localhost:5173',
}));
```

### ❌ Cookie not being sent from frontend
**Solution:** Ensure axios has `withCredentials: true`

```javascript
// This is already set in api.js but verify:
axios.defaults.withCredentials = true;
```

### ❌ Token expires too quickly
**Solution:** Adjust `expiresIn` in JWT creation

```javascript
const token = jwt.sign(payload, secret, {
    expiresIn: '7d'  // Increase if needed
});
```

---

## Security Best Practices

✅ **Always use HTTPS in production**
```javascript
secure: true  // Forces HTTPS only
```

✅ **Never log sensitive data**
```javascript
// ❌ Don't do this:
console.log(token);

// ✅ Do this:
console.log('Token created for user:', userId);
```

✅ **Validate all inputs**
```javascript
if (!email || !password) {
    return res.status(400).json({ message: 'Missing fields' });
}
```

✅ **Use strong JWT secrets**
```javascript
// ❌ Bad: 'secret'
// ✅ Good: 'a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0'
```

---

## Summary

Your backend needs:

1. ✅ Cookie parser middleware
2. ✅ CORS with `credentials: true`
3. ✅ POST /auth/login - Sets httpOnly cookie
4. ✅ GET /auth/user - Validates token, returns user
5. ✅ POST /auth/logout - Clears cookie
6. ✅ Token verification middleware

Once this is set up, frontend will:
- Stay logged in after refresh ✅
- Automatically validate session on mount ✅
- Redirect to login if token invalid ✅

**Test it and everything should work!** 🎉
