import { useState, FormEvent } from 'react'
import { useNavigate } from '@tanstack/react-router'

import { signUp, signIn } from '../modules/authClient.ts'
import styles from './Auth.module.css'

export const Auth = () => {
  const navigate = useNavigate()
  const [isSignUp, setIsSignUp] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [name, setName] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState<{
    email?: string
    password?: string
    confirmPassword?: string
    name?: string
  }>({})

  const onLoggedIn = () => {
    navigate('/data/projects')
  }

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const validateForm = () => {
    const errors: typeof fieldErrors = {}

    if (!email) {
      errors.email = 'Email is required'
    } else if (!validateEmail(email)) {
      errors.email = 'Please enter a valid email'
    }

    if (!password) {
      errors.password = 'Password is required'
    } else if (password.length < 8) {
      errors.password = 'Password must be at least 8 characters'
    }

    if (isSignUp) {
      if (!name) {
        errors.name = 'Name is required'
      }

      if (!confirmPassword) {
        errors.confirmPassword = 'Please confirm your password'
      } else if (password !== confirmPassword) {
        errors.confirmPassword = 'Passwords do not match'
      }
    }

    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')

    if (!validateForm()) {
      return
    }

    setIsLoading(true)

    try {
      if (isSignUp) {
        const result = await signUp.email({
          email,
          password,
          name,
          callbackURL: '/data/projects',
        })

        if (result.error) {
          setError(
            result.error.message || 'Failed to sign up. Please try again.',
          )
        } else {
          onLoggedIn()
        }
      } else {
        const result = await signIn.email({
          email,
          password,
          callbackURL: '/data/projects',
        })

        if (result.error) {
          setError(result.error.message || 'Invalid email or password.')
        } else {
          onLoggedIn()
        }
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.')
      console.error('Auth error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const toggleMode = () => {
    setIsSignUp(!isSignUp)
    setError('')
    setFieldErrors({})
    setPassword('')
    setConfirmPassword('')
  }

  return (
    <div className={styles.authContainer}>
      <div className={styles.authCard}>
        <div className={styles.authHeader}>
          <h1 className={styles.authTitle}>
            {isSignUp ? 'Create Account' : 'Welcome Back'}
          </h1>
          <p className={styles.authSubtitle}>
            {isSignUp ? 'Sign up to get started' : 'Sign in to continue'}
          </p>
        </div>

        {error && <div className={styles.generalError}>{error}</div>}

        <form className={styles.authForm} onSubmit={handleSubmit}>
          {isSignUp && (
            <div className={styles.formGroup}>
              <label htmlFor="name" className={styles.formLabel}>
                Name
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={`${styles.formInput} ${fieldErrors.name ? styles.error : ''}`}
                placeholder="Enter your name"
                disabled={isLoading}
              />
              {fieldErrors.name && (
                <p className={styles.errorMessage}>{fieldErrors.name}</p>
              )}
            </div>
          )}

          <div className={styles.formGroup}>
            <label htmlFor="email" className={styles.formLabel}>
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`${styles.formInput} ${fieldErrors.email ? styles.error : ''}`}
              placeholder="Enter your email"
              disabled={isLoading}
            />
            {fieldErrors.email && (
              <p className={styles.errorMessage}>{fieldErrors.email}</p>
            )}
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="password" className={styles.formLabel}>
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`${styles.formInput} ${fieldErrors.password ? styles.error : ''}`}
              placeholder="Enter your password"
              disabled={isLoading}
            />
            {fieldErrors.password && (
              <p className={styles.errorMessage}>{fieldErrors.password}</p>
            )}
          </div>

          {isSignUp && (
            <div className={styles.formGroup}>
              <label htmlFor="confirmPassword" className={styles.formLabel}>
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={`${styles.formInput} ${fieldErrors.confirmPassword ? styles.error : ''}`}
                placeholder="Confirm your password"
                disabled={isLoading}
              />
              {fieldErrors.confirmPassword && (
                <p className={styles.errorMessage}>
                  {fieldErrors.confirmPassword}
                </p>
              )}
            </div>
          )}

          <button
            type="submit"
            className={styles.submitButton}
            disabled={isLoading}
          >
            {isLoading ? 'Please wait...' : isSignUp ? 'Sign Up' : 'Sign In'}
          </button>
        </form>

        <div className={styles.toggleContainer}>
          <p className={styles.toggleText}>
            {isSignUp ? 'Already have an account?' : "Don't have an account?"}
          </p>
          <button
            type="button"
            onClick={toggleMode}
            className={styles.toggleButton}
            disabled={isLoading}
          >
            {isSignUp ? 'Sign In' : 'Sign Up'}
          </button>
        </div>
      </div>
    </div>
  )
}
