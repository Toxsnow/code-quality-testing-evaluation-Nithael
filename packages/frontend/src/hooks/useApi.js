import axios from 'axios';
import { useState, useCallback } from 'react';

export const useApi = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const request = useCallback(async (config) => {
    const token = localStorage.getItem('token');

    try {
      setLoading(true);
      setError(null);

      const response = await axios({
        ...config,
        headers: {
          ...config.headers,
          Authorization: token ? `Bearer ${token}` : undefined
        }
      });

      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.message || 'An error occurred';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const get = (url) => request({ method: 'GET', url });
  const post = (url, data) => request({ data, method: 'POST', url });
  const put = (url, data) => request({ data, method: 'PUT', url });
  const del = (url) => request({ method: 'DELETE', url });

  return {
    delete: del,
    error,
    get,
    loading,
    post,
    put,
    request
  };
};
