import { useAuth, AuthProvider } from '../contexts/auth-context';

export { AuthProvider };
export { useAuth };

export function useAuthRequired() {
  const { user, isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) {
    return { user: null, isAuthenticated: false, isLoading: true };
  }

  if (!isAuthenticated) {
    throw new Error('Authentication required');
  }

  return { user, isAuthenticated, isLoading: false };
}
