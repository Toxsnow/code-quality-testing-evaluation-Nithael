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
        maxWidth: '400px',
        margin: '0 auto',
        padding: '20px',
        boxShadow: '0 0 10px rgba(0,0,0,0.1)',
        borderRadius: '8px'
      }}
    >
      <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>Login</h2>
      {error && (
        <div
          style={{
            color: 'red',
            marginBottom: '10px',
            padding: '10px',
            backgroundColor: '#ffebee',
            borderRadius: '4px'
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
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          style={{
            padding: '8px',
            borderRadius: '4px',
            border: '1px solid #ddd'
          }}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{
            padding: '8px',
            borderRadius: '4px',
            border: '1px solid #ddd'
          }}
        />
        <button
          type="submit"
          style={{
            padding: '10px',
            backgroundColor: '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Login
        </button>
      </form>
      <p
        style={{
          textAlign: 'center',
          marginTop: '20px'
        }}
      >
        Don't have an account? <Link to="/register">Register</Link>
      </p>
    </div>
  );
};

export default Login;
