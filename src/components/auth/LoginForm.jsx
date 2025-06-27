// components/auth/LoginForm.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthAPI } from '../../contracts/AuthAPI';
import Input from '../ui/Input';
import Button from '../ui/Button';
import Notification from '../shared/Notification';
import './LoginForm.css'; // Component-specific styles

const LoginForm = ({ onSuccess }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notification, setNotification] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user types
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.email) newErrors.email = 'Email is required';
    if (!formData.password) newErrors.password = 'Password is required';
    
    // Basic email format validation
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    setNotification(null);
    
    try {
      // Call the AuthAPI login method
      const user = await AuthAPI.login(formData.email, formData.password);
      
      // Show success notification
      setNotification({
        type: 'success',
        message: `Welcome back, ${user.name}!`
      });
      
      // Call optional onSuccess callback if provided
      if (onSuccess) {
        onSuccess(user);
      }
      
      // Redirect to dashboard after 1 second
      setTimeout(() => navigate('/dashboard'), 1000);
      
    } catch (error) {
      setNotification({
        type: 'error',
        message: error.message || 'Login failed. Please try again.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="login-form-container">
      <h2>Login to UniPool</h2>
      
      {notification && (
        <Notification 
          type={notification.type}
          message={notification.message}
          onClose={() => setNotification(null)}
        />
      )}
      
      <form onSubmit={handleSubmit} className="login-form">
        <Input
          label="University Email"
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          error={errors.email}
          placeholder="your.email@formanite.fccollege.edu.pk"
          required
        />
        
        <Input
          label="Password"
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          error={errors.password}
          placeholder="Enter your password"
          required
        />
        
        <div className="form-actions">
          <Button 
            type="submit" 
            disabled={isSubmitting}
            className="login-button"
          >
            {isSubmitting ? 'Logging in...' : 'Login'}
          </Button>
          
          <div className="form-links">
            <button 
              type="button" 
              className="text-button"
              onClick={() => navigate('/register')}
            >
              Don't have an account? Register
            </button>
            <button 
              type="button" 
              className="text-button"
              onClick={() => setNotification({
                type: 'info',
                message: 'Please contact campus IT to reset your password'
              })}
            >
              Forgot password?
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default LoginForm;