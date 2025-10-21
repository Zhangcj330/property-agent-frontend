'use client';

// Authentication Context - Global authentication state management

import React, { createContext, useContext, useReducer, useEffect, useCallback, ReactNode } from 'react';
import { 
  AuthState, 
  UserProfile, 
  LoginCredentials, 
  RegistrationData, 
  MigrationResult,
  LOCAL_STORAGE_KEYS,
  AuthEventType
} from '@/types/auth';
import { TokenManager } from '@/lib/auth/tokenManager';
import { SessionManager } from '@/lib/auth/sessionManager';
import authClient from '@/lib/auth/authClient';

// Authentication context type definition
interface AuthContextType {
  // State
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  sessionId: string;

  // Authentication methods
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegistrationData) => Promise<void>;
  logout: () => Promise<void>;
  refreshAuth: () => Promise<void>;
  
  // User management
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  
  // Session management
  migrateSession: () => Promise<MigrationResult | null>;
  
  // Error handling
  clearError: () => void;
  
  // Event handling
  emitAuthEvent: (type: AuthEventType, payload?: unknown) => void;
}

// Action type definition
type AuthAction = 
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_USER'; payload: UserProfile | null }
  | { type: 'SET_AUTHENTICATED'; payload: boolean }
  | { type: 'SET_SESSION_ID'; payload: string }
  | { type: 'RESET_STATE' };

// Initial state
const initialState: AuthState = {
  isAuthenticated: false,
  user: null,
  tokens: null,
  sessionId: '',
  loading: true,
  error: null,
};

// Reducer function
function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
    
    case 'SET_USER':
      return { 
        ...state, 
        user: action.payload,
        isAuthenticated: !!action.payload,
        loading: false,
        error: null
      };
    
    case 'SET_AUTHENTICATED':
      return { ...state, isAuthenticated: action.payload };
    
    case 'SET_SESSION_ID':
      return { ...state, sessionId: action.payload };
    
    case 'RESET_STATE':
      return { 
        ...initialState, 
        loading: false,
        sessionId: state.sessionId // Keep session ID
      };
    
    default:
      return state;
  }
}

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// AuthProvider component
interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  /**
   * Emit authentication event
   */
  const emitAuthEvent = useCallback((type: AuthEventType, payload?: unknown) => {
    const event = new CustomEvent(`auth:${type}`, {
      detail: { type, payload, timestamp: new Date() }
    });
    window.dispatchEvent(event);
  }, []);

  /**
   * Clear error state
   */
  const clearError = useCallback(() => {
    dispatch({ type: 'SET_ERROR', payload: null });
  }, []);

  /**
   * Handle logout logic
   */
  const handleLogout = useCallback(() => {
    // 清除认证状态
    dispatch({ type: 'RESET_STATE' });
    
    // 清除本地存储
    if (typeof window !== 'undefined') {
      localStorage.removeItem(LOCAL_STORAGE_KEYS.USER_PROFILE);
    }
    
    // 清理 Token 管理器
    TokenManager.cleanup();
    
    emitAuthEvent('logout');
  }, [emitAuthEvent]);

  /**
   * Initialize authentication state
   */
  const initializeAuth = useCallback(async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });

      // Initialize Token manager
      TokenManager.initialize();
      
      // Initialize session manager
      SessionManager.initialize();
      
      // Set session ID
      const sessionId = SessionManager.getCurrentSessionId();
      dispatch({ type: 'SET_SESSION_ID', payload: sessionId });

      // Check if there's a valid access token
      if (TokenManager.hasValidToken()) {
        try {
          // 获取用户资料
          const user = await authClient.getUserProfile();
          dispatch({ type: 'SET_USER', payload: user });
          
          // Save user profile to local storage
          if (typeof window !== 'undefined') {
            localStorage.setItem(LOCAL_STORAGE_KEYS.USER_PROFILE, JSON.stringify(user));
          }
          
          emitAuthEvent('login_success', user);
        } catch (error) {
          console.error('Failed to get user profile:', error);
          // Token 可能无效，清除并使用匿名模式
          TokenManager.clearTokens();
          dispatch({ type: 'SET_USER', payload: null });
        }
      } else {
        // 尝试从本地存储恢复用户资料（离线模式）
        if (typeof window !== 'undefined') {
          const savedUser = localStorage.getItem(LOCAL_STORAGE_KEYS.USER_PROFILE);
          if (savedUser) {
            try {
              const user = JSON.parse(savedUser);
              dispatch({ type: 'SET_USER', payload: user });
            } catch (error) {
              console.error('Failed to parse saved user profile:', error);
              localStorage.removeItem(LOCAL_STORAGE_KEYS.USER_PROFILE);
            }
          }
        }
        
        dispatch({ type: 'SET_USER', payload: null });
      }
    } catch (error) {
      console.error('Auth initialization failed:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to initialize authentication' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [emitAuthEvent]);

  /**
   * User login
   */
  const login = useCallback(async (credentials: LoginCredentials) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });

      const authResponse = await authClient.login(credentials);
      
      // Set user state
      dispatch({ type: 'SET_USER', payload: authResponse.user });
      
      // Save user profile to local storage
      if (typeof window !== 'undefined') {
        localStorage.setItem(LOCAL_STORAGE_KEYS.USER_PROFILE, JSON.stringify(authResponse.user));
      }

      // 如果有迁移结果，处理数据迁移
      if (authResponse.migrationResult) {
        SessionManager.cleanupAnonymousData();
      }

      emitAuthEvent('login_success', authResponse.user);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Login failed';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      emitAuthEvent('login_failed', { error: errorMessage });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [emitAuthEvent]);

  /**
   * User registration
   */
  const register = useCallback(async (data: RegistrationData) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });

      // 如果有会话数据需要迁移，添加 sessionId
      if (SessionManager.hasDataToMigrate()) {
        data.sessionId = SessionManager.getCurrentSessionId();
      }

      const authResponse = await authClient.register(data);
      
      // Set user state
      dispatch({ type: 'SET_USER', payload: authResponse.user });
      
      // Save user profile to local storage
      if (typeof window !== 'undefined') {
        localStorage.setItem(LOCAL_STORAGE_KEYS.USER_PROFILE, JSON.stringify(authResponse.user));
      }

      // 处理数据迁移
      if (authResponse.migrationResult) {
        SessionManager.cleanupAnonymousData();
      }

      emitAuthEvent('register_success', authResponse.user);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Registration failed';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      emitAuthEvent('register_failed', { error: errorMessage });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [emitAuthEvent]);

  /**
   * User logout
   */
  const logout = useCallback(async () => {
    try {
      await authClient.logout();
    } catch (error) {
      console.error('Logout API call failed:', error);
    } finally {
      handleLogout();
    }
  }, [handleLogout]);

  /**
   * Refresh authentication state
   */
  const refreshAuth = useCallback(async () => {
    try {
      if (TokenManager.hasValidToken()) {
        const user = await authClient.getUserProfile();
        dispatch({ type: 'SET_USER', payload: user });
        
        if (typeof window !== 'undefined') {
          localStorage.setItem(LOCAL_STORAGE_KEYS.USER_PROFILE, JSON.stringify(user));
        }
      }
    } catch (error) {
      console.error('Failed to refresh auth:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to refresh authentication' });
    }
  }, []);

  /**
   * Update user profile
   */
  const updateProfile = useCallback(async (updates: Partial<UserProfile>) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      const updatedUser = await authClient.updateUserProfile(updates);
      dispatch({ type: 'SET_USER', payload: updatedUser });
      
      if (typeof window !== 'undefined') {
        localStorage.setItem(LOCAL_STORAGE_KEYS.USER_PROFILE, JSON.stringify(updatedUser));
      }

      emitAuthEvent('profile_updated', updatedUser);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update profile';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [emitAuthEvent]);

  /**
   * Migrate anonymous session data
   */
  const migrateSession = useCallback(async (): Promise<MigrationResult | null> => {
    if (!SessionManager.hasDataToMigrate()) {
      return null;
    }

    try {
      const sessionId = SessionManager.getCurrentSessionId();
      const result = await authClient.migrateSession(sessionId);
      
      if (result.success) {
        SessionManager.cleanupAnonymousData();
      }

      emitAuthEvent('session_migration', result);
      return result;
    } catch (error: unknown) {
      console.error('Session migration failed:', error);
      throw error;
    }
  }, [emitAuthEvent]);

  // Initialize authentication state
  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  // Listen to authentication related events
  useEffect(() => {
    const handleTokenExpired = () => {
      console.log('Token expired, logging out...');
      handleLogout();
    };

    const handleTokenRefreshed = (event: CustomEvent) => {
      console.log('Token refreshed:', event.detail);
      // Token 刷新成功，可以继续使用
    };

    const handleMigrationCompleted = (event: CustomEvent) => {
      console.log('Migration completed:', event.detail);
      emitAuthEvent('session_migration', event.detail);
    };

    window.addEventListener('auth:token_expired', handleTokenExpired);
    window.addEventListener('auth:token_refreshed', handleTokenRefreshed as EventListener);
    window.addEventListener('auth:migration_completed', handleMigrationCompleted as EventListener);

    return () => {
      window.removeEventListener('auth:token_expired', handleTokenExpired);
      window.removeEventListener('auth:token_refreshed', handleTokenRefreshed as EventListener);
      window.removeEventListener('auth:migration_completed', handleMigrationCompleted as EventListener);
    };
  }, [handleLogout, emitAuthEvent]);

  // Context value
  const contextValue: AuthContextType = {
    // State
    user: state.user,
    isAuthenticated: state.isAuthenticated,
    isLoading: state.loading,
    error: state.error,
    sessionId: state.sessionId,

    // Methods
    login,
    register,
    logout,
    refreshAuth,
    updateProfile,
    migrateSession,
    clearError,
    emitAuthEvent,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom Hook for using authentication context
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;
