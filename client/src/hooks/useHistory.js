import { useState, useEffect, useCallback } from 'react';
import { api } from './useAuth';

export function useHistory() {
  const [builds, setBuilds] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchHistory = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/history');
      setBuilds(res.data.builds || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch history');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchBuild = useCallback(async (buildId) => {
    try {
      const res = await api.get(`/history/${buildId}`);
      return res.data.build;
    } catch (err) {
      throw new Error(err.response?.data?.message || 'Failed to fetch build');
    }
  }, []);

  const deleteBuild = useCallback(async (buildId) => {
    try {
      await api.delete(`/history/${buildId}`);
      setBuilds(prev => prev.filter(b => b._id !== buildId));
    } catch (err) {
      throw new Error(err.response?.data?.message || 'Failed to delete build');
    }
  }, []);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  return { builds, loading, error, fetchHistory, fetchBuild, deleteBuild };
}

export default useHistory;
