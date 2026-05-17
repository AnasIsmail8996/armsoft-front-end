# Troubleshooting Guide - Authentication System

## 🔴 Issue 1: User Still Logs Out on Refresh

### Symptom
- Login successful
- Navigate to /dashboard
- Press F5 (refresh)
- Redirected to /login ❌

### Root Cause
Usually one of these:
1. Backend `/auth/user` endpoint doesn't exist
2. Token not being sent in cookies
3. Backend not validating token from cookies
4. Network request failing silently

### Solution Checklist

**Step 1: Verify Backend Endpoint**
```bash
# Test with curl (from backend directory)
curl -X GET http://localhost:3000/api/auth/user \
  -H "Cookie: token=<YOUR_TOKEN_HERE>"
```

Expected response:
```json
{
  "user": { "id": "...", "email": "...", "name": "..." },
  "message": "User authenticated"
}
```

If you get `404 Not Found` → Endpoint doesn't exist
If you get `401 Unauthorized` → Token validation failing

**Step 2: Check Network Request**
1. Open DevTools (F12)
2. Go to Network tab
3. Refresh page
4. Look for `/auth/user` request
5. Check Response status:
   - 200 ✓ OK
   - 401 ✗ Unauthorized (token invalid)
   - 404 ✗ Not Found (endpoint missing)
   - 500 ✗ Server error (check backend logs)

**Step 3: Check Cookies**
1. DevTools → Application → Cookies
2. Look for `token` cookie
3. Should have:
   - httpOnly ✓
   - Secure (if HTTPS) ✓
   - Value is not empty ✓

**Step 4: Check Frontend Logs**
1. DevTools → Console
2. Look for errors
3. Search for "auth", "token", "401"
4. Check Redux state:
   ```javascript
   // Paste in console
   window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__?.() // Check if available
   ```

**Step 5: Verify axios Config**
Check `src/services/api.js`:
```javascript
// Must have:
axios.defaults.withCredentials = true;

const apiClient = axios.create({
    withCredentials: true,  // ← Critical
});
```

If missing, add it and restart dev server.

**Step 6: Backend Verification**
Check your backend:
```javascript
// Must have cookie-parser middleware
import cookieParser from 'cookie-parser';
app.use(cookieParser());  // Before routes!

// Must have CORS with credentials
app.use(cors({
    credentials: true,  // ← Critical
    origin: 'http://localhost:5173',
}));

// Must read token from cookie
router.get('/auth/user', (req, res) => {
    const token = req.cookies.token;  // ← From cookie!
    // ... validate token ...
});
```

---

## 🔴 Issue 2: Spinner Shows Forever

### Symptom
- Refresh page
- Spinner appears
- Never disappears ❌

### Root Cause
- `/auth/user` request never completes
- Request hangs or times out
- Backend is down or very slow

### Solution

**Step 1: Check Network**
1. DevTools → Network tab
2. Refresh page
3. Look for `/auth/user` request
4. Check if it's pending (yellow) or completed
5. If pending: Backend is slow or not responding

**Step 2: Test Endpoint Directly**
```bash
# In terminal
curl http://localhost:3000/api/auth/user -v

# Should see response within 1 second
# If hangs: Backend not running or route missing
```

**Step 3: Check Backend Logs**
1. Look at backend terminal/logs
2. Check for errors in `/auth/user` route
3. Verify database connection is working
4. Check if JWT verification is hanging

**Step 4: Add Timeout**
If backend is slow, add timeout in frontend:
```javascript
// src/redux/slices/authSlice.js
// Modify fetchCurrentUser:

export const fetchCurrentUser = createAsyncThunk(
    'auth/fetchCurrentUser',
    async (_, { rejectWithValue }) => {
        try {
            const timeout = new Promise((_, reject) =>
                setTimeout(() => reject(new Error('Timeout')), 5000)
            );
            const response = await Promise.race([
                authAPI.getCurrentUser(),
                timeout,
            ]);
            return response.data;
        } catch (error) {
            return rejectWithValue({
                message: 'Failed to load current user'
            });
        }
    }
);
```

**Step 5: Restart Everything**
1. Stop frontend dev server (Ctrl+C)
2. Stop backend server (Ctrl+C)
3. Clear browser cache (DevTools → Storage → Clear all)
4. Start backend first
5. Start frontend second
6. Test again

---

## 🔴 Issue 3: "authLoading is undefined"

### Symptom
```
Error: Cannot read property 'authLoading' of undefined
```

### Root Cause
- `authSlice.js` not updated with `authLoading`
- Redux state not updated
- Dev server not restarted

### Solution

**Step 1: Verify authSlice.js**
```bash
# Search for authLoading in file
grep -n "authLoading" src/redux/slices/authSlice.js
```

Should find multiple matches:
- In `initialState`
- In `fetchCurrentUser.pending`
- In `fetchCurrentUser.fulfilled`
- In `fetchCurrentUser.rejected`

If not found: File not updated correctly

**Step 2: Clear Dependencies Cache**
```bash
# Windows
rmdir /s /q node_modules
npm install --legacy-peer-deps

# Linux/Mac
rm -rf node_modules
npm install
```

**Step 3: Restart Dev Server**
```bash
npm run dev
```

**Step 4: Hard Refresh Browser**
- Ctrl+Shift+R (not just F5)
- Or DevTools → Network tab → Disable cache

---

## 🔴 Issue 4: Redux State Not Persisting

### Symptom
- Login → Works ✓
- Close tab and reopen
- Redux state is empty ❌
- User logged out

### Root Cause
- redux-persist not working
- localStorage disabled
- Store not configured correctly

### Solution

**Step 1: Check redux-persist Installation**
```bash
npm list redux-persist
```

Should show `redux-persist@6.0.0` or similar

If not:
```bash
npm install redux-persist --legacy-peer-deps
```

**Step 2: Verify store.js Configuration**
Check `src/redux/store.js`:
```javascript
import { persistStore, persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage";

const authPersistConfig = {
    key: "auth",
    storage,  // ← Must be included
    whitelist: ["user", "isAuthenticated"],
};

const persistedAuthReducer = persistReducer(
    authPersistConfig,
    authReducer
);

// ... in configureStore ...
const store = configureStore({
    reducer: {
        auth: persistedAuthReducer,  // ← Must use persistedAuthReducer
        // ...
    },
});

export const persistor = persistStore(store);  // ← Must export
```

**Step 3: Verify main.jsx Configuration**
Check `src/main.jsx`:
```javascript
import { PersistGate } from 'redux-persist/integration/react'
import store, { persistor } from './redux/store'  // ← Must import persistor

// In JSX:
<PersistGate loading={null} persistor={persistor}>
    <App />
</PersistGate>
```

If missing: Add it and restart

**Step 4: Check localStorage**
1. DevTools → Application → Local Storage
2. Look for `persist:auth` key
3. Should contain JSON with user data:
   ```json
   {
     "user": { "id": "...", "email": "..." },
     "isAuthenticated": true
   }
   ```

If missing:
- Login again
- Should appear immediately after login
- If not: redux-persist not working

**Step 5: Check Browser Settings**
Some browsers block localStorage:
1. DevTools → Application → Local Storage
2. Try clicking in address bar
3. Check for "Block" notifications
4. Allow localStorage

**Step 6: Debug localStorage**
Paste in browser console:
```javascript
// Check if localStorage works
console.log('localStorage enabled:', !!localStorage);

// Check persist:auth
console.log('persist:auth:', localStorage.getItem('persist:auth'));

// Check size
console.log('localStorage size:', new Blob(Object.values(localStorage)).size);
```

---

## 🔴 Issue 5: CORS Error or Cookies Not Sent

### Symptom
```
Access to XMLHttpRequest has been blocked by CORS policy
The value of the 'Access-Control-Allow-Credentials' header must be 'true'
```

### Root Cause
- Backend CORS config missing `credentials: true`
- Frontend missing `withCredentials: true`
- Origin mismatch

### Solution

**Step 1: Fix Backend CORS**
```javascript
// Backend (Express/Node.js)

import cors from 'cors';

app.use(cors({
    origin: ['http://localhost:5173', 'https://yourdomain.com'],
    credentials: true,  // ← CRITICAL
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));
```

**Step 2: Fix Frontend axios**
Check `src/services/api.js`:
```javascript
// Must have:
axios.defaults.withCredentials = true;

const apiClient = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true,  // ← CRITICAL
});
```

**Step 3: Check Origin Matches**
Backend CORS origin should match where frontend is running:
- Frontend: `http://localhost:5173`
- Backend origin: must include `http://localhost:5173`

Get frontend URL:
```javascript
console.log(window.location.origin);
```

Add it to backend CORS:
```javascript
cors({
    origin: window.location.origin,  // Dynamic
    credentials: true,
})
```

**Step 4: Restart Both Servers**
1. Stop backend
2. Stop frontend
3. Start backend
4. Start frontend
5. Test again

---

## 🔴 Issue 6: "Hydration Mismatch" Error

### Symptom
```
Hydration mismatch: expected a <div> but found a <span>
```

### Root Cause
- PersistGate loading prop not set correctly
- App tries to render before rehydration completes

### Solution

**Fix main.jsx:**
```javascript
// WRONG:
<PersistGate persistor={persistor}>
    <App />
</PersistGate>

// CORRECT:
<PersistGate loading={null} persistor={persistor}>
    <App />
</PersistGate>
```

The `loading={null}` tells PersistGate to not render anything while rehydrating.

---

## 🔴 Issue 7: Token Expiry

### Symptom
- User logged in for a while
- Suddenly logged out
- Getting 401 errors

### Root Cause
- JWT token expired
- Backend token expiry is short
- No refresh token mechanism

### Solution

**Option 1: Increase Token Expiry**
Backend:
```javascript
const token = jwt.sign(payload, secret, {
    expiresIn: '7d'  // Increase from current value
});
```

**Option 2: Implement Refresh Token**
1. Backend issues two tokens:
   - access token (15 min expiry)
   - refresh token (7 days, in httpOnly cookie)

2. Frontend interceptor:
   ```javascript
   apiClient.interceptors.response.use(
       response => response,
       async error => {
           if (error.response?.status === 401) {
               // Try to refresh token
               const refreshed = await refreshToken();
               if (refreshed) {
                   return apiClient.request(error.config);
               }
               // Redirect to login
               window.location.href = '/login';
           }
           return Promise.reject(error);
       }
   );
   ```

**Option 3: Show Warning Before Expiry**
```javascript
// Add timer in App.jsx
useEffect(() => {
    const timer = setTimeout(() => {
        console.warn('Session expiring soon');
        // Show modal to user
    }, 6.5 * 60 * 1000); // 30 sec before expiry

    return () => clearTimeout(timer);
}, []);
```

---

## 🔴 Issue 8: Dev Server Port Conflicts

### Symptom
```
EADDRINUSE: address already in use
```

### Root Cause
- Another process using port 5173 or 3000

### Solution

**Windows:**
```bash
# Find process using port 5173
netstat -ano | findstr :5173

# Kill process (replace PID)
taskkill /PID <PID> /F
```

**Linux/Mac:**
```bash
# Find and kill
lsof -ti:5173 | xargs kill -9
```

**Or change port:**
```bash
# Frontend
npm run dev -- --port 5174

# Backend (in .env or code)
PORT=3001
```

---

## 🔴 Issue 9: "Cannot find module 'redux-persist'"

### Symptom
```
Module not found: Error: Can't resolve 'redux-persist'
```

### Root Cause
- redux-persist not installed
- node_modules corrupted

### Solution

```bash
# Clear everything
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps

# Or just install redux-persist
npm install redux-persist --legacy-peer-deps

# Restart dev server
npm run dev
```

---

## 🔴 Issue 10: User Data Not Loading from Backend

### Symptom
- Spinner shows
- User data doesn't load
- 200 response but user is null

### Root Cause
- Backend returns wrong format
- User object not included in response

### Solution

**Check Backend Response**
Backend should return:
```json
{
  "user": {
    "id": "123",
    "email": "user@example.com",
    "name": "John Doe"
  },
  "message": "User authenticated"
}
```

**NOT:**
```json
{
  "id": "123",  // Wrong! Should be nested in "user"
  "email": "user@example.com"
}
```

**Fix Backend:**
```javascript
router.get('/auth/user', verifyToken, async (req, res) => {
    const user = await User.findById(req.user.id);
    res.json({
        user: {  // ← Wrap in "user" key
            id: user._id,
            email: user.email,
            name: user.name,
        },
        message: 'User authenticated',
    });
});
```

**Check Frontend authSlice**
Should access `action.payload.user`:
```javascript
.addCase(fetchCurrentUser.fulfilled, (state, action) => {
    state.user = action.payload.user;  // ← Extract user
    state.isAuthenticated = true;
})
```

---

## 📋 Quick Diagnostic Script

Paste in browser console:
```javascript
console.group('🔍 Auth Diagnostics');

// 1. Check Redux state
const authState = localStorage.getItem('persist:auth');
console.log('Persisted auth:', authState ? JSON.parse(authState) : 'None');

// 2. Check cookies
console.log('Cookies:', document.cookie);

// 3. Check axios config
console.log('Axios withCredentials:', true);

// 4. Test API
fetch('http://localhost:3000/api/auth/user', {
    credentials: 'include'
}).then(r => r.json()).then(console.log).catch(console.error);

console.groupEnd();
```

---

## 🎯 Before Contacting Support

1. ✓ Checked all browser console errors
2. ✓ Verified `/auth/user` endpoint exists (tested with curl)
3. ✓ Confirmed token is in httpOnly cookie
4. ✓ Restarted both frontend and backend
5. ✓ Hard refreshed browser (Ctrl+Shift+R)
6. ✓ Cleared localStorage and cookies
7. ✓ Verified CORS settings
8. ✓ Checked network tab for request details
9. ✓ Read backend logs for errors
10. ✓ Ran diagnostic script above

If still not working: Share backend `/auth/user` response

---

**Most common fix: Restart servers and hard refresh browser! 🔄**
