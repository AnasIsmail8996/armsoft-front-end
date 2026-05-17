import React, { useEffect, useMemo, useRef } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import Dashboard from './components/pages/dashboard'
import Login from './components/pages/Login'
import SignUp from './components/pages/Signup'
import AuthRoute from './components/routes/AuthRoute'
import PrivetRoute from './components/routes/PrivetRoute'
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material'
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import OTPVerify from './components/pages/OTPVerify'
import ForgotPassword from './components/pages/ForgotPassword'
import ChangePassword from './components/pages/ChangePassword'
import Landing from './pages/Landing'
import Home from './pages/Home'
import Profile from './pages/Profile'
import Navbar from './components/Navbar'
import SocialFooter from './components/SocialFooter'
import { fetchCurrentUser } from './redux/slices/authSlice'

const App = () => {
  const dispatch = useDispatch()
  const { mode } = useSelector((state) => state.theme)
  const authCheckRef = useRef(false)

  const muiTheme = useMemo(
    () =>
      createTheme({
        palette: {
          mode,
          primary: {
            main: mode === 'dark' ? '#7dd3fc' : '#2563eb',
          },
          secondary: {
            main: mode === 'dark' ? '#fbbf24' : '#f59e0b',
          },
          background: {
            default: mode === 'dark' ? '#0f172a' : '#f8fbff',
            paper: mode === 'dark' ? '#111827' : '#ffffff',
          },
        },
        shape: {
          borderRadius: 14,
        },
      }),
    [mode]
  )

  // Check authentication only once on app mount
  useEffect(() => {
    if (!authCheckRef.current) {
      authCheckRef.current = true
      dispatch(fetchCurrentUser())
    }
  }, [dispatch])

  return (
    <ThemeProvider theme={muiTheme}>
      <CssBaseline />
      <ToastContainer position="top-center" autoClose={3000} theme={mode} />
      <BrowserRouter>
        <Navbar />
        <Routes>
          {/* Public Route - Landing Page (Home) */}
          <Route path="/" element={<Landing />} />
          <Route path="/landing" element={<Landing />} />
          <Route path="/profile" element={<Profile />} />

          {/* Auth Routes (accessible only when not logged in) */}
          <Route element={<AuthRoute />}>
            <Route path="/signup" element={<SignUp />} />
            <Route path="/login" element={<Login />} />
            <Route path="/otpVerify" element={<OTPVerify />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/change-password" element={<ChangePassword />} />
          </Route>

          {/* Protected Routes */}
          <Route element={<PrivetRoute />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/home" element={<Home />} />
            <Route path="/profile/:userId" element={<Profile />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Landing />} />
        </Routes>
        <SocialFooter />
      </BrowserRouter>
    </ThemeProvider>
  )
}

export default App