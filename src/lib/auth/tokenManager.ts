// Token Manager - handles JWT Token storage, validation and refresh

import { TokenPair, LOCAL_STORAGE_KEYS } from '@/types/auth';

export class TokenManager {
  private static refreshTimeoutId: NodeJS.Timeout | null = null;

  /**
   * Get access token
   */
  static getAccessToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(LOCAL_STORAGE_KEYS.ACCESS_TOKEN);
  }

  /**
   * Get refresh token
   */
  static getRefreshToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(LOCAL_STORAGE_KEYS.REFRESH_TOKEN);
  }

  /**
   * Set token pair
   */
  static setTokens(tokens: TokenPair): void {
    if (typeof window === 'undefined') return;
    
    localStorage.setItem(LOCAL_STORAGE_KEYS.ACCESS_TOKEN, tokens.accessToken);
    localStorage.setItem(LOCAL_STORAGE_KEYS.REFRESH_TOKEN, tokens.refreshToken);
    
    // Schedule automatic refresh
    this.scheduleTokenRefresh(tokens.accessToken);
  }

  /**
   * Clear all tokens
   */
  static clearTokens(): void {
    if (typeof window === 'undefined') return;
    
    localStorage.removeItem(LOCAL_STORAGE_KEYS.ACCESS_TOKEN);
    localStorage.removeItem(LOCAL_STORAGE_KEYS.REFRESH_TOKEN);
    
    // Clear refresh timer
    if (this.refreshTimeoutId) {
      clearTimeout(this.refreshTimeoutId);
      this.refreshTimeoutId = null;
    }
  }

  /**
   * Check if token is expired
   */
  static isTokenExpired(token: string): boolean {
    try {
      const payload = this.decodeToken(token);
      const exp = payload.exp;
      if (typeof exp !== 'number') return true;
      
      const currentTime = Math.floor(Date.now() / 1000);
      return exp < currentTime;
    } catch {
      return true;
    }
  }

  /**
   * Decode JWT Token
   */
  static decodeToken(token: string): Record<string, unknown> {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload) as Record<string, unknown>;
    } catch (error) {
      throw new Error('Invalid token format');
    }
  }

  /**
   * Get token remaining time (seconds)
   */
  static getTokenTimeRemaining(token: string): number {
    try {
      const payload = this.decodeToken(token);
      const exp = payload.exp;
      if (typeof exp !== 'number') return 0;
      
      const currentTime = Math.floor(Date.now() / 1000);
      return Math.max(0, exp - currentTime);
    } catch {
      return 0;
    }
  }

  /**
   * Schedule automatic token refresh
   */
  static scheduleTokenRefresh(accessToken?: string): void {
    const token = accessToken || this.getAccessToken();
    if (!token) return;

    try {
      const timeRemaining = this.getTokenTimeRemaining(token);
      // Refresh 2 minutes before token expires
      const refreshTime = Math.max(0, (timeRemaining - 120) * 1000);

      if (this.refreshTimeoutId) {
        clearTimeout(this.refreshTimeoutId);
      }

      this.refreshTimeoutId = setTimeout(async () => {
        try {
          await this.refreshTokens();
        } catch (error) {
          console.error('Auto token refresh failed:', error);
          // 触发登出事件
          window.dispatchEvent(new CustomEvent('auth:token_expired'));
        }
      }, refreshTime);

      console.log(`Token refresh scheduled in ${refreshTime / 1000} seconds`);
    } catch (error) {
      console.error('Failed to schedule token refresh:', error);
    }
  }

  /**
   * 刷新令牌
   */
  static async refreshTokens(): Promise<TokenPair> {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    try {
      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken }),
      });

      if (!response.ok) {
        throw new Error(`Token refresh failed: ${response.statusText}`);
      }

      const data = await response.json();
      const newTokens: TokenPair = data.tokens;

      // 更新存储的令牌
      this.setTokens(newTokens);

      // 触发令牌刷新事件
      window.dispatchEvent(new CustomEvent('auth:token_refreshed', {
        detail: newTokens
      }));

      return newTokens;
    } catch (error) {
      // 刷新失败，清除令牌
      this.clearTokens();
      throw error;
    }
  }

  /**
   * 检查是否有有效的认证令牌
   */
  static hasValidToken(): boolean {
    const accessToken = this.getAccessToken();
    if (!accessToken) return false;
    
    return !this.isTokenExpired(accessToken);
  }

  /**
   * 获取当前用户 ID（从令牌中提取）
   */
  static getCurrentUserId(): string | null {
    const accessToken = this.getAccessToken();
    if (!accessToken || this.isTokenExpired(accessToken)) return null;

    try {
      const payload = this.decodeToken(accessToken);
      const sub = payload.sub;
      return typeof sub === 'string' ? sub : null;
    } catch {
      return null;
    }
  }

  /**
   * 获取当前用户邮箱（从令牌中提取）
   */
  static getCurrentUserEmail(): string | null {
    const accessToken = this.getAccessToken();
    if (!accessToken || this.isTokenExpired(accessToken)) return null;

    try {
      const payload = this.decodeToken(accessToken);
      const email = payload.email;
      return typeof email === 'string' ? email : null;
    } catch {
      return null;
    }
  }

  /**
   * 初始化令牌管理器
   */
  static initialize(): void {
    if (typeof window === 'undefined') return;

    // 检查现有令牌并安排刷新
    const accessToken = this.getAccessToken();
    if (accessToken && !this.isTokenExpired(accessToken)) {
      this.scheduleTokenRefresh(accessToken);
    } else if (accessToken) {
      // 令牌已过期，尝试刷新
      this.refreshTokens().catch(() => {
        // 刷新失败，清除令牌
        this.clearTokens();
      });
    }

    // 监听页面可见性变化，重新验证令牌
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) {
        const token = this.getAccessToken();
        if (token && this.isTokenExpired(token)) {
          this.refreshTokens().catch(() => {
            window.dispatchEvent(new CustomEvent('auth:token_expired'));
          });
        }
      }
    });
  }

  /**
   * 清理资源
   */
  static cleanup(): void {
    if (this.refreshTimeoutId) {
      clearTimeout(this.refreshTimeoutId);
      this.refreshTimeoutId = null;
    }
  }
}
