/**
 * Authentication hook for managing user session state.
 */

'use client';

import { useState, useEffect, useCallback, createContext, useContext, ReactNode } from 'react';
import {
  authService,
  isAuthenticated,
  clearTokens,
  type User,
  type LoginCredentials,
  type UserRegistrationData,
  type ApiResponse,
  type LoginResponse,
  type RegistrationResponse,
} from '@/lib/api';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isLoggedIn: boolean;
  login: (credentials: LoginCredentials) => Promise<ApiResponse<LoginResponse>>;
  register: (data: UserRegistrationData) => Promise<ApiResponse<RegistrationResponse>>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check authentication status on mount
  useEffect(() => {
    const checkAuth = async () => {
      if (isAuthenticated()) {
        try {
          const response = await authService.getProfile();
          if (response.success && response.data) {
            setUser(response.data);
          } else {
            clearTokens();
          }
        } catch {
          clearTokens();
        }
      }
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  const login = useCallback(async (credentials: LoginCredentials) => {
    const response = await authService.login(credentials);
    
    if (response.success) {
      // Fetch user profile after login
      const profileResponse = await authService.getProfile();
      if (profileResponse.success && profileResponse.data) {
        setUser(profileResponse.data);
      }
    }
    
    return response;
  }, []);

  const register = useCallback(async (data: UserRegistrationData) => {
    const response = await authService.register(data);
    
    if (response.success) {
      // Fetch user profile after registration
      const profileResponse = await authService.getProfile();
      if (profileResponse.success && profileResponse.data) {
        setUser(profileResponse.data);
      }
    }
    
    return response;
  }, []);

  const logout = useCallback(async () => {
    await authService.logout();
    setUser(null);
  }, []);

  const refreshUser = useCallback(async () => {
    if (isAuthenticated()) {
      const response = await authService.getProfile();
      if (response.success && response.data) {
        setUser(response.data);
      }
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isLoggedIn: !!user,
        login,
        register,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
}

export default useAuth;
