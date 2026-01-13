import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

import { loginUser } from '../services/api';

const Login = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = await loginUser(username, password);
      // If login succeeded, trigger parent handler and navigate
      if (data && data.auth) {
        onLogin();
        navigate('/products');
      } else {
        // Defensive: show a clear message if backend returned auth:false
        setError(data.error || 'Invalid username or password');
      }
    } catch (err) {
      // err can be { error: '...' } or another shape from network
      if (err && err.error) setError(err.error);
      else if (err && err.message) setError(err.message);
      else setError('An error occurred');
    }
  };

  return (
    <div
      style={{
        borderRadius: '8px',
        boxShadow: '0 0 10px rgba(0,0,0,0.1)',
        margin: '0 auto',
        maxWidth: '400px',
        padding: '20px'
      }}
    >
      <h2 style={{ marginBottom: '20px', textAlign: 'center' }}>Login</h2>
      {error && (
        <div
          style={{
            backgroundColor: '#ffebee',
            borderRadius: '4px',
            color: 'red',
            marginBottom: '10px',
            padding: '10px'
          }}
        >
          {error}
        </div>
      )}
      <form
        onSubmit={handleSubmit}
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '15px'
        }}
      >
        <div>
          <label htmlFor="username" style={{ display: 'block', marginBottom: '5px' }}>
            Username
          </label>
          <input
            id="username"
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            style={{
              border: '1px solid #ddd',
              borderRadius: '4px',
              padding: '8px',
              width: '100%',
              boxSizing: 'border-box'
            }}
          />
        </div>
        <div>
          <label htmlFor="password" style={{ display: 'block', marginBottom: '5px' }}>
            Password
          </label>
          <input
            id="password"
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{
              border: '1px solid #ddd',
              borderRadius: '4px',
              padding: '8px',
              width: '100%',
              boxSizing: 'border-box'
            }}
          />
        </div>
        <button
          type="submit"
          style={{
            backgroundColor: '#4CAF50',
            border: 'none',
            borderRadius: '4px',
            color: 'white',
            cursor: 'pointer',
            padding: '10px'
          }}
        >
          Login
        </button>
      </form>
      <p
        style={{
          marginTop: '20px',
          textAlign: 'center'
        }}
      >
        Don&apos;t have an account? <Link to="/register">Register</Link>
      </p>
    </div>
  );
};

export default Login;
