'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import styles from '../auth.module.css';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [step, setStep] = useState(1); // 1: verify identity, 2: set new password
  const [stepTransition, setStepTransition] = useState(false);
  const [verifiedData, setVerifiedData] = useState<{ email: string; username: string } | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const togglePassword = () => setShowPassword((s) => !s);
  const toggleConfirmPassword = () => setShowConfirmPassword((s) => !s);

  const handleVerifyIdentity = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const username = formData.get('username') as string;

    try {
      // TODO: Replace with actual API call to verify email and username
      // For now, simulating the verification
      const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/auth/verify-identity`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, username }),
      });

      if (!response.ok) {
        const data = await response.json();
        setError(data.message || 'Email and username do not match');
        setIsLoading(false);
        return;
      }

      // Identity verified - move to step 2 with smooth transition
      setVerifiedData({ email, username });
      setError(''); // Clear any previous errors
      setSuccess(''); // Clear success message for clean transition
      
      // Fade out, then change step, then fade in
      setStepTransition(true);
      setTimeout(() => {
        setStep(2);
        setStepTransition(false);
        setIsLoading(false);
      }, 300);
    } catch (err: any) {
      setError(err.message || 'Network error. Please try again.');
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const password = formData.get('password') as string;
    const confirmPassword = formData.get('confirmPassword') as string;

    // Client-side validation
    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      setIsLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      setIsLoading(false);
      return;
    }

    try {
      // TODO: Replace with actual API call to reset password
      const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/auth/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: verifiedData?.email,
          username: verifiedData?.username,
          newPassword: password,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        setError(data.message || 'Failed to reset password');
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
              {step === 1 ? 'Forgot Password?' : 'Set New Password'}
            </h1>
            
            <p className={styles.subtitle} style={{ marginBottom: '25px', fontSize: '14px', color: 'rgba(255,255,255,0.8)' }}>
              {step === 1 
                ? 'Enter your email and username to verify your identity' 
                : 'Create a new password for your account'}
            </p>

            <form 
              ref={formRef} 
              className={styles.form} 
              onSubmit={step === 1 ? handleVerifyIdentity : handleResetPassword}
              style={{
                opacity: stepTransition ? 0 : 1,
                transition: 'opacity 0.3s ease-in-out'
              }}
            >
              {/* Step 1: Email and Username inputs */}
              {step === 1 && (
                <>
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
                      type="text" 
                      name="username" 
                      placeholder="Username" 
                      required 
                      className={styles.input}
                      disabled={isLoading}
                    />
                    <i className={`bx bxs-user ${styles.inputIcon}`}></i>
                  </div>
                </>
              )}

              {/* Step 2: Password inputs - appear in same space */}
              {step === 2 && (
                <>
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
                </>
              )}

              {error && (
                <div className={styles.errorMessage} style={{ marginBottom: '15px' }}>
                  {error}
                </div>
              )}

              {success && (
                <div className={styles.successMessage} style={{ marginBottom: '15px' }}>
                  {success}
                </div>
              )}

              <button 
                type="submit" 
                className={styles.btn}
                disabled={isLoading}
              >
                {step === 1 
                  ? (isLoading ? 'Verifying...' : 'Verify Identity')
                  : (isLoading ? 'Resetting...' : 'Reset Password')
                }
              </button>

              <div className={styles.register}>
                <p>
                  {step === 1 ? (
                    <>
                      Remember your password?{' '}
                      <Link href="/login">
                        <span>Login here</span>
                      </Link>
                    </>
                  ) : (
                    <Link href="/login">
                      <span>Back to Login</span>
                    </Link>
                  )}
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
