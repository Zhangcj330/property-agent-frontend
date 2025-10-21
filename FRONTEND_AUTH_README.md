# 前端认证模块实现

## 概述

这是一个完整的前端认证系统实现，支持用户注册、登录、会话管理和数据迁移。采用 React Context + Hooks 架构，与现有的匿名会话系统完全兼容。

## 技术架构

### 核心组件

```
src/
├── types/auth.ts                    # 认证相关类型定义
├── contexts/AuthContext.tsx         # 认证状态管理上下文
├── hooks/
│   ├── useAuth.tsx                 # 认证状态 Hook
│   ├── useUser.tsx                 # 用户管理 Hooks
│   └── useSessionMigration.tsx     # 会话迁移 Hooks
├── lib/auth/
│   ├── tokenManager.ts             # JWT Token 管理
│   ├── sessionManager.ts           # 会话管理（兼容匿名用户）
│   └── authClient.ts               # API 客户端
└── components/auth/
    ├── AuthModal.tsx               # 统一认证弹窗
    ├── LoginForm.tsx               # 登录表单
    ├── RegisterForm.tsx            # 注册表单
    ├── MigrationPrompt.tsx         # 数据迁移提示
    ├── SocialLoginButtons.tsx      # 第三方登录
    ├── UserMenu.tsx                # 用户菜单
    ├── AuthButton.tsx              # 认证按钮
    └── index.ts                    # 统一导出
```

## 主要特性

### 1. 渐进式用户身份升级
- **匿名用户**：可以使用核心功能（聊天、搜索、临时收藏）
- **注册用户**：获得数据持久化、跨设备同步等功能
- **无缝升级**：匿名数据自动迁移到注册账户

### 2. 完整的认证流程
- 邮箱密码登录/注册
- 第三方登录（Google、Apple）
- 无密码登录（Magic Link）
- 密码重置和邮箱验证

### 3. 智能会话管理
- JWT + Refresh Token 双令牌机制
- 自动令牌刷新和过期处理
- 跨标签页状态同步
- 离线状态支持

### 4. 数据迁移系统
- 检测匿名用户数据（收藏、聊天记录、偏好设置）
- 智能迁移提示和确认流程
- 无损数据转移

## 使用方法

### 1. 基础设置

在应用根组件中包装 `AuthProvider`：

```tsx
// src/app/layout.tsx
import { AuthProvider } from '@/contexts/AuthContext';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <AuthProvider>
          <Navigation />
          <main>{children}</main>
        </AuthProvider>
      </body>
    </html>
  );
}
```

### 2. 在组件中使用认证状态

```tsx
import { useAuth } from '@/hooks/useAuth';

function MyComponent() {
  const { user, isAuthenticated, login, logout, isLoading } = useAuth();

  if (isLoading) return <div>Loading...</div>;

  if (isAuthenticated) {
    return (
      <div>
        <p>Welcome, {user.name}!</p>
        <button onClick={logout}>Logout</button>
      </div>
    );
  }

  return (
    <div>
      <button onClick={() => login({ email, password })}>
        Login
      </button>
    </div>
  );
}
```

### 3. 使用认证按钮组件

```tsx
import { AuthButton } from '@/components/auth';

function Navigation() {
  return (
    <nav>
      <div>Logo</div>
      <AuthButton showMigrationPrompt={true} />
    </nav>
  );
}
```

### 4. 用户偏好管理

```tsx
import { useUserPreferences } from '@/hooks/useUser';

function SettingsPage() {
  const { preferences, updatePreferences, loading } = useUserPreferences();

  const handleSave = async (newPrefs) => {
    await updatePreferences(newPrefs);
  };

  return (
    <form onSubmit={handleSave}>
      {/* 偏好设置表单 */}
    </form>
  );
}
```

### 5. 会话迁移

```tsx
import { useSessionMigration } from '@/hooks/useSessionMigration';

function RegisterPage() {
  const { 
    hasDataToMigrate, 
    migrationPrompt, 
    executeMigration 
  } = useSessionMigration();

  if (hasDataToMigrate) {
    return (
      <MigrationPrompt
        prompt={migrationPrompt}
        onConfirm={executeMigration}
        onSkip={() => {}}
      />
    );
  }

  return <RegisterForm />;
}
```

## API 集成

### 认证 API 端点

```typescript
// 需要后端实现的 API 端点
POST /api/auth/register     // 用户注册
POST /api/auth/login        // 用户登录
POST /api/auth/refresh      // 刷新令牌
POST /api/auth/logout       // 用户登出

GET  /api/user/profile      // 获取用户资料
PUT  /api/user/profile      // 更新用户资料
GET  /api/user/preferences  // 获取用户偏好
PUT  /api/user/preferences  // 更新用户偏好

POST /api/user/migrate-session  // 迁移会话数据
```

### 请求格式示例

```typescript
// 注册请求
POST /api/auth/register
{
  "email": "user@example.com",
  "password": "securePassword123",
  "name": "John Doe",
  "phone": "1234567890",
  "sessionId": "uuid-for-migration"
}

// 响应格式
{
  "success": true,
  "data": {
    "user": { /* UserProfile */ },
    "tokens": {
      "accessToken": "jwt-token",
      "refreshToken": "refresh-token"
    },
    "migrationResult": {
      "success": true,
      "migratedItems": ["savedProperties", "chatHistory"]
    }
  }
}
```

## 状态管理

### AuthContext 状态结构

```typescript
interface AuthState {
  isAuthenticated: boolean;
  user: UserProfile | null;
  tokens: TokenPair | null;
  sessionId: string;
  loading: boolean;
  error: string | null;
}
```

### 事件系统

认证系统会发送以下事件：

```typescript
// 监听认证事件
window.addEventListener('auth:login_success', (event) => {
  console.log('User logged in:', event.detail);
});

window.addEventListener('auth:token_expired', () => {
  // 处理令牌过期
});

window.addEventListener('auth:migration_completed', (event) => {
  console.log('Migration completed:', event.detail);
});
```

## 本地存储

### 存储键名

```typescript
const LOCAL_STORAGE_KEYS = {
  ACCESS_TOKEN: 'auth_access_token',
  REFRESH_TOKEN: 'auth_refresh_token',
  USER_PROFILE: 'auth_user_profile',
  SESSION_ID: 'chat_session_id',        // 兼容现有系统
  SAVED_PROPERTIES: 'savedProperties',   // 兼容现有系统
};
```

### 数据结构

```typescript
// 用户资料
localStorage.setItem('auth_user_profile', JSON.stringify({
  id: 'user-123',
  email: 'user@example.com',
  name: 'John Doe',
  tier: 'registered',
  emailVerified: true
}));

// 匿名会话数据（迁移前）
localStorage.setItem('savedProperties', JSON.stringify([
  'property-1', 'property-2'
]));
```

## 安全考虑

### Token 管理
- Access Token：15分钟有效期，存储在内存中
- Refresh Token：30天有效期，存储在 localStorage
- 自动刷新机制，在过期前2分钟刷新
- 页面可见性变化时重新验证

### 数据保护
- 敏感信息不存储在 localStorage
- HTTPS 强制要求
- XSS 防护通过 Content Security Policy
- 输入验证使用 Zod schemas

## 错误处理

### 网络错误
```typescript
try {
  await login(credentials);
} catch (error) {
  if (error.message.includes('network')) {
    // 显示网络错误提示
  } else if (error.message.includes('credentials')) {
    // 显示登录凭据错误
  }
}
```

### 令牌过期
```typescript
// 自动处理令牌过期
axios.interceptors.response.use(
  response => response,
  async error => {
    if (error.response?.status === 401) {
      // 尝试刷新令牌或重定向到登录页
    }
  }
);
```

## 测试

### 单元测试示例

```typescript
// __tests__/auth/tokenManager.test.ts
import { TokenManager } from '@/lib/auth/tokenManager';

describe('TokenManager', () => {
  test('should decode JWT token correctly', () => {
    const token = 'valid.jwt.token';
    const payload = TokenManager.decodeToken(token);
    expect(payload.sub).toBeDefined();
  });

  test('should detect expired tokens', () => {
    const expiredToken = 'expired.jwt.token';
    expect(TokenManager.isTokenExpired(expiredToken)).toBe(true);
  });
});
```

### 集成测试

```typescript
// __tests__/auth/authFlow.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { AuthProvider } from '@/contexts/AuthContext';
import LoginForm from '@/components/auth/LoginForm';

test('login flow works correctly', async () => {
  render(
    <AuthProvider>
      <LoginForm />
    </AuthProvider>
  );

  fireEvent.change(screen.getByLabelText('Email'), {
    target: { value: 'test@example.com' }
  });
  
  fireEvent.change(screen.getByLabelText('Password'), {
    target: { value: 'password123' }
  });

  fireEvent.click(screen.getByText('Login'));
  
  // 验证登录成功后的状态
});
```

## 性能优化

### 代码分割
```typescript
// 懒加载认证组件
const AuthModal = lazy(() => import('@/components/auth/AuthModal'));
const UserSettings = lazy(() => import('@/app/settings/page'));
```

### 缓存策略
- 用户资料：内存缓存5分钟
- 偏好设置：Redis缓存30分钟
- Token：自动刷新机制

### 网络优化
- API 请求去重
- 乐观更新
- 错误重试机制

## 部署注意事项

### 环境变量
```bash
# .env.local
NEXT_PUBLIC_API_BASE_URL=https://api.yourapp.com
JWT_SECRET=your-jwt-secret
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

### 构建配置
```javascript
// next.config.js
module.exports = {
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },
  // 其他配置
};
```

## 故障排除

### 常见问题

1. **Token 刷新失败**
   - 检查 refresh token 是否有效
   - 验证 API 端点是否正确
   - 查看网络连接状态

2. **会话迁移失败**
   - 确认 sessionId 存在
   - 检查后端迁移 API
   - 验证数据格式正确性

3. **第三方登录问题**
   - 验证 OAuth 配置
   - 检查回调 URL 设置
   - 确认客户端 ID 和密钥

### 调试工具

```typescript
// 开启调试模式
localStorage.setItem('auth_debug', 'true');

// 查看认证状态
console.log('Auth State:', useAuth());

// 监听所有认证事件
Object.values(['login_success', 'logout', 'token_refresh']).forEach(event => {
  window.addEventListener(`auth:${event}`, console.log);
});
```

## 扩展功能

### 双因素认证
```typescript
// 预留接口
interface TwoFactorAuth {
  enable: (method: 'sms' | 'email' | 'app') => Promise<void>;
  verify: (code: string) => Promise<boolean>;
  disable: () => Promise<void>;
}
```

### 设备管理
```typescript
// 设备信息跟踪
interface DeviceInfo {
  id: string;
  name: string;
  type: 'desktop' | 'mobile' | 'tablet';
  lastActive: Date;
  location?: string;
}
```

### 社交功能
```typescript
// 用户关系管理
interface SocialFeatures {
  followUser: (userId: string) => Promise<void>;
  shareProperty: (propertyId: string, platform: string) => Promise<void>;
  inviteFriend: (email: string) => Promise<void>;
}
```

这个认证模块提供了完整的用户管理功能，同时保持了与现有系统的兼容性。通过渐进式升级策略，用户可以从匿名使用开始，逐步享受更多个性化功能。
