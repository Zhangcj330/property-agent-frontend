// 会话管理器 - 处理匿名会话和用户会话的兼容性

import { LOCAL_STORAGE_KEYS, AnonymousUserData } from '@/types/auth';

export class SessionManager {
  /**
   * 获取当前会话 ID
   */
  static getCurrentSessionId(): string {
    if (typeof window === 'undefined') return '';
    
    let sessionId = localStorage.getItem(LOCAL_STORAGE_KEYS.SESSION_ID);
    if (!sessionId) {
      sessionId = this.createNewSession();
    }
    return sessionId;
  }

  /**
   * 创建新的匿名会话
   */
  static createNewSession(): string {
    if (typeof window === 'undefined') return '';
    
    const sessionId = crypto.randomUUID();
    localStorage.setItem(LOCAL_STORAGE_KEYS.SESSION_ID, sessionId);
    
    console.log('Created new anonymous session:', sessionId);
    return sessionId;
  }

  /**
   * 获取匿名用户数据
   */
  static getAnonymousUserData(): AnonymousUserData {
    if (typeof window === 'undefined') {
      return {
        sessionId: '',
        savedProperties: [],
        chatHistory: [],
        preferences: {},
        searchHistory: []
      };
    }

    const sessionId = this.getCurrentSessionId();
    const savedPropertiesStr = localStorage.getItem(LOCAL_STORAGE_KEYS.SAVED_PROPERTIES);
    const savedProperties = savedPropertiesStr ? JSON.parse(savedPropertiesStr) : [];

    return {
      sessionId,
      savedProperties,
      chatHistory: [], // 这个会从后端 API 获取
      preferences: {}, // 这个会从聊天记录中提取
      searchHistory: [] // 这个会从后端 API 获取
    };
  }

  /**
   * 检查是否有匿名会话数据需要迁移
   */
  static hasDataToMigrate(): boolean {
    const data = this.getAnonymousUserData();
    
    // 检查是否有收藏的房产
    if (data.savedProperties.length > 0) return true;
    
    // 检查是否有会话 ID（表示可能有聊天记录）
    if (data.sessionId) return true;
    
    return false;
  }

  /**
   * 获取迁移数据摘要
   */
  static getMigrationSummary(): {
    savedProperties: number;
    hasSessionData: boolean;
    sessionId: string;
  } {
    const data = this.getAnonymousUserData();
    
    return {
      savedProperties: data.savedProperties.length,
      hasSessionData: !!data.sessionId,
      sessionId: data.sessionId
    };
  }

  /**
   * 迁移会话数据到用户账户
   */
  static async migrateToUser(userId: string): Promise<void> {
    const sessionData = this.getAnonymousUserData();
    
    if (!sessionData.sessionId) {
      console.log('No session data to migrate');
      return;
    }

    try {
      const response = await fetch('/api/user/migrate-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem(LOCAL_STORAGE_KEYS.ACCESS_TOKEN)}`
        },
        body: JSON.stringify({
          sessionId: sessionData.sessionId,
          localData: {
            savedProperties: sessionData.savedProperties
          }
        })
      });

      if (!response.ok) {
        throw new Error(`Migration failed: ${response.statusText}`);
      }

      const result = await response.json();
      console.log('Session migration completed:', result);

      // 触发迁移完成事件
      window.dispatchEvent(new CustomEvent('auth:migration_completed', {
        detail: result
      }));

    } catch (error) {
      console.error('Session migration failed:', error);
      throw error;
    }
  }

  /**
   * 清理匿名会话数据（迁移成功后调用）
   */
  static cleanupAnonymousData(): void {
    if (typeof window === 'undefined') return;
    
    // 保留 sessionId 用于后续可能的查询，但清理本地数据
    localStorage.removeItem(LOCAL_STORAGE_KEYS.SAVED_PROPERTIES);
    
    console.log('Anonymous session data cleaned up');
  }

  /**
   * 与后端同步会话状态
   */
  static async syncWithBackend(): Promise<void> {
    const sessionId = this.getCurrentSessionId();
    if (!sessionId) return;

    try {
      // 同步收藏的房产
      await this.syncSavedProperties(sessionId);
      
      // 同步其他会话数据...
      
    } catch (error) {
      console.error('Session sync failed:', error);
    }
  }

  /**
   * 同步收藏的房产到后端
   */
  private static async syncSavedProperties(sessionId: string): Promise<void> {
    const savedPropertiesStr = localStorage.getItem(LOCAL_STORAGE_KEYS.SAVED_PROPERTIES);
    if (!savedPropertiesStr) return;

    const savedProperties = JSON.parse(savedPropertiesStr);
    if (savedProperties.length === 0) return;

    try {
      const response = await fetch('/api/session/sync-properties', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId,
          properties: savedProperties
        })
      });

      if (!response.ok) {
        console.warn('Failed to sync saved properties:', response.statusText);
      }
    } catch (error) {
      console.warn('Failed to sync saved properties:', error);
    }
  }

  /**
   * 更新本地收藏房产
   */
  static updateSavedProperties(properties: string[]): void {
    if (typeof window === 'undefined') return;
    
    localStorage.setItem(LOCAL_STORAGE_KEYS.SAVED_PROPERTIES, JSON.stringify(properties));
    
    // 触发收藏更新事件
    window.dispatchEvent(new CustomEvent('session:properties_updated', {
      detail: properties
    }));
  }

  /**
   * 添加收藏房产
   */
  static addSavedProperty(propertyId: string): void {
    const current = this.getSavedProperties();
    if (!current.includes(propertyId)) {
      const updated = [...current, propertyId];
      this.updateSavedProperties(updated);
    }
  }

  /**
   * 移除收藏房产
   */
  static removeSavedProperty(propertyId: string): void {
    const current = this.getSavedProperties();
    const updated = current.filter(id => id !== propertyId);
    this.updateSavedProperties(updated);
  }

  /**
   * 获取收藏的房产列表
   */
  static getSavedProperties(): string[] {
    if (typeof window === 'undefined') return [];
    
    const savedPropertiesStr = localStorage.getItem(LOCAL_STORAGE_KEYS.SAVED_PROPERTIES);
    return savedPropertiesStr ? JSON.parse(savedPropertiesStr) : [];
  }

  /**
   * 检查房产是否已收藏
   */
  static isPropertySaved(propertyId: string): boolean {
    return this.getSavedProperties().includes(propertyId);
  }

  /**
   * 初始化会话管理器
   */
  static initialize(): void {
    if (typeof window === 'undefined') return;

    // 确保有会话 ID
    this.getCurrentSessionId();
    
    // 定期同步数据到后端（每5分钟）
    setInterval(() => {
      this.syncWithBackend();
    }, 5 * 60 * 1000);

    console.log('SessionManager initialized');
  }

  /**
   * 生成迁移提示信息
   */
  static generateMigrationPrompt(): {
    show: boolean;
    message: string;
    items: string[];
  } {
    const summary = this.getMigrationSummary();
    
    if (!this.hasDataToMigrate()) {
      return {
        show: false,
        message: '',
        items: []
      };
    }

    const items: string[] = [];
    let message = '创建账户后，您将保留：';

    if (summary.savedProperties > 0) {
      items.push(`${summary.savedProperties} 个收藏的房产`);
    }

    if (summary.hasSessionData) {
      items.push('与AI助手的聊天记录');
      items.push('您的搜索偏好设置');
    }

    return {
      show: true,
      message,
      items
    };
  }
}
