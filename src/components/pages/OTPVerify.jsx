import React, { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import styles from "./OPTVerify.module.css"
import { toast } from 'react-toastify'
import { useNavigate } from 'react-router-dom'

import {
  verifyOTP,
  resendOTP,
  clearError,
  clearSuccess
} from '../../redux/slices/authSlice'

const OTPVerify = () => {

  const [otp, setOtp] = useState("")
  const [isSuccess, setIsSuccess] = useState(false)

  const dispatch = useDispatch()
  const navigate = useNavigate()

  const { loading, error } =
    useSelector((state) => state.auth)

  // ================= GET EMAIL =================

  const email = localStorage.getItem("otpEmail")

  // ================= REDIRECT =================

  useEffect(() => {
    dispatch(clearError())
    dispatch(clearSuccess())
  }, [dispatch])

  useEffect(() => {

    if (!email) {
      navigate("/signup")
    }

  }, [email, navigate])

  // ================= ERROR =================

  useEffect(() => {

    if (error) {
      toast.error(error)
      dispatch(clearError())
    }

  }, [error, dispatch])

  // ================= VERIFY OTP =================

  const handleVerifyOTP = async (e) => {

    e.preventDefault()

    if (!otp) {
      toast.error("OTP is required")
      return
    }

    try {

      await dispatch(
        verifyOTP({
          email,
          otp
        })
      ).unwrap()

      setIsSuccess(true)
      toast.success("OTP Verified Successfully!")
      localStorage.removeItem("otpEmail")

    } catch (error) {
      toast.error(error?.message || "OTP verification failed")
    }
  }

  // ================= RESEND OTP =================

  const resendOTPHandler = async () => {

    try {

      await dispatch(resendOTP(email)).unwrap()

      toast.success("OTP resent successfully")

    } catch (error) {
      toast.error(error?.message || "Failed to resend OTP")
    }
  }

  return (
    <div className={styles.wrapper}>

      {!isSuccess ? (

        <form
          onSubmit={handleVerifyOTP}
          className={styles.form}
        >

          <h2>Verify Your OTP</h2>

          <p className={styles.desc}>
            OTP has been sent to:
            <b> {email}</b>
          </p>

          <input
            type="text"
            placeholder="Enter OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            disabled={loading}
          />

          <button
            type="submit"
            disabled={loading}
          >
            {loading ? "Verifying..." : "Verify OTP"}
          </button>

          <p>

            Didn't receive OTP?

            <button
              type="button"
              onClick={resendOTPHandler}
              disabled={loading}
            >
              Resend OTP
            </button>

          </p>

        </form>

      ) : (

        <div className={styles.successCard}>

          <h2>✅ OTP Verified Successfully!</h2>

          <p>
            Your account is now active.
          </p>

          <button
            onClick={() => navigate('/login')}
          >
            Go To Login
          </button>

        </div>

      )}

    </div>
  )
}

export default OTPVerify