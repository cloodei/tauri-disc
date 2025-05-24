import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';

type User = {
  id: string;
  username: string;
  email: string;
  displayName: string;
  avatar?: string;
};

type AuthContextType = {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string, displayName: string) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
      } catch (error) {
        console.error('Failed to check auth status', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (email: string, _password: string) => {
    try {
      const mockUser = {
        id: '1',
        username: email.split('@')[0],
        email,
        displayName: email.split('@')[0],
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`,
      };

      await new Promise(resolve => setTimeout(resolve, 800));

      setUser(mockUser);
      localStorage.setItem('user', JSON.stringify(mockUser));
      navigate('/channels/me');
    } catch (error) {
      console.error('Login failed:', error);
      throw new Error('Failed to log in');
    }
  };

  const register = async (username: string, email: string, _password: string, displayName: string) => {
    try {
      const mockUser = {
        id: Date.now().toString(),
        username,
        email,
        displayName: displayName || username,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`,
      };

      await new Promise(resolve => setTimeout(resolve, 800));

      setUser(mockUser);
      localStorage.setItem('user', JSON.stringify(mockUser));
      navigate('/channels/me');
    } catch (error) {
      console.error('Registration failed:', error);
      throw new Error('Failed to register');
    }
  };

  const logout = async () => {
    try {
      await new Promise(resolve => setTimeout(resolve, 200));
      
      setUser(null);
      localStorage.removeItem('user');
      navigate('/auth');
    } catch (error) {
      console.error('Logout failed:', error);
      throw new Error('Failed to log out');
    }
  };

  const value = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
}
