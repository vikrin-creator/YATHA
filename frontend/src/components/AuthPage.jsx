import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/auth.css";

import bg from "../assets/images/LoginSigninBg.png";

// Auto-detect environment and use appropriate backend URL
const API_BASE_URL = window.location.hostname === 'localhost' 
  ? "http://localhost:8000" 
  : window.location.origin + '/backend';

export default function AuthPage() {
  const navigate = useNavigate();

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])
  
  // Login state
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState("");
  
  // Signup state
  const [signupFirstName, setSignupFirstName] = useState("");
  const [signupLastName, setSignupLastName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPhone, setSignupPhone] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const [signupConfirmPassword, setSignupConfirmPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [signupLoading, setSignupLoading] = useState(false);
  const [signupError, setSignupError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError("");
    setLoginLoading(true);

    if (!loginEmail || !loginPassword) {
      setLoginError("Please enter email and password");
      setLoginLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: loginEmail,
          password: loginPassword,
        }),
      });

      const data = await response.json();

      if (data.success && data.data?.token) {
        // Store token and user data
        localStorage.setItem("token", data.data.token);
        localStorage.setItem("user", JSON.stringify(data.data.user));
        
        // Redirect to home
        navigate("/");
      } else {
        setLoginError(data.message || "Login failed");
      }
    } catch (error) {
      setLoginError("Connection error: " + error.message);
    } finally {
      setLoginLoading(false);
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setSignupError("");

    // Validation
    if (!signupFirstName || !signupLastName || !signupEmail || !signupPhone || !signupPassword || !signupConfirmPassword) {
      setSignupError("Please fill in all fields");
      return;
    }

    if (signupPassword !== signupConfirmPassword) {
      setSignupError("Passwords do not match");
      return;
    }

    if (signupPassword.length < 6) {
      setSignupError("Password must be at least 6 characters");
      return;
    }

    setSignupLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: `${signupFirstName} ${signupLastName}`,
          email: signupEmail,
          phone: signupPhone,
          password: signupPassword,
        }),
      });

      const data = await response.json();

      if (data.success && data.data?.token) {
        // Store token and user data
        localStorage.setItem("token", data.data.token);
        localStorage.setItem("user", JSON.stringify(data.data.user));
        
        // Redirect to home
        navigate("/");
      } else {
        setSignupError(data.message || "Signup failed");
      }
    } catch (error) {
      setSignupError("Connection error: " + error.message);
    } finally {
      setSignupLoading(false);
    }
  };

  return (
    <div
      className="auth-bg"
      style={{
        backgroundImage: `url(${bg})`,
      }}
    >
      <div className="auth-overlay"></div>

      {/* Left Side Content */}
      <div className="left-content">
        {/* Welcome Text */}
        <div className="welcome-section">
          <h1>🍃 Welcome back to</h1>
          <h2>Natural Wellness</h2>
          <p>Pure Moringa. Pure Life.</p>
        </div>

        {/* Feature Icons */}
        <div className="features-section">
          <div className="feature-item">
            <div className="feature-circle">🛒</div>
            <span>100% Organic</span>
          </div>
          <div className="feature-item">
            <div className="feature-circle">🔬</div>
            <span>Lab Tested</span>
          </div>
          <div className="feature-item">
            <div className="feature-circle">👥</div>
            <span>For 1000+ Customers</span>
          </div>
        </div>
      </div>

      {/* Right Side - Auth Cards */}
      <div className="auth-container">
        {/* Login Card */}
        <div className="auth-card">
          <div className="card-header">
            <h2>Login to your account</h2>
          </div>

          <form onSubmit={handleLogin}>
            {loginError && <div className="error-message">{loginError}</div>}
            
            <input 
              type="text" 
              placeholder="Email or Mobile Number"
              value={loginEmail}
              onChange={(e) => setLoginEmail(e.target.value)}
              required
            />
            
            <div className="password-field">
              <input 
                type={showLoginPassword ? "text" : "password"} 
                placeholder="Password"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                required
              />
              <button 
                type="button" 
                className="toggle-password"
                onClick={() => setShowLoginPassword(!showLoginPassword)}
              >
                {showLoginPassword ? "👁️" : "👁️‍🗨️"}
              </button>
            </div>

            <div className="auth-row">
              <label className="checkbox-label">
                <input type="checkbox" /> Remember me
              </label>
              <span className="link">Forgot password?</span>
            </div>

            <button 
              type="submit" 
              className="btn-primary"
              disabled={loginLoading}
            >
              {loginLoading ? "Logging in..." : "Login"}
            </button>
          </form>
        </div>

        {/* Signup Card */}
        <div className="auth-card">
          <div className="card-header">
            <h2>Create your account</h2>
          </div>

          <form onSubmit={handleSignup}>
            {signupError && <div className="error-message">{signupError}</div>}
            
            <div className="form-row">
              <input 
                type="text" 
                placeholder="First Name"
                value={signupFirstName}
                onChange={(e) => setSignupFirstName(e.target.value)}
                required
              />
              <input 
                type="text" 
                placeholder="Last Name"
                value={signupLastName}
                onChange={(e) => setSignupLastName(e.target.value)}
                required
              />
            </div>

            <input 
              type="email" 
              placeholder="Email Address"
              value={signupEmail}
              onChange={(e) => setSignupEmail(e.target.value)}
              required
            />

            <input 
              type="tel" 
              placeholder="Mobile Number"
              value={signupPhone}
              onChange={(e) => setSignupPhone(e.target.value)}
              required
            />
            
            <div className="password-field">
              <input 
                type={showSignupPassword ? "text" : "password"} 
                placeholder="Password"
                value={signupPassword}
                onChange={(e) => setSignupPassword(e.target.value)}
                required
              />
              <button 
                type="button" 
                className="toggle-password"
                onClick={() => setShowSignupPassword(!showSignupPassword)}
              >
                {showSignupPassword ? "👁️" : "👁️‍🗨️"}
              </button>
            </div>

            <div className="password-field">
              <input 
                type={showConfirmPassword ? "text" : "password"} 
                placeholder="Confirm Password"
                value={signupConfirmPassword}
                onChange={(e) => setSignupConfirmPassword(e.target.value)}
                required
              />
              <button 
                type="button" 
                className="toggle-password"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? "👁️" : "👁️‍🗨️"}
              </button>
            </div>

            <label className="checkbox-label">
              <input type="checkbox" required /> I agree to the Terms & Conditions
            </label>

            <button 
              type="submit" 
              className="btn-primary"
              disabled={signupLoading}
            >
              {signupLoading ? "Creating Account..." : "Sign Up"}
            </button>
          </form>
        </div>
      </div>

      {/* Bottom Security Badges */}
      {/* Removed */}
    </div>
  );
}