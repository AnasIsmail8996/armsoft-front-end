import React, { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import styles from "./Login.module.css"
import { toast } from 'react-toastify'
import { useNavigate } from 'react-router-dom'
import { loginUser, clearError, clearSuccess } from '../../redux/slices/authSlice'

const Login = () => {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { loading, error } = useSelector((state) => state.auth)

  useEffect(() => {
    dispatch(clearError())
    dispatch(clearSuccess())
  }, [dispatch])

  useEffect(() => {
    if (error) {
      toast.error(error)
      dispatch(clearError())
    }
  }, [error, dispatch])

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!email || !password) {
      toast.error("Email and password are required")
      return
    }

    const credentials = { email, password }
    try {
      await dispatch(loginUser(credentials)).unwrap()
      toast.success("Login successful!")
      navigate('/dashboard')
    } catch (loginError) {
      toast.error(loginError?.message || 'Login failed')
    }
  }

  return (
    <div className={styles.wrapper}>
      <form onSubmit={handleSubmit} className={styles.form}>
        <h2>Login Account</h2>
        <input
          type="email"
          placeholder="Email Address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={loading}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={loading}
        />

        <button type="submit" disabled={loading}>
          {loading ? 'Logging In...' : 'Login Now'}
        </button>
        <button
          type="button"
          onClick={() => navigate("/signup")}
          disabled={loading}
        >
          Sign Up
        </button>
      </form>
    </div>
  )
}

export default Login