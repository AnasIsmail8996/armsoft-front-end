import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import styles from "./ForgotPassword.module.css";
import { toast } from "react-toastify";
import { forgotPasswordRequest, clearError, clearSuccess } from "../../redux/slices/authSlice";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");

  const dispatch = useDispatch();
  const { loading } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(clearError());
    dispatch(clearSuccess());
  }, [error, dispatch]);

  const handleForgotPassword = async (e) => {
    e.preventDefault();

    if (!email) {
      toast.error("Email is required");
      return;
    }

    try {
      const response = await dispatch(forgotPasswordRequest(email)).unwrap();
      toast.success(response?.message || "Reset link sent successfully!");
      setEmail("");
    } catch (forgotError) {
      toast.error(forgotError?.message || "Failed to send reset link");
    }
  };

  return (
    <div className={styles.wrapper}>
      <form className={styles.form} onSubmit={handleForgotPassword}>
        <h2>Forgot Password</h2>
        <p className={styles.desc}>
          Enter your email and we will send you a password reset link.
        </p>

        <input
          type="email"
          placeholder="Enter Your Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={loading}
        />

        <button type="submit" disabled={loading}>
          {loading ? "Sending..." : "Send Reset Link"}
        </button>
      </form>
    </div>
  );
};

export default ForgotPassword;
