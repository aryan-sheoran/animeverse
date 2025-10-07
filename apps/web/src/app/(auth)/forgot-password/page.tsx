'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import styles from '../auth.module.css';
import { authClient } from '@/lib/auth-client';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  // Check if we have a token in the URL (step 2: reset password)
  const token = searchParams.get('token');
  const errorParam = searchParams.get('error');

  useEffect(() => {
    if (errorParam) {
      setError('Invalid or expired reset link. Please request a new one.');
    }
  }, [errorParam]);

  const togglePassword = () => setShowPassword((s) => !s);
  const toggleConfirmPassword = () => setShowConfirmPassword((s) => !s);

  // Step 1: Request password reset
  const handleRequestReset = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;

    try {
      const result = await authClient.forgetPassword({
        email,
        redirectTo: `${window.location.origin}/forgot-password`,
      });

      if (result.error) {
        setError(result.error.message || 'Failed to send reset email');
        setIsLoading(false);
        return;
      }

      // Success - show message
      setSuccess('Password reset link sent! Check your email and server console logs.');
      setIsLoading(false);
      
      // Note: In production, check your email. For development, check server console logs
      console.log('Check your server console logs for the password reset link!');
    } catch (err: any) {
      setError(err.message || 'Network error. Please try again.');
      setIsLoading(false);
    }
  };

  // Step 2: Reset password with token
  const handleResetPassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const newPassword = formData.get('password') as string;
    const confirmPassword = formData.get('confirmPassword') as string;

    // Client-side validation
    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters long.');
      setIsLoading(false);
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      setIsLoading(false);
      return;
    }

    if (!token) {
      setError('Invalid reset token. Please request a new reset link.');
      setIsLoading(false);
      return;
    }

    try {
      const result = await authClient.resetPassword({
        newPassword,
        token,
      });

      if (result.error) {
        setError(result.error.message || 'Failed to reset password');
        setIsLoading(false);
        return;
      }

      // Password reset successful
      setSuccess('Password reset successful! Redirecting to login...');
      setTimeout(() => {
        router.push('/login');
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Network error. Please try again.');
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Set background for forgot password - purple/dark gradient
    document.body.style.background = "linear-gradient(45deg, #2c1654, #3a1e5c, #4a2472)";
    
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
        {/* Center the form */}
        <div className={styles.left} style={{ width: '100%' }}>
          <div 
            className={`${styles.container} ${styles.loginContainer}`}
            style={{ 
              opacity: isVisible ? 1 : 0,
              transition: 'opacity 0.5s ease-in-out',
              maxWidth: '450px',
            }}
          >
            <h1 className={styles.title}>
              {token ? 'Set New Password' : 'Forgot Password?'}
            </h1>
            
            <p className={styles.subtitle} style={{ marginBottom: '25px', fontSize: '14px', color: 'rgba(255,255,255,0.8)' }}>
              {token 
                ? 'Create a new password for your account' 
                : 'Enter your email to receive a password reset link'}
            </p>

            {/* Step 1: Request reset email */}
            {!token && (
              <form 
                ref={formRef} 
                className={styles.form} 
                onSubmit={handleRequestReset}
              >
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

                {error && (
                  <div className={styles.errorMessage} style={{ marginBottom: '15px' }}>
                    {error}
                  </div>
                )}

                {success && (
                  <div className={styles.successMessage} style={{ 
                    marginBottom: '15px',
                    color: '#4ade80',
                    background: 'rgba(74, 222, 128, 0.1)',
                    padding: '10px',
                    borderRadius: '5px',
                    fontSize: '14px'
                  }}>
                    {success}
                  </div>
                )}

                <button 
                  type="submit" 
                  className={styles.btn}
                  disabled={isLoading}
                >
                  {isLoading ? 'Sending...' : 'Send Reset Link'}
                </button>

                <div className={styles.register}>
                  <p>
                    Remember your password?{' '}
                    <Link href="/login">
                      <span>Login here</span>
                    </Link>
                  </p>
                </div>
              </form>
            )}

            {/* Step 2: Reset password with token */}
            {token && (
              <form 
                ref={formRef} 
                className={styles.form} 
                onSubmit={handleResetPassword}
              >
                <div className={styles.inputBox}>
                  <input 
                    type={showPassword ? "text" : "password"} 
                    name="password" 
                    placeholder="New Password" 
                    required 
                    className={styles.input}
                    disabled={isLoading}
                  />
                  <i
                    className={`bx ${showPassword ? 'bx-show' : 'bx-hide'} ${styles.inputIcon}`}
                    onClick={togglePassword}
                    role="button"
                    tabIndex={0}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    style={{ cursor: 'pointer' }}
                  ></i>
                </div>
                
                <div className={styles.inputBox}>
                  <input 
                    type={showConfirmPassword ? "text" : "password"} 
                    name="confirmPassword" 
                    placeholder="Confirm New Password" 
                    required 
                    className={styles.input}
                    disabled={isLoading}
                  />
                  <i
                    className={`bx ${showConfirmPassword ? 'bx-show' : 'bx-hide'} ${styles.inputIcon}`}
                    onClick={toggleConfirmPassword}
                    role="button"
                    tabIndex={0}
                    aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                    style={{ cursor: 'pointer' }}
                  ></i>
                </div>

                {error && (
                  <div className={styles.errorMessage} style={{ marginBottom: '15px' }}>
                    {error}
                  </div>
                )}

                {success && (
                  <div className={styles.successMessage} style={{ 
                    marginBottom: '15px',
                    color: '#4ade80',
                    background: 'rgba(74, 222, 128, 0.1)',
                    padding: '10px',
                    borderRadius: '5px',
                    fontSize: '14px'
                  }}>
                    {success}
                  </div>
                )}

                <button 
                  type="submit" 
                  className={styles.btn}
                  disabled={isLoading}
                >
                  {isLoading ? 'Resetting...' : 'Reset Password'}
                </button>

                <div className={styles.register}>
                  <p>
                    <Link href="/login">
                      <span>Back to Login</span>
                    </Link>
                  </p>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
