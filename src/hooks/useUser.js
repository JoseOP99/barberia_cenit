import { useState, useEffect, useCallback } from 'react';
import authService from '../services/authService';

export function useUser() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const initializeUser = async () => {
      try {
        setLoading(true);
        const currentUser = await authService.getCurrentUser();

        if (isMounted) {
          setUser(currentUser);

          if (currentUser) {
            try {
              const userProfile = await authService.getProfile(currentUser.id);
              setProfile(userProfile);
              setIsAdmin(userProfile?.role === 'admin');
            } catch (err) {
              console.error('Error fetching profile:', err);
              setIsAdmin(false);
            }
          } else {
            setProfile(null);
            setIsAdmin(false);
          }
        }
      } catch {
        if (isMounted) {
          setUser(null);
          setProfile(null);
          setIsAdmin(false);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    initializeUser();

    // Subscribe to auth changes
    const subscription = authService.onAuthStateChange(async (event, session) => {
      if (isMounted) {
        if (session?.user) {
          setUser(session.user);
          try {
            const userProfile = await authService.getProfile(session.user.id);
            setProfile(userProfile);
            setIsAdmin(userProfile?.role === 'admin');
          } catch (err) {
            console.error('Error fetching profile on auth change:', err);
            setIsAdmin(false);
          }
        } else {
          setUser(null);
          setProfile(null);
          setIsAdmin(false);
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
      setLoading(true);
      setError(null);
      const updated = await authService.updateProfile(user.id, updates);
      setProfile(updated);
      if (updates.role) {
        setIsAdmin(updated?.role === 'admin');
      }
      return updated;
    } catch (err) {
      const errorMsg = err.message || 'Error al actualizar perfil';
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [user]);

  const signOut = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      await authService.signOut();
      setUser(null);
      setProfile(null);
      setIsAdmin(false);
    } catch (err) {
      const errorMsg = err.message || 'Error al cerrar sesión';
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const signIn = useCallback(async (email, password) => {
    try {
      setLoading(true);
      setError(null);
      const data = await authService.signIn(email, password);
      if (data?.user) {
        setUser(data.user);
        const userProfile = await authService.getProfile(data.user.id);
        setProfile(userProfile);
        setIsAdmin(userProfile?.role === 'admin');
      }
      return data;
    } catch (err) {
      const errorMsg = err.message || 'Error al iniciar sesión';
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const signUp = useCallback(async (email, password, fullName = '') => {
    try {
      setLoading(true);
      setError(null);
      const data = await authService.signUp(email, password, fullName);
      return data;
    } catch (err) {
      const errorMsg = err.message || 'Error al registrarse';
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const clearError = useCallback(() => setError(null), []);

  return {
    user,
    profile,
    loading,
    error,
    isLoggedIn: !!user,
    isAdmin,
    updateProfile,
    signOut,
    signIn,
    signUp,
    clearError
  };
}

export default useUser;
