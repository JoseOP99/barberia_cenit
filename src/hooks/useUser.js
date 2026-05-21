import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../services/supabaseClient';
import authService from '../services/authService';

export function useUser() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const getUser = async () => {
      try {
        setLoading(true);
        const currentUser = await authService.getCurrentUser();
        if (isMounted) {
          setUser(currentUser);

          if (currentUser) {
            const userProfile = await authService.getProfile(currentUser.id);
            setProfile(userProfile);
          }
        }
      } catch (err) {
        console.error('Error fetching user:', err);
        if (isMounted) {
          setError(err.message);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    getUser();

    // Subscribe to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (isMounted) {
        if (session?.user) {
          setUser(session.user);
          try {
            const userProfile = await authService.getProfile(session.user.id);
            setProfile(userProfile);
          } catch (err) {
            console.error('Error fetching profile:', err);
          }
        } else {
          setUser(null);
          setProfile(null);
        }
      }
    });

    return () => {
      isMounted = false;
      subscription?.unsubscribe();
    };
  }, []);

  const updateProfile = useCallback(async (updates) => {
    if (!user) throw new Error('No user logged in');
    try {
      const updated = await authService.upsertProfile(user.id, updates);
      setProfile(updated);
      return updated;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, [user]);

  const isAdmin = useCallback(async () => {
    if (!user) return false;
    try {
      return await authService.isAdmin(user.id);
    } catch (err) {
      console.error('Error checking admin status:', err);
      return false;
    }
  }, [user]);

  return {
    user,
    profile,
    loading,
    error,
    updateProfile,
    isAdmin,
    isLoggedIn: !!user
  };
}

export default useUser;
