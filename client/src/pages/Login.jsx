import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetSent, setResetSent] = useState(false);
  const [resetError, setResetError] = useState('');
  const [showReset, setShowReset] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const result = await login(formData.email, formData.password);
    
    if (result.success) {
      navigate('/');
    } else {
      setError(result.error);
    }
    
    setLoading(false);
  };

  const handleReset = async (e) => {
    e.preventDefault();
    setResetError('');
    setResetSent(false);
    try {
      // Replace with your actual API endpoint for password reset
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: resetEmail })
      });
      const data = await res.json();
      if (res.ok) {
        setResetSent(true);
      } else {
        setResetError(data.message || 'Failed to send reset email.');
      }
    } catch (err) {
      setResetError('Failed to send reset email.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sign in to ShiurFinder
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Discover your next favorite Torah shiur
          </p>
        </div>
        {showReset ? (
          <form className="mt-8 space-y-6" onSubmit={handleReset}>
            {resetSent && (
              <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
                If an account exists for this email, a reset link has been sent.
              </div>
            )}
            {resetError && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                {resetError}
              </div>
            )}
            <div className="space-y-4">
              <div>
                <label htmlFor="resetEmail" className="sr-only">
                  Email address
                </label>
                <input
                  id="resetEmail"
                  name="resetEmail"
                  type="email"
                  required
                  className="input-field"
                  placeholder="Enter your email address"
                  value={resetEmail}
                  onChange={e => setResetEmail(e.target.value)}
                />
              </div>
            </div>
            <div>
              <button
                type="submit"
                disabled={resetSent}
                className="w-full btn-primary disabled:opacity-50"
              >
                {resetSent ? 'Email Sent' : 'Send Password Reset Email'}
              </button>
            </div>
            <div className="text-center mt-2">
              <button
                type="button"
                className="text-primary-600 hover:text-primary-700 font-medium"
                onClick={() => setShowReset(false)}
              >
                Back to Sign In
              </button>
            </div>
          </form>
        ) : (
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}
            <div className="space-y-4">
              <div>
                <label htmlFor="email" className="sr-only">
                  Email address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  className="input-field"
                  placeholder="Email address"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label htmlFor="password" className="sr-only">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  className="input-field"
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleChange}
                />
              </div>
            </div>
            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Signing in...' : 'Sign in'}
              </button>
            </div>
            <div className="text-center mt-2">
              <button
                type="button"
                className="text-primary-600 hover:text-primary-700 font-medium"
                onClick={() => setShowReset(true)}
              >
                Forgot password?
              </button>
            </div>
            <div className="text-center">
              <span className="text-gray-600">Don't have an account? </span>
              <Link to="/signup" className="text-primary-600 hover:text-primary-700 font-medium">
                Sign up
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default Login;