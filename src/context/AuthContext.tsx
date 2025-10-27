import React, { createContext, useContext, useEffect, useState } from 'react';
import { getCurrentUser, signOut, AppUser } from '../lib/auth';
import { supabase } from '../lib/supabase';

interface AuthContextType {
  user: AppUser | null;
  loading: boolean;
  refreshUser: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  refreshUser: () => {},
});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = () => {
    const currentUser = getCurrentUser();
    setUser(currentUser);
  };

  useEffect(() => {
    refreshUser();
    setLoading(false);

    const interval = setInterval(async () => {
      const currentUser = getCurrentUser();
      if (currentUser) {
        const { data, error } = await supabase
          .from('app_users')
          .select('id')
          .eq('id', currentUser.id)
          .maybeSingle();

        if (error || !data) {
          await signOut();
          setUser(null);
          window.location.reload();
        }
      }
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};
