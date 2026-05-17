# Setup Verification Checklist

## ✅ Frontend Setup Verification

Run this checklist to ensure all frontend changes are applied correctly.

---

## Step 1: Dependencies ✓

```bash
cd "d:\set-Up-login-signUp-with-node.js-\front-end"
npm list redux-persist
```

**Expected output:**
```
├── redux-persist@6.0.0
```

If not installed:
```bash
npm install redux-persist --legacy-peer-deps
```

---

## Step 2: Core Files

### **authSlice.js** ✓

Check: `src/redux/slices/authSlice.js`

**Must contain:**
```javascript
// 1. authLoading in initialState
const initialState = {
    authLoading: true,  // ← Must be here
    ...
}

// 2. authLoading in fetchCurrentUser handlers
.addCase(fetchCurrentUser.pending, (state) => {
    state.authLoading = true;  // ← Must set authLoading
})
.addCase(fetchCurrentUser.fulfilled, (state) => {
    state.authLoading = false;  // ← Must set to false
    state.isAuthenticated = true;
})
.addCase(fetchCurrentUser.rejected, (state) => {
    state.authLoading = false;  // ← Must set to false
    state.isAuthenticated = false;
})
```

### **store.js** ✓

Check: `src/redux/store.js`

**Must contain:**
```javascript
import { persistStore, persistReducer } from "redux-persist";

const authPersistConfig = {
    key: "auth",
    storage,
    whitelist: ["user", "isAuthenticated"],
    blacklist: ["token", "loading", "error", "success", "message"],
};

const persistedAuthReducer = persistReducer(authPersistConfig, authReducer);

export const persistor = persistStore(store);  // ← Must export persistor
```

### **main.jsx** ✓

Check: `src/main.jsx`

**Must contain:**
```javascript
import { PersistGate } from 'redux-persist/integration/react'
import store, { persistor } from './redux/store'

<PersistGate loading={null} persistor={persistor}>
    <App />
</PersistGate>
```

### **App.jsx** ✓

Check: `src/App.jsx`

**Must contain:**
```javascript
import { useRef } from 'react'

const authCheckRef = useRef(false)

useEffect(() => {
    if (!authCheckRef.current) {
        authCheckRef.current = true
        dispatch(fetchCurrentUser())  // ← Only runs once
    }
}, [dispatch])
```

### **PrivetRoute.jsx** ✓

Check: `src/components/routes/PrivetRoute.jsx`

**Must contain:**
```javascript
const { isAuthenticated, authLoading } = useSelector((state) => state.auth)

if (authLoading) {
    return <CircularProgress />
}

return isAuthenticated ? <Outlet /> : <Navigate to="/login" />
```

### **AuthRoute.jsx** ✓

Check: `src/components/routes/AuthRoute.jsx`

**Must contain:**
```javascript
const { isAuthenticated, authLoading } = useSelector((state) => state.auth)

if (authLoading) {
    return <CircularProgress />
}
```

---

## Step 3: New Files

### **authUtils.js** ✓

Check: `src/services/authUtils.js` exists

**Must contain helper functions:**
```javascript
export const isAuthenticated = (authState) => { ... }
export const getCurrentUser = (authState) => { ... }
export const isAuthLoading = (authState) => { ... }
```

### **Documentation Files** ✓

Check these files exist:
- [ ] `AUTH_IMPLEMENTATION.md`
- [ ] `AUTH_FIX_SUMMARY.md`
- [ ] `BACKEND_INTEGRATION.md`

---

## Step 4: API Service

Check: `src/services/api.js`

**Must have:**
```javascript
axios.defaults.withCredentials = true;

const apiClient = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true,  // ← Critical
});

export const authAPI = {
    ...
    getCurrentUser: () => apiClient.get("/auth/user"),  // ← Must exist
};
```

---

## Step 5: Browser Console Test

```bash
npm run dev
```

Open browser console (F12):

**Expected console logs:**
```
No errors ✓
No warnings about auth ✓
Redux state visible in DevTools ✓
```

**Test redux-persist:**
1. Open DevTools → Application → Local Storage
2. Look for key: `persist:auth`
3. Should contain: `{"user":null,"isAuthenticated":false}`

---

## Step 6: Login Test

1. Navigate to http://localhost:5173/login
2. Login with valid credentials
3. Check Redux DevTools:
   ```
   auth: {
       user: { id, email, name },
       isAuthenticated: true,
       authLoading: false,
       ...
   }
   ```
4. Check localStorage → `persist:auth` has user data
5. Logout and verify state is cleared

---

## Step 7: Refresh Test

1. Login successfully
2. Navigate to protected route (/dashboard)
3. **Press F5 (Refresh)**
4. **Expected behavior:**
   - Page stays on /dashboard ✓
   - Spinner shows briefly ✓
   - No redirect to /login ✓
   - User data loads ✓

**If redirect happens to /login:**
- Backend endpoint `/auth/user` may not exist
- See `BACKEND_INTEGRATION.md`

---

## Step 8: Protected Routes Test

### Test 1: Access /dashboard when logged in
```
1. Login ✓
2. Navigate to /dashboard ✓
3. Should load normally ✓
```

### Test 2: Access /dashboard when not logged in
```
1. Clear cookies (DevTools → Application → Cookies)
2. Navigate to http://localhost:5173/dashboard ✓
3. Should redirect to /login ✓
```

### Test 3: Refresh on protected route
```
1. Login and go to /dashboard ✓
2. Press F5 ✓
3. Spinner appears briefly ✓
4. Stay on /dashboard (not redirected) ✓
```

---

## Step 9: Logout Test

1. Click logout button
2. Should redirect to login ✓
3. Check Redux state: `isAuthenticated = false` ✓
4. Check localStorage: `persist:auth` cleared ✓
5. Try accessing /dashboard: Should redirect ✓

---

## Step 10: Redux DevTools Check

Install Redux DevTools Extension (if not installed):
- Chrome: [Redux DevTools](https://chrome.google.com/webstore)
- Firefox: [Redux DevTools](https://addons.mozilla.org/firefox/)

**Test:**
1. Open Redux DevTools
2. Perform login
3. Should see action: `persist/PERSIST`
4. Should see actions: `auth/login/fulfilled`
5. State should show user data

---

## Debugging Guide

### Issue: "authLoading is undefined"

**Fix:**
1. Check `authSlice.js` has `authLoading: true` in initialState
2. Rebuild: `npm run dev`
3. Hard refresh browser (Ctrl+Shift+R)

### Issue: "persistor is not exported"

**Fix:**
1. Check `store.js` has: `export const persistor = persistStore(store)`
2. Check `main.jsx` has: `import store, { persistor }`

### Issue: "localStorage not updating"

**Fix:**
1. Check DevTools middleware in `store.js` has persist actions ignored
2. Check `authPersistConfig` has `storage: storage`
3. Check `persistReducer` is wrapping authReducer

### Issue: "Spinner shows forever"

**Fix:**
1. Check backend `/auth/user` endpoint exists
2. Check backend returns 200 with user data
3. Check backend returns 401 if token invalid
4. Check browser DevTools → Network for `/auth/user` response

### Issue: "User logs out on refresh"

**Fix:**
1. Check `/auth/user` endpoint is being called
2. Check token is in httpOnly cookies
3. Check `withCredentials: true` in axios
4. Check CORS `credentials: true` on backend

---

## Complete Verification Script

Run this after setup:

```javascript
// Paste in browser console

// 1. Check redux-persist
console.log('Redux Persist in localStorage:');
console.log(JSON.parse(localStorage.getItem('persist:auth')));

// 2. Check Redux state
console.log('Redux State:', window.__REDUX_DEVTOOLS_EXTENSION__?.());

// 3. Check axios credentials
console.log('Axios withCredentials:', true);

// 4. Check authLoading
import store from './redux/store.js';
console.log('Auth state:', store.getState().auth);

// All should show correct values
```

---

## Before Deploying to Production

- [ ] All verification steps pass ✓
- [ ] Backend `/auth/user` endpoint tested ✓
- [ ] Cookies set with `secure: true` (HTTPS) ✓
- [ ] CORS origin set to production domain ✓
- [ ] Redux DevTools disabled in production ✓
- [ ] Error logging implemented ✓
- [ ] XSS and CSRF protections enabled ✓

---

## Quick Checklist Summary

- [x] redux-persist installed
- [x] authSlice.js has authLoading
- [x] store.js has persistStore
- [x] main.jsx has PersistGate
- [x] App.jsx uses useRef for single dispatch
- [x] PrivetRoute checks authLoading
- [x] AuthRoute checks authLoading
- [x] authUtils.js created
- [x] Documentation files created
- [x] API has getCurrentUser
- [x] axios has withCredentials
- [ ] Backend `/auth/user` endpoint implemented (BACKEND TASK)
- [ ] Login test passes ✓
- [ ] Refresh test passes ✓
- [ ] Protected route test passes ✓
- [ ] Logout test passes ✓

---

## Support Resources

- **Issue with Redux state?** → See `AUTH_IMPLEMENTATION.md`
- **Backend setup needed?** → See `BACKEND_INTEGRATION.md`
- **Quick overview?** → See `AUTH_FIX_SUMMARY.md`
- **Redux Persist docs?** → [Redux Persist GitHub](https://github.com/rt2zz/redux-persist)

---

**Setup complete when all steps pass! 🎉**
