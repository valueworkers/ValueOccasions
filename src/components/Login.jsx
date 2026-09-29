import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import './Login.css'
import axios from 'axios'

const Login = () => {
  const navigate = useNavigate()
  const [isSignup, setIsSignup] = useState(false)
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    middleName: '',
    lastName: '',
    mobileNumber: '',
    gender: '',
    address: '',
    city: '',
  })
  const [errors, setErrors] = useState({})
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)


  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  // If already logged in, redirect home
  useEffect(() => {
    const authUserRaw = localStorage.getItem('authUser')
    if (authUserRaw) {
      navigate('/')
    }
  }, [navigate])

  const validateForm = () => {
    const newErrors = {}

    if (isSignup) {
      // First Name validation
      if (!formData.firstName || !formData.firstName.trim()) {
        newErrors.firstName = 'First name is required'
      } else if (formData.firstName.trim().length < 2) {
        newErrors.firstName = 'First name must be at least 2 characters'
      } else if (formData.firstName.trim().length > 15) {
        newErrors.firstName = 'First name must be less than 15 characters'
      } else if (!/^[a-zA-Z\s'-]+$/.test(formData.firstName.trim())) {
        newErrors.firstName = 'First name can only contain letters, spaces, hyphens, and apostrophes'
      }

      // Last Name validation
      if (!formData.lastName || !formData.lastName.trim()) {
        newErrors.lastName = 'Last name is required'
      } else if (formData.lastName.trim().length < 2) {
        newErrors.lastName = 'Last name must be at least 2 characters'
      } else if (formData.lastName.trim().length > 15) {
        newErrors.lastName = 'Last name must be less than 15 characters'
      } else if (!/^[a-zA-Z\s'-]+$/.test(formData.lastName.trim())) {
        newErrors.lastName = 'Last name can only contain letters, spaces, hyphens, and apostrophes'
      }

      // Middle Name validation (optional, but validate if provided)
      if (formData.middleName && formData.middleName.trim()) {
        if (formData.middleName.trim().length > 15) {
          newErrors.middleName = 'Middle name must be less than 15 characters'
        } else if (!/^[a-zA-Z\s'-]+$/.test(formData.middleName.trim())) {
          newErrors.middleName = 'Middle name can only contain letters, spaces, hyphens, and apostrophes'
        }
      }

      // Gender validation
      if (!formData.gender) {
        newErrors.gender = 'Gender is required'
      } else if (!['M', 'F', 'O'].includes(formData.gender)) {
        newErrors.gender = 'Please select a valid gender option'
      }

      // Address validation
      if (!formData.address || !formData.address.trim()) {
        newErrors.address = 'Address is required'
      } else if (formData.address.trim().length < 5) {
        newErrors.address = 'Address must be at least 5 characters'
      } else if (formData.address.trim().length > 200) {
        newErrors.address = 'Address must be less than 200 characters'
      }

      // City validation
      if (!formData.city || !formData.city.trim()) {
        newErrors.city = 'City is required'
      } else if (formData.city.trim().length < 2) {
        newErrors.city = 'City must be at least 2 characters'
      } else if (formData.city.trim().length > 50) {
        newErrors.city = 'City must be less than 50 characters'
      } else if (!/^[a-zA-Z\s'-]+$/.test(formData.city.trim())) {
        newErrors.city = 'City can only contain letters, spaces, hyphens, and apostrophes'
      }

      // Mobile Number validation (supports country code like +91 or just 10 digits)
      if (!formData.mobileNumber || !formData.mobileNumber.trim()) {
        newErrors.mobileNumber = 'Mobile number is required'
      } else {
        const mobileNumber = formData.mobileNumber.trim()
        // Allow formats: +91XXXXXXXXXX or 10 digits
        const mobileRegex = /^(\+91)?[6-9]\d{9}$/
        const digitsOnly = mobileNumber.replace(/\D/g, '')
        
        if (mobileNumber.startsWith('+')) {
          // If starts with +, must be +91 followed by 10 digits starting with 6-9
          if (!/^\+91[6-9]\d{9}$/.test(mobileNumber)) {
            newErrors.mobileNumber = 'Mobile number with country code must be in format +91XXXXXXXXXX (10 digits starting with 6-9)'
          }
        } else {
          // If no country code, must be exactly 10 digits starting with 6-9
          if (!/^[6-9]\d{9}$/.test(mobileNumber)) {
            newErrors.mobileNumber = 'Mobile number must be 10 digits starting with 6, 7, 8, or 9'
          }
        }
      }

      // Email validation
      if (!formData.email || !formData.email.trim()) {
        newErrors.email = 'Email is required'
      } else {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(formData.email.trim())) {
          newErrors.email = 'Please enter a valid email address'
        } else if (formData.email.trim().length > 100) {
          newErrors.email = 'Email must be less than 100 characters'
        }
      }

      // Password validation
      if (!formData.password) {
        newErrors.password = 'Password is required'
      } else if (formData.password.length < 6) {
        newErrors.password = 'Password must be at least 6 characters'
      } else if (formData.password.length > 128) {
        newErrors.password = 'Password must be less than 128 characters'
      }

      // Confirm Password validation
      if (!formData.confirmPassword) {
        newErrors.confirmPassword = 'Please confirm your password'
      } else if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match'
      }
    } else {
      // Login validation
      if (!formData.email || !formData.email.trim()) {
        newErrors.email = 'Email is required'
      } else {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(formData.email.trim())) {
          newErrors.email = 'Please enter a valid email address'
        }
      }

      if (!formData.password) {
        newErrors.password = 'Password is required'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleLogin = async (e) => {
    e.preventDefault()
    
    // Validate form before making API call
    if (!validateForm()) {
      return
    }

    setIsLoading(true)
    setErrors({}) // Clear any previous errors
    
    try {
      const response = await axios.post(`${import.meta.env.VITE_BASEURL}/accounts/login/`, {
        username: formData.email.trim(),
        password: formData.password,
      })
      
      if (response.data.message === `Login successful as ${response.data.user.user_type}`) {
        // Store user data in localStorage
        const userData = {
          id: response.data.user.id,
          email: response.data.user.email,
          mobile_number: response.data.user.mobile_number,
          first_name: response.data.user.first_name,
          last_name: response.data.user.last_name,
          middle_name: response.data.user.middle_name,
          user_type: response.data.user.user_type,
          address: response.data.user.address,
          city: response.data.user.city,
          gender:response.data.user.gender,
          has_venues: response.data.user.has_venues,
          has_services: response.data.user.has_services,
          has_resources: response.data.user.has_resources
        }
        
        // Store tokens if available
        if (response.data.tokens) {
          const tokens = {
            access_token: response.data.tokens.access,
            refresh_token: response.data.tokens.refresh
          }
          localStorage.setItem('authTokens', JSON.stringify(tokens))
          localStorage.setItem('refresh_token', response.data.tokens.refresh)
          localStorage.setItem('access_token', response.data.tokens.access)
        }
        
        // Store user data
        localStorage.setItem('authUser', JSON.stringify(userData))
        localStorage.setItem('user_type', userData.user_type)
        // Notify other components about auth change
        window.dispatchEvent(new Event('auth-changed'))
        
        // Reset form
        setFormData({ username: '', email: '', password: '', confirmPassword: '', firstName: '', middleName: '', lastName: '', mobileNumber: '', gender: '', address: '', city: '' })
        
        // Redirect to home
        navigate('/')
        
      } else {
        setErrors({ general: 'Login failed. Please try again.' })
      }
      
    } catch (error) {
      console.error('Login error:', error)
      
      // Handle different types of errors
      if (error.response) {
        // Server responded with error status
        if (error.response.status === 401) {
          setErrors({ general: 'Invalid email or password' })
        } else if (error.response.status === 400) {
          setErrors({ general: 'Please check your credentials and try again' })
        } else {
          setErrors({ general: 'Login failed. Please try again.' })
        }
      } else if (error.request) {
        // Network error
        setErrors({ general: 'Network error. Please check your connection and try again.' })
      } else {
        // Other error
        setErrors({ general: 'Login failed. Please try again.' })
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleSignup = async (e) => {
    e.preventDefault()
    
    // Validate form before making API call
    if (!validateForm()) {
      return
    }

    setIsLoading(true)
    setErrors({}) // Clear any previous errors
    
    try {
      // Prepare signup data with trimmed values
      const signupData = {
        email: formData.email.trim(),
        password: formData.password,
        confirm_password: formData.confirmPassword,
        first_name: formData.firstName.trim(),
        middle_name: formData.middleName ? formData.middleName.trim() : '',
        last_name: formData.lastName.trim(),
        mobile_number: formData.mobileNumber.trim(),
        gender: formData.gender,
        address: formData.address.trim(),
        city: formData.city.trim(),
      }
      
       // Api for the Signup
       const response = await axios.post(`${import.meta.env.VITE_BASEURL}/accounts/register/customer/`, signupData)
       
       
       if (response.data.message === "Registration successful" || response.status === 201) {
         // Reset form
         setFormData({ username: '', email: '', password: '', confirmPassword: '', firstName: '', middleName: '', lastName: '', mobileNumber: '', gender: '', address: '', city: '' })
         
         // Switch to login mode
         setIsSignup(false)
         
         // Show success popup
         setErrors({ success: 'Account created successfully! Please sign in.' })
         
         // Clear success message after 3 seconds
         setTimeout(() => {
           setErrors({})
         }, 3000)
         
       } else {
         setErrors({ general: 'Registration failed. Please try again.' })
       }
      
    } catch (error) {
      console.error('Signup error:', error)
      
      // Handle different types of errors
      if (error.response) {
        // Server responded with error status
        if (error.response.status === 400) {
          if (error.response.data?.email) {
            setErrors({ email: 'Email already exists. Please use a different email.' })
          } else if (error.response.data?.mobile_number) {
            setErrors({ mobileNumber: 'Mobile number already exists. Please use a different number.' })
          } else {
            setErrors({ general: 'Please check your information and try again.' })
          }
        } else if (error.response.status === 422) {
          setErrors({ general: 'Invalid data provided. Please check all fields.' })
        } else {
          setErrors({ general: 'Registration failed. Please try again.' })
        }
      } else if (error.request) {
        // Network error
        setErrors({ general: 'Network error. Please check your connection and try again.' })
      } else {
        // Other error
        setErrors({ general: 'Registration failed. Please try again.' })
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = (e) => {
    if (isSignup) {
      handleSignup(e)
    } else {
      handleLogin(e)
    }
  }

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h2>{isSignup ? 'Create Account' : 'Welcome Back'}</h2>
          <p>{isSignup ? 'Sign up for a new account' : 'Sign in to your account'}</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          {errors.success && (
            <div className="success-popup">
              <div className="success-icon">✓</div>
              <div className="success-text">{errors.success}</div>
            </div>
          )}
          
          {errors.general && (
            <div className="error-message general-error">
              {errors.general}
            </div>
          )}

          {isSignup && (
            <>
              <div className="form-group">
                <label htmlFor="firstName">First Name <span className="required-mark">*</span></label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  placeholder="Enter your first name"
                  className={errors.firstName ? 'error' : ''}
                />
                {errors.firstName && <span className="error-text">{errors.firstName}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="middleName">Middle Name (Optional)</label>
                <input
                  type="text"
                  id="middleName"
                  name="middleName"
                  value={formData.middleName || ''}
                  onChange={handleInputChange}
                  placeholder="Enter your middle name"
                  className={errors.middleName ? 'error' : ''}
                />
                {errors.middleName && <span className="error-text">{errors.middleName}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="lastName">Last Name <span className="required-mark">*</span></label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  placeholder="Enter your last name"
                  className={errors.lastName ? 'error' : ''}
                />
                {errors.lastName && <span className="error-text">{errors.lastName}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="gender">Gender <span className="required-mark">*</span></label>
                <select
                  id="gender"
                  name="gender"
                  value={formData.gender || ''}
                  onChange={handleInputChange}
                  className={errors.gender ? 'error' : ''}
                >
                  <option value="">Select gender</option>
                  <option value="M">Male</option>
                  <option value="F">Female</option>
                  <option value="O">Other</option>
                </select>
                {errors.gender && <span className="error-text">{errors.gender}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="address">Address <span className="required-mark">*</span></label>
                <input
                  type="text"
                  id="address"
                  name="address"
                  value={formData.address || ''}
                  onChange={handleInputChange}
                  placeholder="Enter your address"
                  className={errors.address ? 'error' : ''}
                />
                {errors.address && <span className="error-text">{errors.address}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="city">City <span className="required-mark">*</span></label>
                <input
                  type="text"
                  id="city"
                  name="city"
                  value={formData.city || ''}
                  onChange={handleInputChange}
                  placeholder="Enter your city"
                  className={errors.city ? 'error' : ''}
                />
                {errors.city && <span className="error-text">{errors.city}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="mobileNumber">Mobile Number <span className="required-mark">*</span></label>
                <input
                  type="tel"
                  id="mobileNumber"
                  name="mobileNumber"
                  value={formData.mobileNumber}
                  onChange={handleInputChange}
                  placeholder="Enter your mobile number"
                  className={errors.mobileNumber ? 'error' : ''}
                />
                {errors.mobileNumber && <span className="error-text">{errors.mobileNumber}</span>}
              </div>

            </>
          )}

          <div className="form-group">
            <label htmlFor="email">Email Address <span className="required-mark">*</span></label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="Enter your email"
              className={errors.email ? 'error' : ''}
            />
            {errors.email && <span className="error-text">{errors.email}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="password">Password <span className="required-mark">*</span></label>
            <div className="password-input-container">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="Enter your password"
                className={errors.password ? 'error' : ''}
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex="-1"
              >
                {showPassword ? (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                    <line x1="1" y1="1" x2="23" y2="23"/>
                  </svg>
                ) : (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                    <circle cx="12" cy="12" r="3"/>
                  </svg>
                )}
              </button>
            </div>
            {errors.password && <span className="error-text">{errors.password}</span>}
          </div>

          {isSignup && (
            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm Password <span className="required-mark">*</span></label>
              <div className="password-input-container">
                <input
                  type={showPassword ? "text" : "password"}
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  placeholder="Confirm your password"
                  className={errors.confirmPassword ? 'error' : ''}
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex="-1"
                >
                  {showPassword ? (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                      <line x1="1" y1="1" x2="23" y2="23"/>
                    </svg>
                  ) : (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                      <circle cx="12" cy="12" r="3"/>
                    </svg>
                  )}
                </button>
              </div>
              {errors.confirmPassword && <span className="error-text">{errors.confirmPassword}</span>}
            </div>
          )}

          {!isSignup && (
            <div className="form-options">
              <label className="checkbox-label">
                <input type="checkbox" />
                <span>Remember me</span>
              </label>
              <a href="#" className="forgot-password">Forgot Password?</a>
            </div>
          )}

          <button 
            type="submit" 
            className="login-button"
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="button-loader">
                <div className="spinner"></div>
                <span>{isSignup ? 'Creating Account...' : 'Signing In...'}</span>
              </div>
            ) : (
              isSignup ? 'Sign Up' : 'Sign In'
            )}
          </button>
        </form>

        <div className="login-footer">
          <p>
            {isSignup ? "Already have an account? " : "Don't have an account? "}
            <a 
              href="#" 
              className="signup-link"
              onClick={(e) => {
                e.preventDefault()
                setIsSignup(!isSignup)
                setFormData({ username: '', email: '', password: '', confirmPassword: '', firstName: '', middleName: '', lastName: '', mobileNumber: '', gender: '', address: '', city: '' })
                setErrors({})
              }}
            >
              {isSignup ? 'Sign in' : 'Sign up'}
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Login