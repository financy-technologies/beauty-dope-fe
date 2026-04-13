import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { api, setToken, clearToken, getToken } from '@/integrations/api/client';

interface ApiUser {
  id: string;
  email: string;
  displayName: string | null;
  profile?: {
    username: string | null;
    displayName: string | null;
    avatarUrl: string | null;
    bio: string | null;
    skinType: string | null;
    skinConcerns: string[];
    skinSensitivities: string[];
    ageRange: string | null;
    points: number;
    pointsEarnedTotal: number;
  } | null;
}

interface AuthContextType {
  user: ApiUser | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, displayName?: string) => Promise<void>;
  signInWithGoogle: (credential: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<ApiUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (getToken()) {
      api.get<ApiUser>('/auth/me')
        .then(setUser)
        .catch(() => { clearToken(); setUser(null); })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const signIn = async (email: string, password: string) => {
    const { accessToken, user: u } = await api.post<{ accessToken: string; user: ApiUser }>(
      '/auth/login', { email, password }
    );
    setToken(accessToken);
    setUser(u);
  };

  const signUp = async (email: string, password: string, displayName?: string) => {
    const { accessToken, user: u } = await api.post<{ accessToken: string; user: ApiUser }>(
      '/auth/register', { email, password, displayName }
    );
    setToken(accessToken);
    setUser(u);
  };

  // credential = Google ID token (JWT) from @react-oauth/google
  const signInWithGoogle = async (credential: string) => {
    const { accessToken, user: u } = await api.post<{ accessToken: string; user: ApiUser }>(
      '/auth/google', { credential }
    );
    setToken(accessToken);
    setUser(u);
  };

  const signOut = async () => {
    clearToken();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signInWithGoogle, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
