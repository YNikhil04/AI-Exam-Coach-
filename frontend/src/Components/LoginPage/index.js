import { useNavigate } from "react-router-dom";
import React, { useState, useEffect } from "react";
import Cookies from "js-cookie";
import "./index.css";

export default function LoginPage() {
  const navigate = useNavigate();
  const token = Cookies.get("jwt_token");

  useEffect(() => {
    // If the token exists, redirect them away from the login page
    if (token) {
      navigate("/");
    }
  }, [token, navigate]);

  // AUTH STATE TOGGLE ('login' or 'register')
  const [authMode, setAuthMode] = useState("login");

  // LOGIN FORM STATE
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // REGISTRATION FORM STATE
  const [regFullName, setRegFullName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regConfirmPassword, setRegConfirmPassword] = useState("");

  // FEEDBACK MESSAGES
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // ACTION: Handle New Student Registration (POST data to MongoDB via Backend)
  const onClickSignUpBtn = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    // Client-Side Form Validation Checks
    if (!regFullName || !regEmail || !regPassword || !regConfirmPassword) {
      setErrorMsg("All registration fields are required.");
      return;
    }

    if (regPassword !== regConfirmPassword) {
      setErrorMsg("Passwords do not match!");
      return;
    }

    try {
      // HTTP POST Request to your local Node.js server
      const response = await fetch("http://localhost:5000/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fullName: regFullName,
          email: regEmail,
          password: regPassword,
        }),
      });

      const data = await response.json();

      if (response.ok || data.success) {
        // Clear registration fields & notify user on success
        setRegFullName("");
        setRegEmail("");
        setRegPassword("");
        setRegConfirmPassword("");
        setSuccessMsg("Registered successfully! Please log in below.");

        // Smooth transition back to login view
        setAuthMode("login");
      } else {
        setErrorMsg(data.message || "Registration failed.");
      }
    } catch (error) {
      console.error("Connection Error:", error);
      setErrorMsg("Could not connect to the backend database server.");
    }
  };

  // ACTION: Handle Existing Student Login
  const onClickSignInBtn = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    if (!loginEmail || !loginPassword) {
      setErrorMsg("Please enter both email and password.");
      return;
    }

    try {
      const payLoad = {
        email: loginEmail,
        password: loginPassword,
      };

      const options = {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payLoad),
      };

      // Target your server endpoint directly (Update URL if your local backend path differs)
      const response = await fetch(
        "http://localhost:5000/api/auth/signin",
        options,
      );
      const res = await response.json();

      const token = res.jwt_token;

      if (response.ok) {
        Cookies.set("jwt_token", token, { expires: 3 });
        navigate("/");
      } else {
        setErrorMsg(res.message || "Invalid credentials.");
      }
    } catch (error) {
      console.error(error);
      setErrorMsg("Server connectivity error.");
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h1 className="login-title">Personalized Exam Coach</h1>
        <p className="login-subtitle">
          {authMode === "login"
            ? "Sign in to open your AI study dashboard."
            : "Create your student account to analyze knowledge gaps."}
        </p>

        {/* TAB TOGGLE SWITCHES */}
        <div className="auth-toggle-row">
          <button
            type="button"
            className={`toggle-tab-btn ${authMode === "login" ? "active" : ""}`}
            onClick={() => {
              setAuthMode("login");
              setErrorMsg("");
              setSuccessMsg("");
            }}
          >
            Sign In
          </button>
          <button
            type="button"
            className={`toggle-tab-btn ${authMode === "register" ? "active" : ""}`}
            onClick={() => {
              setAuthMode("register");
              setErrorMsg("");
              setSuccessMsg("");
            }}
          >
            Register
          </button>
        </div>

        {/* CONDITIONAL RENDERING BASED ON AUTH MODE */}
        {authMode === "login" ? (
          /* LOGIN SECTION */
          <form onSubmit={onClickSignInBtn} className="auth-form">
            <div className="input-group">
              <label className="input-label">Email</label>
              <input
                type="email"
                className="login-input"
                placeholder="you@example.com"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
              />
            </div>

            <div className="input-group">
              <label className="input-label">Password</label>
              <input
                type="password"
                className="login-input"
                placeholder="••••••••••"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
              />
            </div>

            <button type="submit" className="login-button">
              Sign In
            </button>
          </form>
        ) : (
          /* REGISTER SECTION */
          <form onSubmit={onClickSignUpBtn} className="auth-form">
            <div className="input-group">
              <label className="input-label">Full Name</label>
              <input
                type="text"
                className="login-input"
                placeholder="John Doe"
                value={regFullName}
                onChange={(e) => setRegFullName(e.target.value)}
              />
            </div>

            <div className="input-group">
              <label className="input-label">Gmail / Email</label>
              <input
                type="email"
                className="login-input"
                placeholder="student@gmail.com"
                value={regEmail}
                onChange={(e) => setRegEmail(e.target.value)}
              />
            </div>

            <div className="input-group">
              <label className="input-label">Password</label>
              <input
                type="password"
                className="login-input"
                placeholder="Minimum 6 characters"
                value={regPassword}
                onChange={(e) => setRegPassword(e.target.value)}
              />
            </div>

            <div className="input-group">
              <label className="input-label">Confirm Password</label>
              <input
                type="password"
                className="login-input"
                placeholder="Re-enter password"
                value={regConfirmPassword}
                onChange={(e) => setRegConfirmPassword(e.target.value)}
              />
            </div>

            <button type="submit" className="login-button register-btn">
              Create Account
            </button>
          </form>
        )}

        {/* FEEDBACK STATUS PRINTS */}
        {errorMsg && <p className="status-message error-text">{errorMsg}</p>}
        {successMsg && (
          <p className="status-message success-text">{successMsg}</p>
        )}
      </div>
    </div>
  );
}
