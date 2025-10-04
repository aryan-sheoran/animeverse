'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import styles from '../auth.module.css';
import { authClient } from '@/lib/auth-client';

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  const togglePassword = () => setShowPassword((s) => !s);

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    try {
      const result = await authClient.signIn.email({
        email,
        password,
      });

      if (result.error) {
        setError(result.error.message || 'Login failed');
        setIsLoading(false);
        return;
      }

      // Login successful - redirect to hub
      router.push('/hub');
    } catch (err: any) {
      setError(err.message || 'Network error. Please try again.');
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Set background for login - dark blue gradient like original Auth.jsx
    document.body.style.background = "linear-gradient(45deg, #0f2027, #203a43, #2c5364)";
    
    // Trigger fade-in animation after mount
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 50);
    
    return () => {
      clearTimeout(timer);
      document.body.style.background = "";
    };
  }, []);

  return (
    <div className={styles.authRoot}>
      <div className={styles.big}>
        {/* Left Section - Login Form */}
        <div className={styles.left}>
          <div 
            className={`${styles.container} ${styles.loginContainer}`}
            style={{ 
              opacity: isVisible ? 1 : 0,
              transition: 'opacity 0.5s ease-in-out'
            }}
          >
            <h1 className={styles.title}>Welcome Back !!</h1>
            <form ref={formRef} className={styles.form} onSubmit={handleLogin}>
              <div className={styles.inputBox}>
                <input 
                  type="email" 
                  name="email" 
                  placeholder="Email Address" 
                  required 
                  className={styles.input}
                  disabled={isLoading}
                />
                <i className={`bx bxs-user ${styles.inputIcon}`}></i>
              </div>
              <div className={styles.inputBox}>
                <input 
                  type={showPassword ? "text" : "password"} 
                  name="password" 
                  placeholder="Password" 
                  required 
                  className={styles.input}
                  disabled={isLoading}
                />
                <i
                  className={`bx ${showPassword ? 'bx-show' : 'bx-hide'} ${styles.inputIcon}`}
                  onClick={togglePassword}
                  role="button"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                ></i>
              </div>
              <div className={styles.forgotLink}>
                <a href="#">Forgot Password?</a>
              </div>
              {error && (
                <div className={styles.errorMessage} style={{ display: 'block' }}>
                  {error}
                </div>
              )}
              <button type="submit" className={styles.btn} disabled={isLoading}>
                {isLoading ? 'Logging in...' : 'Login'}
              </button>
              <p className={styles.other}>
                Don't have an account? 
                <Link href="/signup" className={styles.switchLink}>
                  Sign Up
                </Link>
              </p>
            </form>
          </div>
          <div 
            className={styles.curve} 
            style={{ 
              opacity: 0,
              transition: 'transform 0.8s ease-in-out, opacity 0.8s ease-in-out'
            }}
          ></div>
        </div>

        {/* Right Section - Decorative Curve */}
        <div className={styles.right}>
          <div 
            className={styles.curve2} 
            style={{ 
              opacity: isVisible ? 1 : 0,
              transition: 'transform 0.8s ease-in-out, opacity 0.8s ease-in-out'
            }}
          ></div>
        </div>
      </div>
    </div>
  );
}
