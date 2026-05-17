# Authentication Architecture - Visual Guide

## 🏗️ Complete Auth Flow Diagram

### Login Flow
```
┌─────────────────────────────────────────────────────────────────────┐
│                           LOGIN FLOW                                │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  User enters credentials                                            │
│         ↓                                                           │
│  loginUser() thunk dispatched                                      │
│         ↓                                                           │
│  POST /auth/login → Backend                                        │
│         ↓                                                           │
│  Backend validates credentials                                     │
│         ↓                                                           │
│  Backend creates JWT                                               │
│         ↓                                                           │
│  Backend sets httpOnly cookie (secure)                            │
│         ↓                                                           │
│  Response: { user: {...}, message: "Success" }                   │
│         ↓                                                           │
│  Redux state updated:                                              │
│  ├─ user = {id, email, name}                                      │
│  ├─ isAuthenticated = true                                         │
│  └─ loading = false                                                │
│         ↓                                                           │
│  redux-persist saves to localStorage                              │
│         ↓                                                           │
│  Navbar updates (shows logout button)                             │
│         ↓                                                           │
│  Protected routes accessible                                       │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

### Refresh Flow
```
┌──────────────────────────────────────────────────────────────────────┐
│                          REFRESH FLOW                                │
├──────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  User presses F5 (page refresh)                                     │
│         ↓                                                            │
│  Redux state LOST (empty)                                           │
│         ↓                                                            │
│  PersistGate rehydrates from localStorage                          │
│         ↓                                                            │
│  Redux state RESTORED instantly:                                   │
│  ├─ user = {cached user data}                                      │
│  └─ isAuthenticated = true                                          │
│         ↓                                                            │
│  App.jsx mounts, useEffect runs                                    │
│         ↓                                                            │
│  fetchCurrentUser() dispatched                                     │
│  (authLoading = true, show spinner)                               │
│         ↓                                                            │
│  GET /auth/user → Backend                                          │
│         ↓                                                            │
│  Backend reads token from httpOnly cookie                         │
│         ↓                                                            │
│  Backend validates JWT                                             │
│         ↓                                                            │
│  Backend returns user data (or 401 if invalid)                    │
│         ↓                                                            │
│  IF 200: Redux updated with fresh user data                       │
│  IF 401: isAuthenticated = false (redirect to login)             │
│         ↓                                                            │
│  authLoading = false (hide spinner)                               │
│         ↓                                                            │
│  Routes render (no flickering, smooth experience)                 │
│                                                                       │
└──────────────────────────────────────────────────────────────────────┘
```

### Logout Flow
```
┌──────────────────────────────────────────────────────────────────────┐
│                          LOGOUT FLOW                                 │
├──────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  User clicks logout button                                          │
│         ↓                                                            │
│  logoutUser() thunk dispatched                                     │
│         ↓                                                            │
│  POST /auth/logout → Backend                                       │
│         ↓                                                            │
│  Backend clears httpOnly cookie                                   │
│         ↓                                                            │
│  Response: { message: "Logged out" }                             │
│         ↓                                                            │
│  Redux state cleared:                                               │
│  ├─ user = null                                                     │
│  ├─ isAuthenticated = false                                        │
│  └─ authChecked = true                                             │
│         ↓                                                            │
│  redux-persist clears localStorage                                │
│         ↓                                                            │
│  AuthRoute checks: not authenticated → redirect                  │
│         ↓                                                            │
│  Navigate to /login                                                │
│         ↓                                                            │
│  User sees login page                                              │
│                                                                       │
└──────────────────────────────────────────────────────────────────────┘
```

---

## 🔐 Token Storage Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                    TOKEN STORAGE STRATEGY                           │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │ Browser httpOnly Cookie (Set by Backend)                     │  │
│  ├──────────────────────────────────────────────────────────────┤  │
│  │                                                              │  │
│  │ Token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...           │  │
│  │ ├─ httpOnly: true      ✓ JS cannot access (XSS proof)      │  │
│  │ ├─ Secure: true        ✓ HTTPS only (production)           │  │
│  │ ├─ SameSite: Strict    ✓ CSRF protection                   │  │
│  │ └─ MaxAge: 7 days      ✓ Expiration time                   │  │
│  │                                                              │  │
│  │ Auto-sent with requests (axios withCredentials: true)      │  │
│  │ Never accessible to JavaScript                             │  │
│  │ Only server can read/modify                                │  │
│  │                                                              │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │ Redux State (Frontend)                                       │  │
│  ├──────────────────────────────────────────────────────────────┤  │
│  │                                                              │  │
│  │ {                                                           │  │
│  │   user: {                                                   │  │
│  │     id: "123",                                             │  │
│  │     email: "user@example.com",                            │  │
│  │     name: "John Doe"                                       │  │
│  │   },                                                        │  │
│  │   isAuthenticated: true,                                   │  │
│  │   authLoading: false,                                      │  │
│  │   error: null,                                             │  │
│  │   loading: false                                           │  │
│  │ }                                                            │  │
│  │                                                              │  │
│  │ ✓ Accessible to JS (for UI state)                         │  │
│  │ ✓ Persisted to localStorage (survives refresh)            │  │
│  │ ✓ Token NOT stored here (security)                        │  │
│  │                                                              │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │ localStorage via redux-persist                              │  │
│  ├──────────────────────────────────────────────────────────────┤  │
│  │                                                              │  │
│  │ Key: "persist:auth"                                        │  │
│  │ Value: {                                                    │  │
│  │   user: {cached user data},                               │  │
│  │   isAuthenticated: true                                    │  │
│  │ }                                                            │  │
│  │                                                              │  │
│  │ ✓ Persists Redux state across page refreshes              │  │
│  │ ✓ Instant rehydration (no API call needed immediately)    │  │
│  │ ✓ Token NOT stored (XSS safe)                             │  │
│  │ ✓ Cleared on logout                                        │  │
│  │                                                              │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 🔄 Request/Response Cycle

```
CLIENT REQUEST                          SERVER RESPONSE
┌──────────────────┐                  ┌──────────────────┐
│  Frontend        │                  │  Backend         │
│                  │                  │                  │
│  GET /auth/user  │─────────────────→│ Read token from  │
│                  │  + Cookie        │ httpOnly cookie  │
│  (axios sends    │  (auto-sent)      │                  │
│   cookies        │                  │ Validate JWT     │
│   automatically) │                  │                  │
│                  │←─────────────────│ Return user data │
│  200: User data  │  + Set-Cookie    │ or 401 Unauth    │
│  401: Unauthorized                  │                  │
│                  │                  │                  │
└──────────────────┘                  └──────────────────┘


┌────────────────────────────────────────────────────────┐
│ KEY: axios withCredentials: true                       │
│                                                        │
│ This header tells the browser:                        │
│ ✓ Send cookies with this request                     │
│ ✓ Accept cookies in response                         │
│ ✓ Frontend can access response data                  │
│                                                        │
│ Without this:                                         │
│ ✗ Cookies not sent                                   │
│ ✗ Request fails with 401 Unauthorized                │
│ ✗ User appears logged out                            │
└────────────────────────────────────────────────────────┘
```

---

## 📊 State Management Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                   REDUX STATE SHAPE                          │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  auth: {                                                     │
│    user: null | {...}              // User data or null      │
│    token: null                      // Deprecated, in cookie │
│    isAuthenticated: boolean         // Login status          │
│    authChecked: boolean             // Auth check completed  │
│    authLoading: boolean             // Auth check in progress│
│    loading: boolean                 // API call in progress  │
│    error: string | null             // Error message         │
│    success: boolean                 // Success flag          │
│    message: string                  // Status message        │
│  }                                                            │
│                                                              │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ PERSISTENCE (via redux-persist)                      │   │
│  ├─────────────────────────────────────────────────────┤   │
│  │                                                     │   │
│  │ WHITELIST (saved to localStorage):                 │   │
│  │ ✓ user                                             │   │
│  │ ✓ isAuthenticated                                  │   │
│  │                                                     │   │
│  │ BLACKLIST (not saved):                             │   │
│  │ ✗ token (in httpOnly cookie)                       │   │
│  │ ✗ loading (temporary state)                        │   │
│  │ ✗ error (temporary state)                          │   │
│  │ ✗ success (temporary state)                        │   │
│  │ ✗ message (temporary state)                        │   │
│  │                                                     │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

---

## 🚦 Route Protection Logic

```
REQUEST TO /dashboard
│
├─→ PrivetRoute rendered
│
├─→ Check authLoading
│   │
│   ├─ true  → Show spinner (auth check in progress)
│   │         Wait for authLoading = false
│   │
│   └─ false → Continue
│
├─→ Check isAuthenticated
│   │
│   ├─ true  → Render <Dashboard />
│   │
│   └─ false → Navigate to /login
│
└─→ Done
```

---

## 🔗 Component Connection Map

```
main.jsx (App Entry)
    │
    ├─→ Provider (Redux)
    │
    ├─→ PersistGate (redux-persist)
    │   └─→ Rehydrates Redux state from localStorage
    │
    └─→ App.jsx
        │
        ├─→ useEffect: Dispatch fetchCurrentUser()
        │   └─→ Validates token with backend
        │       └─→ authLoading: true → false
        │
        ├─→ Routes (React Router)
        │
        ├─→ AuthRoute (routes accessible when NOT logged in)
        │   ├─→ /login
        │   ├─→ /signup
        │   └─→ /forgot-password
        │
        ├─→ PrivetRoute (routes accessible when logged in)
        │   ├─→ /dashboard
        │   ├─→ /home
        │   └─→ /profile/:userId
        │
        └─→ Public Routes (always accessible)
            ├─→ /
            ├─→ /landing
            └─→ /profile

Components that check auth:
├─→ Navbar: useSelector(state.auth)
├─→ PrivetRoute: useSelector(state.auth.authLoading, isAuthenticated)
└─→ AuthRoute: useSelector(state.auth.authLoading, isAuthenticated)
```

---

## ⏱️ Timeline: What Happens on Refresh

```
TIME  EVENT                              STATE
────────────────────────────────────────────────────────
 0ms  User presses F5
      └─ Page unloads, then reloads

 1ms  main.jsx renders
      ├─ Redux store created (empty state)
      └─ PersistGate mounts

 2ms  localStorage rehydration
      ├─ Redux restored from localStorage
      ├─ user = {cached data}
      ├─ isAuthenticated = true
      └─ authLoading = true

 3ms  App component mounts
      └─ useEffect runs

 4ms  fetchCurrentUser() dispatched
      ├─ authLoading = true (spinner shown)
      └─ GET /auth/user sent to backend

100ms Backend validates token
      ├─ Reads httpOnly cookie
      ├─ Verifies JWT signature
      └─ Returns user data

101ms fetchCurrentUser.fulfilled
      ├─ user = fresh data from backend
      ├─ isAuthenticated = true
      └─ authLoading = false

102ms Routes render
      ├─ PrivetRoute checks authLoading
      ├─ authLoading = false ✓
      ├─ isAuthenticated = true ✓
      └─ Renders protected component

103ms User sees dashboard (no redirect)
      ✓ Stay logged in after refresh
      ✓ No manual re-login needed
```

---

## 🎯 Decision Tree: Is User Logged In?

```
                    START
                      │
                      ↓
         Is authLoading === true?
         │
         ├─ YES → Show spinner, wait
         │
         └─ NO → Continue
                   │
                   ↓
         Is isAuthenticated === true?
         │
         ├─ YES → Is user object populated?
         │        │
         │        ├─ YES → User is logged in ✓
         │        │        (show navbar logout button)
         │        │        (allow access to /dashboard)
         │        │
         │        └─ NO → User is logged out
         │               (should not happen)
         │
         └─ NO → User is logged out
                 (show login page)
                 (block access to /dashboard)
```

---

## 🔌 API Integration Points

```
Frontend                           Backend
────────────────────────────────────────────────────
axios client
├─ POST /auth/login           →  Create JWT
├─ POST /auth/register        →  Create user account
├─ POST /auth/logout          →  Clear cookie
├─ GET /auth/user             →  Validate token
├─ POST /auth/otp-verify      →  Verify OTP
├─ POST /auth/forgot-password →  Send reset link
└─ POST /auth/change-password →  Update password

All requests:
- Include httpOnly cookie automatically (withCredentials: true)
- No manual Authorization header needed
- CORS must allow credentials: true
```

---

## ✨ Summary

**The fix creates a seamless auth experience:**

1. **Login** → Token in cookie, user in Redux + localStorage
2. **Navigation** → Token auto-sent with requests
3. **Refresh** → localStorage restored instantly, token validated with backend
4. **Logout** → Everything cleared (cookie + Redux + localStorage)

**Security maintained:**
- Token in httpOnly cookie (XSS proof)
- No token in Redux/localStorage
- Session validated on mount
- CSRF protected by SameSite=Strict

**User experience:**
- No flashing/redirects on refresh
- Instant UI update from localStorage
- Smooth loading spinner during validation
- Zero manual re-login needed
