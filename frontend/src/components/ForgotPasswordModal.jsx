import React, { useState } from "react";

const API_BASE_URL = window.location.hostname === 'localhost' 
  ? "http://localhost:8000" 
  : window.location.origin + '/backend';

export default function ForgotPasswordModal({ isOpen, onClose, API_BASE_URL: providedURL }) {
  const [step, setStep] = useState("email"); // email | otp | password
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const apiURL = providedURL || API_BASE_URL;

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");
    setLoading(true);

    if (!email) {
      setError("Please enter your email");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${apiURL}/api/auth/forgot-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (data.success) {
        setSuccessMessage(data.message);
        setStep("otp");
      } else {
        setError(data.message || "Failed to send reset code");
      }
    } catch (error) {
      setError("Connection error: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleOTPSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");
    setLoading(true);

    if (!otp) {
      setError("Please enter the OTP");
      setLoading(false);
      return;
    }

    if (otp.length !== 6) {
      setError("OTP must be 6 digits");
      setLoading(false);
      return;
    }

    // Move to password reset step
    setStep("password");
    setLoading(false);
  };

  const handlePasswordReset = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");
    setLoading(true);

    if (!newPassword || !confirmPassword) {
      setError("Please enter and confirm your new password");
      setLoading(false);
      return;
    }

    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters");
      setLoading(false);
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${apiURL}/api/auth/reset-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          otp,
          new_password: newPassword,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setSuccessMessage(data.message);
        setTimeout(() => {
          handleClose();
          setStep("email");
        }, 2000);
      } else {
        setError(data.message || "Failed to reset password");
      }
    } catch (error) {
      setError("Connection error: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setEmail("");
    setOtp("");
    setNewPassword("");
    setConfirmPassword("");
    setError("");
    setSuccessMessage("");
    setStep("email");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content forgot-password-modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={handleClose}>✕</button>

        {step === "email" && (
          <div>
            <h2>Reset Your Password</h2>
            <p>Enter your email address and we'll send you a reset code</p>
            <form onSubmit={handleEmailSubmit}>
              {error && <div className="error-message">{error}</div>}
              {successMessage && <div className="success-message">{successMessage}</div>}
              
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />

              <button type="submit" className="btn-primary" disabled={loading}>
                {loading ? "Sending..." : "Send Reset Code"}
              </button>
            </form>
          </div>
        )}

        {step === "otp" && (
          <div>
            <h2>Enter Reset Code</h2>
            <p>We've sent a 6-digit code to {email}</p>
            <form onSubmit={handleOTPSubmit}>
              {error && <div className="error-message">{error}</div>}
              {successMessage && <div className="success-message">{successMessage}</div>}
              
              <input
                type="text"
                placeholder="Enter 6-digit code"
                maxLength="6"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                required
              />
              <p className="info-text">Code expires in 10 minutes</p>

              <button type="submit" className="btn-primary" disabled={loading || otp.length !== 6}>
                {loading ? "Verifying..." : "Verify Code"}
              </button>

              <button 
                type="button" 
                className="btn-secondary"
                onClick={() => setStep("email")}
              >
                Back
              </button>
            </form>
          </div>
        )}

        {step === "password" && (
          <div>
            <h2>Create New Password</h2>
            <p>Enter your new password (minimum 8 characters)</p>
            <form onSubmit={handlePasswordReset}>
              {error && <div className="error-message">{error}</div>}
              {successMessage && <div className="success-message">{successMessage}</div>}
              
              <div className="password-field">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="New Password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="toggle-password"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? "👁️" : "👁️‍🗨️"}
                </button>
              </div>

              <div className="password-field">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm Password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
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

              <button type="submit" className="btn-primary" disabled={loading}>
                {loading ? "Resetting..." : "Reset Password"}
              </button>

              <button 
                type="button" 
                className="btn-secondary"
                onClick={() => setStep("otp")}
              >
                Back
              </button>
            </form>
          </div>
        )}
      </div>

      <style>{`
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 1000;
        }

        .modal-content {
          background: white;
          border-radius: 12px;
          padding: 40px;
          max-width: 420px;
          width: 90%;
          position: relative;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
          animation: slideIn 0.3s ease-out;
        }

        @keyframes slideIn {
          from {
            transform: translateY(-50px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        .modal-close {
          position: absolute;
          top: 15px;
          right: 15px;
          background: none;
          border: none;
          font-size: 24px;
          cursor: pointer;
          color: #999;
          padding: 0;
          width: 30px;
          height: 30px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .modal-close:hover {
          color: #333;
        }

        h2 {
          margin: 0 0 10px 0;
          font-size: 24px;
          color: #333;
        }

        p {
          margin: 0 0 25px 0;
          color: #666;
          font-size: 14px;
        }

        form {
          display: flex;
          flex-direction: column;
          gap: 15px;
        }

        input {
          padding: 12px 15px;
          border: 1px solid #ddd;
          border-radius: 6px;
          font-size: 14px;
          font-family: inherit;
        }

        input:focus {
          outline: none;
          border-color: #8B4513;
          box-shadow: 0 0 0 3px rgba(139, 69, 19, 0.1);
        }

        .password-field {
          position: relative;
          display: flex;
          align-items: center;
        }

        .password-field input {
          flex: 1;
          padding-right: 45px;
        }

        .toggle-password {
          position: absolute;
          right: 10px;
          background: none;
          border: none;
          cursor: pointer;
          font-size: 18px;
          padding: 0;
        }

        .error-message {
          background-color: #fee;
          border: 1px solid #fcc;
          color: #c33;
          padding: 12px;
          border-radius: 6px;
          font-size: 13px;
        }

        .success-message {
          background-color: #efe;
          border: 1px solid #cfc;
          color: #3c3;
          padding: 12px;
          border-radius: 6px;
          font-size: 13px;
        }

        .info-text {
          font-size: 12px;
          color: #999;
          margin: -10px 0 0 0 !important;
        }

        .btn-primary,
        .btn-secondary {
          padding: 12px 20px;
          border: none;
          border-radius: 6px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .btn-primary {
          background-color: #8B4513;
          color: white;
        }

        .btn-primary:hover:not(:disabled) {
          background-color: #6b3410;
        }

        .btn-primary:disabled {
          background-color: #ccc;
          cursor: not-allowed;
        }

        .btn-secondary {
          background-color: #f5f5f5;
          color: #333;
          margin-top: 5px;
        }

        .btn-secondary:hover {
          background-color: #e8e8e8;
        }

        @media (max-width: 480px) {
          .modal-content {
            padding: 30px 20px;
            max-width: 100%;
            margin: 0 15px;
          }

          h2 {
            font-size: 20px;
          }

          input {
            padding: 10px 12px;
            font-size: 16px;
          }
        }
      `}</style>
    </div>
  );
}
