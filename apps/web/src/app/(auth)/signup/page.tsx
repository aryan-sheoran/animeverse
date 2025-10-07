'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import styles from '../auth.module.css';
import { authClient } from '@/lib/auth-client';

export default function SignupPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  const togglePassword = () => setShowPassword((s) => !s);

  const handleSignup = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const username = formData.get('username') as string;

    // Client-side validation
    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      setIsLoading(false);
      return;
    }

    try {
      const result = await authClient.signUp.email({
        email,
        password,
        username,
        name: username, // Also set name for backward compatibility
      });

      if (result.error) {
        setError(result.error.message || 'Signup failed');
        setIsLoading(false);
        return;
      }

      // Signup successful - redirect to hub
      router.push('/hub');
    } catch (err: any) {
      setError(err.message || 'Network error. Please try again.');
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Set background for signup - light blue gradient like original Auth.jsx
    document.body.style.background = "linear-gradient(45deg, #e0eafc, #cfdef3)";
    
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
    <div className={`${styles.authRoot} ${styles.signupBg}`}>
      <div className={styles.big}>
        {/* Left Section - Decorative Curve */}
        <div className={styles.left}>
          <div 
            className={styles.curve} 
            style={{ 
              opacity: isVisible ? 1 : 0,
              transition: 'transform 0.8s ease-in-out, opacity 0.8s ease-in-out'
            }}
          ></div>
        </div>

        {/* Right Section - Signup Form */}
        <div className={styles.right}>
          <div 
            className={`${styles.container2} ${styles.signupContainer}`} 
            style={{ 
              display: 'block', 
              opacity: isVisible ? 1 : 0,
              transition: 'opacity 0.5s ease-in-out'
            }}
          >
            <h1 className={styles.title}>Welcome !!</h1>
            <form ref={formRef} className={styles.form} onSubmit={handleSignup}>
              <div className="signup-step">
                <div className={styles.inputBox}>
                  <input 
                    type="email" 
                    name="email" 
                    placeholder="Email Address" 
                    required 
                    className={styles.input}
                    disabled={isLoading}
                  />
                  <i className={`bx bxs-envelope ${styles.inputIcon}`}></i>
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
                <div className={styles.inputBox}>
                  <input 
                    type="text" 
                    name="username" 
                    placeholder="Your Name" 
                    required 
                    className={styles.input}
                    disabled={isLoading}
                  />
                  <i className={`bx bxs-user ${styles.inputIcon}`}></i>
                </div>
                {error && (
                  <div className={styles.errorMessage} style={{ display: 'block' }}>
                    {error}
                  </div>
                )}
                <button type="submit" className={styles.btn} disabled={isLoading}>
                  {isLoading ? 'Signing up...' : 'Sign Up'}
                </button>
                <p className={styles.other}>
                  Already have an account? 
                  <Link href="/login" className={styles.switchLink}>
                    Login
                  </Link>
                </p>
              </div>
            </form>
          </div>
          <div 
            className={styles.curve2} 
            style={{ 
              opacity: 0,
              transition: 'transform 0.8s ease-in-out, opacity 0.8s ease-in-out'
            }}
          ></div>
        </div>
      </div>
    </div>
  );
}
