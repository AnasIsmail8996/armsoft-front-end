import React, { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import styles from "./Signup.module.css"
import { toast } from 'react-toastify'
import { useNavigate } from 'react-router-dom'
import {
  registerUser,
  clearError,
  clearSuccess
} from '../../redux/slices/authSlice'

const Signup = () => {

  const [name, setName] = useState("")
  const [mobileNumber, setMobileNumber] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  const dispatch = useDispatch()
  const navigate = useNavigate()

  const { loading } = useSelector((state) => state.auth)

  useEffect(() => {
    dispatch(clearError())
    dispatch(clearSuccess())
  }, [dispatch])

  // ================= SUBMIT =================

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!name || !mobileNumber || !email || !password) {
      toast.error("All fields are required")
      return
    }

    try {

      const userData = {
        name,
        mobileNumber,
        email,
        password
      }

      await dispatch(registerUser(userData)).unwrap()

      // SAVE EMAIL
      localStorage.setItem("otpEmail", email)

      toast.success("Registration successful! Verify OTP")

      // NAVIGATE
      navigate("/otpVerify")

      dispatch(clearSuccess())

    } catch (error) {
      toast.error(error?.message || "Registration failed")
    }
  }

  return (
    <div className={styles.wrapper}>

      <form onSubmit={handleSubmit} className={styles.form}>

        <h2>Create Account</h2>

        <input
          type="text"
          placeholder="Full Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          disabled={loading}
        />

        <input
          type="number"
          placeholder="Mobile Number"
          value={mobileNumber}
          onChange={(e) => setMobileNumber(e.target.value)}
          disabled={loading}
        />

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
          {loading ? "Signing Up..." : "Sign Up"}
        </button>

        <button
          type="button"
          onClick={() => navigate("/login")}
          disabled={loading}
        >
          Login
        </button>

      </form>

    </div>
  )
}

export default Signup