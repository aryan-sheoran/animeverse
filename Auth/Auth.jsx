import React, { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import styles from './Auth.module.css';
import apiClient from '../../utils/api';
import { useAuth } from '../../contexts/AuthContext';

const Auth = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { login, signup } = useAuth(); // <-- Import signup from context
  const loginContainerRef = useRef(null);
  const signupContainerRef = useRef(null);
  const curve1Ref = useRef(null);
  const curve2Ref = useRef(null);
  const loginErrorRef = useRef(null);
  const signupErrorRef = useRef(null);

  // Password visibility state
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showSignupPassword, setShowSignupPassword] = useState(false);

  const toggleLoginPassword = () => setShowLoginPassword((s) => !s);
  const toggleSignupPassword = () => setShowSignupPassword((s) => !s);

  useEffect(() => {
    // Load the auth handler script
    const script = document.createElement('script');
    script.src = '/js/auth-handler.js';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const mode = urlParams.get('mode');
    const errorMsg = urlParams.get('error');

    // Set initial state
    if (loginContainerRef.current && signupContainerRef.current) {
      loginContainerRef.current.style.display = "block";
      curve1Ref.current.style.opacity = "0";
      signupContainerRef.current.style.display = "none";
      curve2Ref.current.style.opacity = "1";

      // Show signup form if mode=signup in URL
      if (mode === 'signup') {
        loginContainerRef.current.style.display = "none";
        curve1Ref.current.style.opacity = "1";
        signupContainerRef.current.style.display = "block";
        curve2Ref.current.style.opacity = "0";
        signupContainerRef.current.style.opacity = "1";
        document.body.style.background = "linear-gradient(45deg, #e0eafc, #cfdef3)";
      } else {
        document.body.style.background = "linear-gradient(45deg, #0f2027, #203a43, #2c5364)";
        loginContainerRef.current.style.opacity = "1";
      }

      // Show error messages if present
      if (errorMsg) {
        if (mode === 'signup' || signupContainerRef.current.style.display === "block") {
          signupErrorRef.current.style.display = "block";
          signupErrorRef.current.textContent = decodeURIComponent(errorMsg);
        } else {
          loginErrorRef.current.style.display = "block";
          loginErrorRef.current.textContent = decodeURIComponent(errorMsg);
        }
      }
    }
  }, [location]);

  const toggleForms = () => {
    const isLoginVisible = loginContainerRef.current.style.display === "block";

    // Fade out the visible container
    if (isLoginVisible) {
      loginContainerRef.current.style.opacity = "0";
    } else {
      signupContainerRef.current.style.opacity = "0";
    }

    setTimeout(() => {
      if (isLoginVisible) {
        // Hide login, show signup
        loginContainerRef.current.style.display = "none";
        signupContainerRef.current.style.display = "block";
        document.body.style.background = "linear-gradient(45deg, #e0eafc, #cfdef3)";
        curve1Ref.current.style.opacity = "1";
        curve2Ref.current.style.opacity = "0";
        
        setTimeout(() => {
          signupContainerRef.current.style.opacity = "1";
        }, 50);
      } else {
        // Hide signup, show login
        signupContainerRef.current.style.display = "none";
        loginContainerRef.current.style.display = "block";
        document.body.style.background = "linear-gradient(45deg, #0f2027, #203a43, #2c5364)";
        curve1Ref.current.style.opacity = "0";
        curve2Ref.current.style.opacity = "1";
        
        setTimeout(() => {
          loginContainerRef.current.style.opacity = "1";
        }, 50);
      }
    }, 500);

    // Clear any error messages when switching forms
    loginErrorRef.current.style.display = "none";
    signupErrorRef.current.style.display = "none";
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    const form = e.target;
    const email = form.email.value;
    const password = form.password.value;
    loginErrorRef.current.style.display = "none";

    try {
      const result = await login(email, password);

      if (result.success) {
        navigate('/index'); // Redirect to Home page
      } else {
        loginErrorRef.current.style.display = "block";
        loginErrorRef.current.textContent = result.error || "Login failed";
      }
    } catch (err) {
      loginErrorRef.current.style.display = "block";
      loginErrorRef.current.textContent = err.response?.data?.message || "Network error";
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    const form = e.target;
    const email = form.email.value;
    const password = form.password.value;
    const username = form.username.value;
    signupErrorRef.current.style.display = "none";

    // Client-side validation
    if (password.length < 6) {
      signupErrorRef.current.style.display = "block";
      signupErrorRef.current.textContent = "Password must be at least 6 characters long.";
      return;
    }

    try {
      const result = await signup(email, password, username);

      if (result.success) {
        navigate('/index'); // Redirect to Home page
      } else {
        signupErrorRef.current.style.display = "block";
        signupErrorRef.current.textContent = result.error || "Signup failed";
      }
    } catch (err) {
      signupErrorRef.current.style.display = "block";
      signupErrorRef.current.textContent = err.response?.data?.message || "Network error";
    }
  };

  // Determine if signup is active
  const urlParams = new URLSearchParams(location.search);
  const mode = urlParams.get('mode');
  const isSignup = mode === 'signup';

  return (
    <div className={isSignup ? `${styles.authRoot} ${styles.signupBg}` : styles.authRoot}>
      <div className={styles.big}>
        {/* Left Section (Login) */}
        <div className={styles.left}>
          <div className={`${styles.container} ${styles.loginContainer}`} ref={loginContainerRef}>
            <h1 className={styles.title}>Welcome Back !!</h1>
            <form id="login-form" className={styles.form} onSubmit={handleLogin}>
              <div className={styles.inputBox}>
                <input type="email" name="email" placeholder="Email Address" required className={styles.input} />
                <i className={`bx bxs-user ${styles.inputIcon}`}></i>
              </div>
              <div className={styles.inputBox}>
                <input type={showLoginPassword ? "text" : "password"} name="password" placeholder="Password" required className={styles.input} />
                <i
                  className={`bx ${showLoginPassword ? 'bx-show' : 'bx-hide'} ${styles.inputIcon}`}
                  onClick={toggleLoginPassword}
                  role="button"
                  aria-label={showLoginPassword ? 'Hide password' : 'Show password'}
                ></i>
              </div>
              <div className={styles.forgotLink}>
                <a href="#">Forgot Password?</a>
              </div>
              <div id="login-error" className={styles.errorMessage} ref={loginErrorRef}></div>
              <button type="submit" className={styles.btn}>Login</button>
              <p className={styles.other}>
                Don't have an account? 
                <a href="#" className={`${styles.switchLink}`} onClick={(e) => { e.preventDefault(); toggleForms(); }}>
                  Sign Up
                </a>
              </p>
            </form>
          </div>
          <div className={styles.curve} ref={curve1Ref}></div>
        </div>

        {/* Right Section (Sign Up) */}
        <div className={styles.right}>
          <div className={`${styles.container2} ${styles.signupContainer}`} ref={signupContainerRef}>
            <h1 className={styles.title}>Welcome !!</h1>
            <form id="signup-form" className={styles.form} onSubmit={handleSignup}>
              <div className="signup-step" id="step1">
                <div className={styles.inputBox}>
                  <input type="email" name="email" placeholder="Email Address" required className={styles.input} />
                  <i className={`bx bxs-envelope ${styles.inputIcon}`}></i>
                </div>
                <div className={styles.inputBox}>
                  <input type={showSignupPassword ? "text" : "password"} name="password" placeholder="Password" required className={styles.input} />
                  <i
                    className={`bx ${showSignupPassword ? 'bx-show' : 'bx-hide'} ${styles.inputIcon}`}
                    onClick={toggleSignupPassword}
                    role="button"
                    aria-label={showSignupPassword ? 'Hide password' : 'Show password'}
                  ></i>
                </div>
                <div className={styles.inputBox}>
                  <input type="text" name="username" placeholder="Your Name" required className={styles.input} />
                  <i className={`bx bxs-user ${styles.inputIcon}`}></i>
                </div>
                <div id="signup-error" className={styles.errorMessage} ref={signupErrorRef}></div>
                <button type="submit" className={styles.btn}>Sign Up</button>
                <p className={styles.other}>
                  Already have an account? 
                  <a href="#" className={styles.switchLink} onClick={(e) => { e.preventDefault(); toggleForms(); }}>
                    Login
                  </a>
                </p>
              </div>
            </form>
          </div>
          <div className={styles.curve2} ref={curve2Ref}></div>
        </div>
      </div>
    </div>
  );
};

export default Auth;