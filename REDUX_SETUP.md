# Redux Toolkit Integration - Frontend Architecture

## 📁 Folder Structure

```
src/
├── redux/
│   ├── store.js                 # Redux store configuration
│   └── slices/
│       ├── authSlice.js         # Authentication state management
│       └── notesSlice.js        # Notes state management
├── services/
│   └── api.js                   # Axios configuration & API calls
├── components/
│   ├── pages/
│   │   ├── Signup.jsx           # Redux integrated
│   │   ├── Login.jsx            # Redux integrated
│   │   ├── OTPVerify.jsx        # Redux integrated
│   │   ├── ForgotPassword.jsx   # Redux integrated
│   │   ├── ChangePassword.jsx   # Redux integrated
│   │   └── Dashboard.jsx        # Redux integrated for notes
│   └── routes/
│       ├── AuthRoute.jsx        # Route protection using Redux
│       └── PrivetRoute.jsx      # Route protection using Redux
├── App.jsx                      # Main app component
└── main.jsx                     # Redux Provider setup
```

## 🚀 Setup Instructions

### 1. Install Dependencies
```bash
cd front-end
npm install
# or
yarn install
```

### 2. Environment Variables
Create a `.env` file in the `front-end` directory:

```env
VITE_BASE_URI=http://localhost:5000/api
```

### 3. Start Development Server
```bash
npm run dev
```

## 📊 Redux State Structure

### Auth State
```javascript
{
  auth: {
    user: null | object,
    token: null | string,
    isAuthenticated: boolean,
    loading: boolean,
    error: null | string,
    success: boolean,
    message: string
  }
}
```

### Notes State
```javascript
{
  notes: {
    notes: [],
    currentNote: null,
    loading: boolean,
    error: null | string,
    success: boolean,
    message: string
  }
}
```

## 🔐 Authentication Slice (authSlice.js)

### Async Thunks
- `registerUser(userData)` - Register a new user
- `loginUser(credentials)` - Login user
- `verifyOTP({ email, otp })` - Verify OTP
- `resendOTP(email)` - Resend OTP
- `forgotPasswordRequest(email)` - Request password reset
- `changePassword({ token, newPassword })` - Change password

### Actions
- `clearError()` - Clear error message
- `clearSuccess()` - Clear success message
- `logout()` - Logout user

### Example Usage
```javascript
import { useDispatch, useSelector } from 'react-redux'
import { loginUser, clearError } from '../../redux/slices/authSlice'

const MyComponent = () => {
  const dispatch = useDispatch()
  const { loading, error, success } = useSelector((state) => state.auth)

  const handleLogin = () => {
    dispatch(loginUser({ email: 'user@example.com', password: '123456' }))
  }

  return (
    <button onClick={handleLogin} disabled={loading}>
      {loading ? 'Logging in...' : 'Login'}
    </button>
  )
}
```

## 📝 Notes Slice (notesSlice.js)

### Async Thunks
- `fetchNotes()` - Get all notes
- `createNote(formData)` - Create a new note with optional image
- `updateNote({ id, noteData })` - Update a note
- `deleteNote(id)` - Delete a note
- `uploadImage(formData)` - Upload an image

### Example Usage
```javascript
import { useDispatch, useSelector } from 'react-redux'
import { fetchNotes, createNote } from '../../redux/slices/notesSlice'

const Dashboard = () => {
  const dispatch = useDispatch()
  const { notes, loading } = useSelector((state) => state.notes)

  useEffect(() => {
    dispatch(fetchNotes())
  }, [dispatch])

  const handleCreateNote = (noteData) => {
    dispatch(createNote(noteData))
  }

  return (
    <div>
      {notes.map(note => (
        <div key={note._id}>{note.title}</div>
      ))}
    </div>
  )
}
```

## 🌐 API Service (services/api.js)

Centralized API client with Axios:

### Auth APIs
```javascript
authAPI.register(userData)      // POST /auth/register
authAPI.login(credentials)       // POST /auth/login
authAPI.verifyOTP(email, otp)   // POST /auth/otp-verify
authAPI.resendOTP(email)         // POST /auth/otp-reset
authAPI.forgotPassword(email)    // POST /auth/forgot-password
authAPI.changePassword(token, newPassword) // POST /auth/change-password
```

### Notes APIs
```javascript
notesAPI.createNote(formData)    // POST /note
notesAPI.getNotes()              // GET /note
notesAPI.updateNote(id, data)    // PUT /note/:id
notesAPI.deleteNote(id)          // DELETE /note/:id
```

### Image APIs
```javascript
imageAPI.uploadImage(formData)   // POST /file
```

## 🎯 Best Practices Implemented

### ✅ Async Thunk Error Handling
All async thunks have proper try-catch with `rejectWithValue`:

```javascript
export const loginUser = createAsyncThunk(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await authAPI.login(credentials)
      return response.data
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: 'Login failed' }
      )
    }
  }
)
```

### ✅ Proper State Management
- Separate slices for each feature (auth, notes)
- Clear separation of concerns
- Centralized API calls
- Consistent error/loading/success handling

### ✅ Component Integration
- All components use `useDispatch` and `useSelector` hooks
- Proper loading states in UI
- Error handling with toast notifications
- Reset form data on success

### ✅ Route Protection
- `AuthRoute` - Prevents logged-in users from accessing auth pages
- `PrivetRoute` - Prevents anonymous users from accessing protected routes
- Both use Redux `isAuthenticated` state

## 🔄 Complete User Flow

### Registration Flow
1. User enters details in Signup component
2. Component dispatches `registerUser` thunk
3. Thunk calls `authAPI.register()`
4. On success → Navigate to OTP verification
5. User enters OTP in OTPVerify component
6. Component dispatches `verifyOTP` thunk
7. On success → Can login

### Login Flow
1. User enters credentials in Login component
2. Component dispatches `loginUser` thunk
3. Token is saved to localStorage
4. `isAuthenticated` is set to `true`
5. User redirected to `/dashboard`
6. PrivetRoute allows access to Dashboard

### Note Creation Flow
1. User fills note form in Dashboard
2. Form submits and dispatches `createNote` thunk
3. FormData includes title, description, and optional image
4. On success → Notes list is refreshed automatically
5. New note appears in the grid

## 🛠️ Debugging Tips

### Redux DevTools
To use Redux DevTools Extension (optional):

```bash
npm install --save-dev @redux-devtools/extension
```

Update `redux/store.js`:
```javascript
import { configureStore } from '@reduxjs/toolkit'
import { composeWithDevTools } from '@redux-devtools/extension'

const store = configureStore({
  reducer: { /* ... */ },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware(),
  devTools: process.env.NODE_ENV !== 'production'
})
```

### Check Redux State
In any component:
```javascript
const state = useSelector(state => state)
console.log('Full Redux State:', state)
```

## 📋 Checklist for New Features

When adding a new feature with Redux:

- [ ] Create a new slice in `redux/slices/`
- [ ] Define async thunks with proper error handling
- [ ] Add reducers for state mutations
- [ ] Export actions and reducer
- [ ] Add reducer to store configuration
- [ ] Create API methods in `services/api.js`
- [ ] Update components to use Redux hooks
- [ ] Handle loading and error states
- [ ] Test with Redux DevTools

## 🚨 Common Issues & Solutions

### Issue: Token not persisting
**Solution**: Token is stored in localStorage and retrieved on app load. Check auth slice initialization.

### Issue: Infinite loading
**Solution**: Check for missing `.catch()` or `rejectWithValue()` in async thunk.

### Issue: API calls not working
**Solution**: Verify `VITE_BASE_URI` in `.env` file and API endpoints in `services/api.js`.

### Issue: State not updating in component
**Solution**: Ensure you're using `useSelector` correctly and Redux DevTools shows state changes.

## 📚 Resources

- [Redux Toolkit Documentation](https://redux-toolkit.js.org/)
- [React Redux Hooks](https://react-redux.js.org/api/hooks)
- [Axios Documentation](https://axios-http.com/)
- [Vite Environment Variables](https://vitejs.dev/guide/env-and-modes.html)

---

**Built with Redux Toolkit + React + Axios** ✨
