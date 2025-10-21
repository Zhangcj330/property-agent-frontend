// 认证 API 客户端 - 处理所有认证相关的 API 调用

import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { 
  LoginCredentials, 
  RegistrationData, 
  AuthResponse, 
  TokenPair, 
  MigrationResult,
  ApiResponse,
  MagicLinkRequest,
  UserProfile,
  UserPreferences
} from '@/types/auth';
import { TokenManager } from './tokenManager';

class AuthClient {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: '/api',
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  /**
   * 设置请求和响应拦截器
   */
  private setupInterceptors(): void {
    // 请求拦截器：自动添加 Authorization header
    this.api.interceptors.request.use(
      (config) => {
        const token = TokenManager.getAccessToken();
        if (token && !TokenManager.isTokenExpired(token)) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // 响应拦截器：处理 401 错误和自动刷新 token
    this.api.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            // 尝试刷新 token
            await TokenManager.refreshTokens();
            
            // 重新发送原始请求
            const token = TokenManager.getAccessToken();
            if (token) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
              return this.api(originalRequest);
            }
          } catch (refreshError) {
            // 刷新失败，触发登出
            TokenManager.clearTokens();
            window.dispatchEvent(new CustomEvent('auth:token_expired'));
            return Promise.reject(refreshError);
          }
        }

        return Promise.reject(error);
      }
    );
  }

  /**
   * 用户注册
   */
  async register(data: RegistrationData): Promise<AuthResponse> {
    try {
      const response: AxiosResponse<ApiResponse<AuthResponse>> = await this.api.post('/auth/register', data);
      
      if (!response.data.success) {
        throw new Error(response.data.error?.message || 'Registration failed');
      }

      const authData = response.data.data!;
      
      // 存储 tokens
      TokenManager.setTokens(authData.tokens);
      
      return authData;
    } catch (error: unknown) {
      console.error('Registration failed:', error);
      throw this.handleApiError(error);
    }
  }

  /**
   * 用户登录
   */
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const response: AxiosResponse<ApiResponse<AuthResponse>> = await this.api.post('/auth/login', credentials);
      
      if (!response.data.success) {
        throw new Error(response.data.error?.message || 'Login failed');
      }

      const authData = response.data.data!;
      
      // 存储 tokens
      TokenManager.setTokens(authData.tokens);
      
      return authData;
    } catch (error: unknown) {
      console.error('Login failed:', error);
      throw this.handleApiError(error);
    }
  }

  /**
   * 用户登出
   */
  async logout(): Promise<void> {
    try {
      const refreshToken = TokenManager.getRefreshToken();
      if (refreshToken) {
        await this.api.post('/auth/logout', { refreshToken });
      }
    } catch (error) {
      console.error('Logout API call failed:', error);
      // 即使 API 调用失败，也要清除本地 tokens
    } finally {
      TokenManager.clearTokens();
    }
  }

  /**
   * 刷新访问令牌
   */
  async refreshToken(): Promise<TokenPair> {
    const refreshToken = TokenManager.getRefreshToken();
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    try {
      const response: AxiosResponse<ApiResponse<{ tokens: TokenPair }>> = await this.api.post('/auth/refresh', {
        refreshToken
      });

      if (!response.data.success) {
        throw new Error(response.data.error?.message || 'Token refresh failed');
      }

      return response.data.data!.tokens;
    } catch (error: unknown) {
      console.error('Token refresh failed:', error);
      throw this.handleApiError(error);
    }
  }

  /**
   * 发送魔法链接
   */
  async sendMagicLink(request: MagicLinkRequest): Promise<void> {
    try {
      const response: AxiosResponse<ApiResponse> = await this.api.post('/auth/magic-link/send', request);
      
      if (!response.data.success) {
        throw new Error(response.data.error?.message || 'Failed to send magic link');
      }
    } catch (error: unknown) {
      console.error('Magic link send failed:', error);
      throw this.handleApiError(error);
    }
  }

  /**
   * 验证魔法链接
   */
  async verifyMagicLink(token: string): Promise<AuthResponse> {
    try {
      const response: AxiosResponse<ApiResponse<AuthResponse>> = await this.api.get(`/auth/magic-link/verify?token=${token}`);
      
      if (!response.data.success) {
        throw new Error(response.data.error?.message || 'Magic link verification failed');
      }

      const authData = response.data.data!;
      
      // 存储 tokens
      TokenManager.setTokens(authData.tokens);
      
      return authData;
    } catch (error: unknown) {
      console.error('Magic link verification failed:', error);
      throw this.handleApiError(error);
    }
  }

  /**
   * 获取用户资料
   */
  async getUserProfile(): Promise<UserProfile> {
    try {
      const response: AxiosResponse<ApiResponse<UserProfile>> = await this.api.get('/user/profile');
      
      if (!response.data.success) {
        throw new Error(response.data.error?.message || 'Failed to get user profile');
      }

      return response.data.data!;
    } catch (error: unknown) {
      console.error('Get user profile failed:', error);
      throw this.handleApiError(error);
    }
  }

  /**
   * 更新用户资料
   */
  async updateUserProfile(updates: Partial<UserProfile>): Promise<UserProfile> {
    try {
      const response: AxiosResponse<ApiResponse<UserProfile>> = await this.api.put('/user/profile', updates);
      
      if (!response.data.success) {
        throw new Error(response.data.error?.message || 'Failed to update user profile');
      }

      return response.data.data!;
    } catch (error: unknown) {
      console.error('Update user profile failed:', error);
      throw this.handleApiError(error);
    }
  }

  /**
   * 获取用户偏好设置
   */
  async getUserPreferences(): Promise<UserPreferences> {
    try {
      const response: AxiosResponse<ApiResponse<UserPreferences>> = await this.api.get('/user/preferences');
      
      if (!response.data.success) {
        throw new Error(response.data.error?.message || 'Failed to get user preferences');
      }

      return response.data.data!;
    } catch (error: unknown) {
      console.error('Get user preferences failed:', error);
      throw this.handleApiError(error);
    }
  }

  /**
   * 更新用户偏好设置
   */
  async updateUserPreferences(preferences: Partial<UserPreferences>): Promise<UserPreferences> {
    try {
      const response: AxiosResponse<ApiResponse<UserPreferences>> = await this.api.put('/user/preferences', preferences);
      
      if (!response.data.success) {
        throw new Error(response.data.error?.message || 'Failed to update user preferences');
      }

      return response.data.data!;
    } catch (error: unknown) {
      console.error('Update user preferences failed:', error);
      throw this.handleApiError(error);
    }
  }

  /**
   * 迁移匿名会话数据
   */
  async migrateSession(sessionId: string): Promise<MigrationResult> {
    try {
      const response: AxiosResponse<ApiResponse<MigrationResult>> = await this.api.post('/user/migrate-session', {
        sessionId
      });
      
      if (!response.data.success) {
        throw new Error(response.data.error?.message || 'Session migration failed');
      }

      return response.data.data!;
    } catch (error: unknown) {
      console.error('Session migration failed:', error);
      throw this.handleApiError(error);
    }
  }

  /**
   * 修改密码
   */
  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    try {
      const response: AxiosResponse<ApiResponse> = await this.api.post('/user/change-password', {
        currentPassword,
        newPassword
      });
      
      if (!response.data.success) {
        throw new Error(response.data.error?.message || 'Password change failed');
      }
    } catch (error: unknown) {
      console.error('Password change failed:', error);
      throw this.handleApiError(error);
    }
  }

  /**
   * 发送邮箱验证
   */
  async sendEmailVerification(): Promise<void> {
    try {
      const response: AxiosResponse<ApiResponse> = await this.api.post('/user/send-email-verification');
      
      if (!response.data.success) {
        throw new Error(response.data.error?.message || 'Failed to send email verification');
      }
    } catch (error: unknown) {
      console.error('Send email verification failed:', error);
      throw this.handleApiError(error);
    }
  }

  /**
   * 验证邮箱
   */
  async verifyEmail(token: string): Promise<void> {
    try {
      const response: AxiosResponse<ApiResponse> = await this.api.post('/user/verify-email', { token });
      
      if (!response.data.success) {
        throw new Error(response.data.error?.message || 'Email verification failed');
      }
    } catch (error: unknown) {
      console.error('Email verification failed:', error);
      throw this.handleApiError(error);
    }
  }

  /**
   * 删除账户
   */
  async deleteAccount(password: string): Promise<void> {
    try {
      const response: AxiosResponse<ApiResponse> = await this.api.delete('/user/account', {
        data: { password }
      });
      
      if (!response.data.success) {
        throw new Error(response.data.error?.message || 'Account deletion failed');
      }

      // 清除本地数据
      TokenManager.clearTokens();
    } catch (error: unknown) {
      console.error('Account deletion failed:', error);
      throw this.handleApiError(error);
    }
  }

  /**
   * Google OAuth 登录
   */
  async loginWithGoogle(code: string, state?: string): Promise<AuthResponse> {
    try {
      const response: AxiosResponse<ApiResponse<AuthResponse>> = await this.api.post('/auth/oauth/google', {
        code,
        state
      });
      
      if (!response.data.success) {
        throw new Error(response.data.error?.message || 'Google login failed');
      }

      const authData = response.data.data!;
      
      // 存储 tokens
      TokenManager.setTokens(authData.tokens);
      
      return authData;
    } catch (error: unknown) {
      console.error('Google login failed:', error);
      throw this.handleApiError(error);
    }
  }

  /**
   * Apple Sign In
   */
  async loginWithApple(code: string, state?: string): Promise<AuthResponse> {
    try {
      const response: AxiosResponse<ApiResponse<AuthResponse>> = await this.api.post('/auth/oauth/apple', {
        code,
        state
      });
      
      if (!response.data.success) {
        throw new Error(response.data.error?.message || 'Apple login failed');
      }

      const authData = response.data.data!;
      
      // 存储 tokens
      TokenManager.setTokens(authData.tokens);
      
      return authData;
    } catch (error: unknown) {
      console.error('Apple login failed:', error);
      throw this.handleApiError(error);
    }
  }

  /**
   * 处理 API 错误
   */
  private handleApiError(error: unknown): Error {
    if (error && typeof error === 'object' && 'response' in error) {
      const axiosError = error as { response?: { data?: { error?: { message?: string } } } };
      if (axiosError.response?.data?.error?.message) {
        return new Error(axiosError.response.data.error.message);
      }
    }
    
    if (error instanceof Error) {
      return new Error(error.message);
    }
    
    return new Error('An unexpected error occurred');
  }
}

// 导出单例实例
export const authClient = new AuthClient();
export default authClient;
