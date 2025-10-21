# 用户登录模块规格说明

## 项目背景分析

### 当前架构特点
当前应用采用了一种独特的"会话优先"架构模式：
- 使用 `localStorage` 中的 `chat_session_id` 作为用户身份标识
- 通过 `crypto.randomUUID()` 生成匿名会话ID
- 用户数据（偏好设置、收藏房产、聊天历史）都关联到会话ID
- 无需注册即可使用核心功能

这种设计体现了"降低使用门槛，优先体验价值"的产品理念，但随着功能复杂度增加，需要引入更完善的用户管理体系。

## 设计哲学与策略思考

### 核心问题
为什么要引入用户登录？背后的真实需求是什么？

1. **数据持久化需求**：用户希望在不同设备间同步数据
2. **个性化体验**：基于用户历史行为提供更精准的推荐
3. **社交功能扩展**：分享、评论、代理联系等需要身份认证
4. **商业价值实现**：用户画像分析、营销触达、付费功能

### 设计原则
1. **渐进式升级**：保持现有匿名体验的流畅性
2. **价值驱动注册**：用户感受到明确价值后才引导注册
3. **数据无缝迁移**：匿名会话数据可平滑转移到用户账户
4. **多重身份支持**：支持匿名用户、注册用户、第三方登录

## 功能需求规格

### 1. 用户身份层级设计

#### 1.1 匿名用户 (Anonymous User)
- **标识方式**：`session_id` (UUID)
- **数据存储**：localStorage + 后端临时存储
- **功能权限**：
  - ✅ 房产搜索和浏览
  - ✅ AI 聊天助手
  - ✅ 临时收藏房产（7天）
  - ✅ 基础偏好设置
  - ❌ 跨设备同步
  - ❌ 长期数据保存
  - ❌ 高级个性化功能

#### 1.2 注册用户 (Registered User)
- **标识方式**：`user_id` + `email`
- **数据存储**：后端数据库持久化
- **功能权限**：
  - ✅ 所有匿名用户功能
  - ✅ 跨设备数据同步
  - ✅ 永久收藏房产
  - ✅ 高级搜索过滤器
  - ✅ 个性化推荐算法
  - ✅ 搜索历史和偏好分析
  - ✅ 房产价格变动通知

#### 1.3 高级用户 (Premium User)
- **标识方式**：`user_id` + `subscription_tier`
- **功能权限**：
  - ✅ 所有注册用户功能
  - ✅ 无限制收藏房产
  - ✅ 高级市场分析报告
  - ✅ 优先客服支持
  - ✅ 独家房源信息

### 2. 认证方式设计

#### 2.1 邮箱密码认证
```typescript
interface EmailAuthCredentials {
  email: string;
  password: string;
}

interface RegistrationData extends EmailAuthCredentials {
  name: string;
  phone?: string;
  agreeToTerms: boolean;
  marketingConsent?: boolean;
}
```

#### 2.2 第三方登录集成
- **Google OAuth 2.0**：主要推荐方式
- **Apple Sign In**：iOS 用户友好
- **微信登录**：考虑中国用户群体
- **LinkedIn**：房产投资专业人士

#### 2.3 无密码登录 (Magic Link)
```typescript
interface MagicLinkAuth {
  email: string;
  purpose: 'login' | 'register' | 'password_reset';
  expiresIn: number; // 15 minutes
}
```

### 3. 用户注册流程设计

#### 3.1 注册
**触发场景**：
右上角 sign in

#### 3.2 注册表单设计
```typescript
interface RegistrationForm {
  // 必填信息
  email: string;
  password: string;
  name: string;
  
  // 可选信息
  phone?: string;
  preferredLocation?: string;
  budgetRange?: {
    min: number;
    max: number;
  };
  
  // 同意条款
  agreeToTerms: boolean;
  marketingConsent?: boolean;
}
```

#### 3.3 数据迁移策略
```typescript
interface SessionMigration {
  sessionId: string;
  userId: string;
  migrationData: {
    savedProperties: string[];
    chatHistory: Message[];
    preferences: UserPreferences;
    searchHistory: SearchQuery[];
  };
}
```

### 4. 用户资料管理

#### 4.1 基础资料结构
```typescript
interface UserProfile {
  // 基本信息
  id: string;
  email: string;
  name: string;
  phone?: string;
  avatar?: string;
  
  // 账户状态
  status: 'active' | 'suspended' | 'pending_verification';
  tier: 'anonymous' | 'registered' | 'premium';
  createdAt: Date;
  lastLoginAt: Date;
  
  // 验证状态
  emailVerified: boolean;
  phoneVerified: boolean;
  
  // 偏好设置
  preferences: UserPreferences;
  
  // 隐私设置
  privacy: PrivacySettings;
}
```

#### 4.2 房产偏好设置
```typescript
interface UserPreferences {
  // 搜索偏好
  preferredLocations: string[];
  budgetRange: {
    min: number;
    max: number;
  };
  propertyTypes: PropertyType[];
  
  // 房屋要求
  minBedrooms?: number;
  minBathrooms?: number;
  minCarSpaces?: number;
  
  // 特殊要求
  mustHaveFeatures: string[];
  avoidFeatures: string[];
  
  // 通知偏好
  notifications: {
    priceAlerts: boolean;
    newListings: boolean;
    marketReports: boolean;
    email: boolean;
    push: boolean;
    sms: boolean;
  };
  
  // AI 助手偏好
  aiAssistant: {
    communicationStyle: 'professional' | 'casual' | 'detailed';
    language: 'en' | 'zh-CN' | 'zh-TW';
    responseLength: 'brief' | 'moderate' | 'detailed';
  };
}
```

### 5. 会话管理与安全

#### 5.1 JWT Token 设计
```typescript
interface JWTPayload {
  sub: string; // user_id
  email: string;
  tier: UserTier;
  iat: number;
  exp: number;
  sessionId?: string; // 兼容现有会话系统
}

interface TokenPair {
  accessToken: string; // 15 minutes
  refreshToken: string; // 30 days
}
```

#### 5.2 会话安全策略
- **访问令牌**：短期有效（15分钟），包含用户基本信息
- **刷新令牌**：长期有效（30天），仅用于获取新的访问令牌
- **设备指纹**：检测异常登录行为
- **IP 白名单**：可选的高级安全功能

#### 5.3 登录状态管理
```typescript
interface AuthState {
  isAuthenticated: boolean;
  user: UserProfile | null;
  tokens: TokenPair | null;
  sessionId: string; // 保持向后兼容
  loading: boolean;
  error: string | null;
}
```

## 技术实现规格

### 1. 组件架构设计

```
src/
├── components/
│   └── auth/
│       ├── LoginModal.tsx          # 登录弹窗
│       ├── RegisterModal.tsx       # 注册弹窗
│       ├── AuthProvider.tsx        # 认证上下文提供者
│       ├── ProtectedRoute.tsx      # 路由保护组件
│       ├── UserMenu.tsx           # 用户菜单下拉
│       ├── ProfileSettings.tsx     # 用户设置页面
│       └── SocialLoginButtons.tsx  # 第三方登录按钮
├── hooks/
│   ├── useAuth.tsx                # 认证状态管理
│   ├── useUser.tsx                # 用户信息管理
│   └── useSessionMigration.tsx    # 会话数据迁移
├── lib/
│   ├── auth/
│   │   ├── authClient.ts          # 认证API客户端
│   │   ├── tokenManager.ts        # Token管理
│   │   ├── sessionManager.ts      # 会话管理
│   │   └── socialAuth.ts          # 第三方登录
│   └── api/
│       └── auth.ts                # 认证相关API
└── types/
    └── auth.ts                    # 认证相关类型定义
```

### 2. API 端点设计

#### 2.1 认证相关 API
```typescript
// 用户注册
POST /api/auth/register
{
  email: string;
  password: string;
  name: string;
  phone?: string;
  sessionId?: string; // 用于数据迁移
}

// 用户登录
POST /api/auth/login
{
  email: string;
  password: string;
}

// 刷新令牌
POST /api/auth/refresh
{
  refreshToken: string;
}

// 用户登出
POST /api/auth/logout
{
  refreshToken: string;
}

// 密码重置
POST /api/auth/forgot-password
{
  email: string;
}

// 第三方登录
POST /api/auth/oauth/{provider}
{
  code: string;
  state?: string;
}
```

#### 2.2 用户管理 API
```typescript
// 获取用户资料
GET /api/user/profile

// 更新用户资料
PUT /api/user/profile
{
  name?: string;
  phone?: string;
  preferences?: UserPreferences;
}

// 会话数据迁移
POST /api/user/migrate-session
{
  sessionId: string;
}

// 删除账户
DELETE /api/user/account
{
  password: string;
  confirmation: string;
}
```

### 3. 状态管理设计

#### 3.1 React Context + Hooks
```typescript
// AuthContext.tsx
interface AuthContextType {
  // 状态
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  
  // 方法
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegistrationData) => Promise<void>;
  logout: () => Promise<void>;
  refreshAuth: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  
  // 会话兼容
  sessionId: string;
  migrateSession: () => Promise<void>;
}
```

#### 3.2 本地存储策略
```typescript
interface LocalStorageKeys {
  // 认证相关
  'auth_tokens': TokenPair;
  'user_profile': UserProfile;
  'auth_state': 'authenticated' | 'anonymous';
  
  // 向后兼容
  'chat_session_id': string;
  'savedProperties': string[];
  
  // 用户偏好
  'user_preferences': UserPreferences;
  'ui_preferences': UIPreferences;
}
```

### 4. 安全实现要点

#### 4.1 密码安全
- **最小长度**：8位字符
- **复杂度要求**：包含大小写字母、数字
- **哈希算法**：bcrypt (cost factor: 12)
- **密码重置**：临时令牌，15分钟有效期

#### 4.2 API 安全
- **HTTPS 强制**：所有认证相关请求
- **CSRF 保护**：SameSite cookies
- **速率限制**：登录尝试限制（5次/15分钟）
- **输入验证**：Zod schema 验证

#### 4.3 前端安全
- **Token 存储**：httpOnly cookies（生产环境）
- **XSS 防护**：Content Security Policy
- **敏感信息**：不在 localStorage 存储密码

## 用户体验设计

### 1. 界面设计规范

#### 1.1 登录弹窗设计
```typescript
interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode: 'login' | 'register';
  onSuccess?: (user: UserProfile) => void;
  migrationPrompt?: boolean; // 是否显示数据迁移提示
}
```

**设计特点**：
- 模态弹窗，不打断用户当前操作流程
- 登录/注册切换在同一弹窗内
- 社交登录按钮突出显示
- 数据迁移价值明确传达

#### 1.2 用户菜单设计
```typescript
interface UserMenuProps {
  user: UserProfile;
  onProfileClick: () => void;
  onSettingsClick: () => void;
  onLogout: () => void;
}
```

**菜单项目**：
- 用户头像 + 姓名
- 我的资料
- 偏好设置
- 收藏房产
- 搜索历史
- 账户安全
- 退出登录

#### 1.3 注册引导设计
**时机选择**：
- 非侵入式提示条
- 功能受限时的友好提醒
- 价值明确的升级建议

**文案策略**：
- 强调收益而非功能
- 使用具体数字和案例
- 提供"稍后提醒"选项

### 2. 交互流程设计

#### 2.1 首次访问流程
```
用户访问网站
    ↓
生成匿名 sessionId
    ↓
正常使用核心功能
    ↓
触发注册引导时机
    ↓
显示价值驱动的注册提示
    ↓
用户选择注册/继续匿名使用
```

#### 2.2 数据迁移流程
```
匿名用户点击注册
    ↓
显示数据迁移价值说明
    ↓
用户完成注册
    ↓
后台自动迁移会话数据
    ↓
显示迁移成功确认
    ↓
引导用户完善资料
```

#### 2.3 跨设备登录流程
```
用户在新设备登录
    ↓
验证身份凭据
    ↓
同步用户数据到本地
    ↓
合并本地匿名会话数据（如有）
    ↓
显示欢迎回来消息
```

## 实施计划

### Phase 1: 基础认证系统 (2-3周)
1. **用户注册/登录功能**
   - 邮箱密码认证
   - JWT Token 管理
   - 基础用户资料管理

2. **UI 组件开发**
   - LoginModal 组件
   - RegisterModal 组件
   - UserMenu 组件

3. **API 端点实现**
   - 认证相关 API
   - 用户资料 API
   - 会话迁移 API

### Phase 2: 增强功能 (2-3周)
1. **第三方登录集成**
   - Google OAuth
   - Apple Sign In

2. **高级用户管理**
   - 偏好设置页面
   - 账户安全设置
   - 数据导出功能

3. **用户体验优化**
   - 注册引导流程
   - 数据迁移体验
   - 错误处理优化

### Phase 3: 高级特性 (2-3周)
1. **安全增强**
   - 双因素认证
   - 设备管理
   - 登录历史

2. **个性化功能**
   - 智能推荐算法
   - 行为分析
   - A/B 测试框架

3. **运营工具**
   - 用户画像分析
   - 留存率监控
   - 转化漏斗分析

## 数据迁移策略

### 1. 现有数据结构分析
```typescript
// 当前匿名用户数据
interface AnonymousUserData {
  sessionId: string;
  savedProperties: string[]; // localStorage
  chatHistory: Message[]; // 后端API
  preferences: Record<string, string>; // 聊天中提取
  searchParams: Record<string, string>; // 搜索历史
}
```

### 2. 迁移映射关系
```typescript
interface MigrationMapping {
  // 直接映射
  savedProperties: string[] → UserProfile.savedProperties;
  preferences: Record<string, string> → UserProfile.preferences;
  
  // 转换映射
  chatHistory: Message[] → UserProfile.aiInteractionHistory;
  searchParams: Record<string, string> → UserProfile.searchHistory;
  
  // 新增字段
  email: string; // 注册时提供
  name: string; // 注册时提供
  createdAt: Date; // 迁移时间
}
```

### 3. 迁移执行策略
```typescript
async function migrateAnonymousSession(
  sessionId: string, 
  newUserId: string
): Promise<MigrationResult> {
  try {
    // 1. 获取匿名会话数据
    const sessionData = await getSessionData(sessionId);
    
    // 2. 转换数据格式
    const userData = transformSessionToUser(sessionData);
    
    // 3. 保存到用户账户
    await saveUserData(newUserId, userData);
    
    // 4. 清理匿名会话
    await cleanupSession(sessionId);
    
    return { success: true, migratedItems: userData };
  } catch (error) {
    return { success: false, error: error.message };
  }
}
```

## 监控与分析

### 1. 关键指标定义
- **注册转化率**：匿名用户 → 注册用户
- **登录成功率**：登录尝试成功比例
- **会话迁移率**：数据迁移成功比例
- **用户留存率**：7天/30天留存
- **功能使用率**：各功能模块使用频率

### 2. 错误监控
- **认证失败**：密码错误、账户锁定
- **Token 异常**：过期、无效、刷新失败
- **迁移失败**：数据丢失、格式错误
- **第三方登录**：OAuth 流程异常

### 3. 用户行为分析
- **注册触发点**：哪些功能最容易促成注册
- **登录频率**：用户活跃度分析
- **功能偏好**：注册前后行为变化
- **流失节点**：用户在哪个环节流失

## 测试策略

### 1. 单元测试
- 认证逻辑测试
- Token 管理测试
- 数据迁移测试
- 表单验证测试

### 2. 集成测试
- 登录/注册流程测试
- API 端点测试
- 第三方登录测试
- 会话管理测试

### 3. 端到端测试
- 完整用户注册流程
- 跨设备登录体验
- 数据迁移完整性
- 异常情况处理

### 4. 安全测试
- SQL 注入防护
- XSS 攻击防护
- CSRF 保护验证
- 密码安全策略

## 部署与运维

### 1. 环境配置
```typescript
interface AuthConfig {
  // JWT 配置
  JWT_SECRET: string;
  JWT_EXPIRES_IN: string;
  REFRESH_TOKEN_EXPIRES_IN: string;
  
  // 第三方登录
  GOOGLE_CLIENT_ID: string;
  GOOGLE_CLIENT_SECRET: string;
  APPLE_CLIENT_ID: string;
  
  // 邮件服务
  SMTP_HOST: string;
  SMTP_USER: string;
  SMTP_PASS: string;
  
  // 安全配置
  BCRYPT_ROUNDS: number;
  RATE_LIMIT_MAX: number;
  RATE_LIMIT_WINDOW: number;
}
```

### 2. 数据库设计

#### 2.1 关系型数据库 (PostgreSQL) - 用户核心数据
```sql
-- 用户表
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  avatar_url TEXT,
  status VARCHAR(20) DEFAULT 'active',
  tier VARCHAR(20) DEFAULT 'registered',
  email_verified BOOLEAN DEFAULT false,
  phone_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_login_at TIMESTAMP
);

-- 会话迁移记录表
CREATE TABLE session_migrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id VARCHAR(255) NOT NULL,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  migrated_data JSONB,
  migration_status VARCHAR(20) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 刷新令牌表
CREATE TABLE refresh_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  token_hash VARCHAR(255) NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  revoked_at TIMESTAMP
);
```

#### 2.2 NoSQL 数据库 (MongoDB) - 用户偏好和行为数据
```javascript
// 用户偏好集合 - user_preferences
{
  _id: ObjectId,
  user_id: "uuid-string",  // 关联到 PostgreSQL 用户表
  
  // 搜索偏好
  search_preferences: {
    preferred_locations: ["Downtown", "Suburbs", "Waterfront"],
    budget_range: {
      min: 450000,
      max: 650000,
      currency: "AUD"
    },
    property_types: ["House", "Townhouse", "Unit"],
    
    // 房屋要求
    min_bedrooms: 3,
    min_bathrooms: 2,
    min_car_spaces: 1,
    
    // 特殊要求
    must_have_features: ["Garage", "Garden", "Pool"],
    avoid_features: ["Busy Road", "No Parking"],
    
    // 地理偏好
    max_distance_to_work: 30, // km
    preferred_school_districts: ["District A", "District B"],
    transport_preferences: ["Train", "Bus", "Ferry"]
  },
  
  // 通知偏好
  notification_preferences: {
    price_alerts: true,
    new_listings: true,
    market_reports: false,
    channels: {
      email: true,
      push: true,
      sms: false
    },
    frequency: {
      instant: ["price_alerts"],
      daily: ["new_listings"],
      weekly: ["market_reports"]
    }
  },
  
  // AI 助手偏好
  ai_preferences: {
    communication_style: "professional", // professional | casual | detailed
    language: "en",
    response_length: "moderate", // brief | moderate | detailed
    personality: "helpful", // helpful | analytical | friendly
    expertise_level: "beginner" // beginner | intermediate | expert
  },
  
  // 用户行为分析数据
  behavior_analytics: {
    // 搜索行为
    search_patterns: {
      most_searched_locations: [
        { location: "Downtown", count: 45, last_searched: ISODate() }
      ],
      price_range_evolution: [
        { date: ISODate(), min: 400000, max: 600000 },
        { date: ISODate(), min: 450000, max: 650000 }
      ],
      search_frequency: {
        daily_average: 3.2,
        peak_hours: [19, 20, 21], // 7-9 PM
        peak_days: ["Saturday", "Sunday"]
      }
    },
    
    // 浏览行为
    browsing_patterns: {
      avg_time_per_property: 180, // seconds
      properties_viewed_per_session: 8.5,
      favorite_property_features: [
        { feature: "Modern Kitchen", interest_score: 0.85 },
        { feature: "Large Garden", interest_score: 0.72 }
      ]
    },
    
    // 互动行为
    interaction_patterns: {
      chat_sessions_count: 25,
      avg_messages_per_session: 12,
      most_asked_questions: [
        "What's the school zone for this property?",
        "How's the public transport nearby?"
      ],
      satisfaction_ratings: [4, 5, 4, 5, 3] // last 5 interactions
    }
  },
  
  // 个性化推荐数据
  recommendation_data: {
    property_scores: {
      // 基于用户行为的房产评分
      "property_123": {
        score: 0.92,
        reasons: ["matches_budget", "preferred_location", "has_garden"],
        last_updated: ISODate()
      }
    },
    
    // 用户画像标签
    user_segments: ["first_time_buyer", "family_oriented", "budget_conscious"],
    
    // 推荐算法参数
    algorithm_weights: {
      location_importance: 0.35,
      price_importance: 0.25,
      features_importance: 0.20,
      size_importance: 0.20
    }
  },
  
  // 元数据
  created_at: ISODate(),
  updated_at: ISODate(),
  version: 1, // 用于数据迁移版本控制
  
  // 索引优化
  indexes: [
    { user_id: 1 },
    { "search_preferences.preferred_locations": 1 },
    { "search_preferences.budget_range.min": 1, "search_preferences.budget_range.max": 1 },
    { updated_at: 1 }
  ]
}

// 用户搜索历史集合 - user_search_history
{
  _id: ObjectId,
  user_id: "uuid-string",
  session_id: "session-uuid", // 兼容匿名会话
  
  search_query: {
    location: "Downtown Sydney",
    filters: {
      price_min: 500000,
      price_max: 700000,
      bedrooms: 3,
      property_type: "House"
    },
    sort_by: "price_asc",
    results_count: 24
  },
  
  user_actions: {
    properties_viewed: ["prop_123", "prop_456"],
    properties_saved: ["prop_123"],
    time_spent: 420, // seconds
    search_refinements: 2
  },
  
  search_context: {
    device_type: "desktop", // desktop | mobile | tablet
    referrer: "google_search",
    user_agent: "Mozilla/5.0...",
    ip_location: "Sydney, NSW"
  },
  
  timestamp: ISODate(),
  
  indexes: [
    { user_id: 1, timestamp: -1 },
    { session_id: 1, timestamp: -1 },
    { "search_query.location": 1 },
    { timestamp: -1 }
  ]
}

// 用户收藏房产集合 - user_saved_properties
{
  _id: ObjectId,
  user_id: "uuid-string",
  session_id: "session-uuid", // 兼容匿名会话
  
  property_id: "property_123",
  property_snapshot: {
    // 保存收藏时的房产快照，防止房产信息变更
    address: "123 Main St, Sydney",
    price: 650000,
    bedrooms: 3,
    bathrooms: 2,
    property_type: "House",
    images: ["img1.jpg", "img2.jpg"]
  },
  
  user_notes: "Love the kitchen and garden, close to kids' school",
  tags: ["family_friendly", "good_investment", "move_in_ready"],
  
  // 用户对该房产的互动记录
  interactions: {
    times_viewed: 5,
    last_viewed: ISODate(),
    shared_count: 1,
    inquiries_sent: 2,
    price_alerts_enabled: true
  },
  
  // 收藏相关元数据
  saved_at: ISODate(),
  updated_at: ISODate(),
  status: "active", // active | removed | property_sold
  
  indexes: [
    { user_id: 1, saved_at: -1 },
    { session_id: 1, saved_at: -1 },
    { property_id: 1 },
    { status: 1, saved_at: -1 }
  ]
}
```

#### 2.3 混合数据库架构优势

**为什么选择 PostgreSQL + MongoDB 混合架构？**

1. **数据特性匹配**：
   - PostgreSQL：用户核心信息（邮箱、密码）需要强一致性和事务支持
   - MongoDB：用户偏好数据结构灵活，查询模式复杂，适合文档存储

2. **性能优化**：
   - 用户认证查询（高频）：PostgreSQL 索引优化
   - 偏好数据查询（复杂）：MongoDB 聚合管道和灵活索引

3. **扩展性考虑**：
   - 用户基础数据增长相对稳定
   - 行为数据和偏好数据增长快速，MongoDB 水平扩展更容易

4. **开发效率**：
   - 偏好数据结构经常变化，NoSQL 避免频繁 schema 迁移
   - 复杂的用户画像分析，MongoDB 聚合功能更强大

### 3. 缓存策略
- **用户会话**：Redis 缓存，15分钟过期
- **用户资料**：内存缓存，5分钟过期  
- **用户偏好**：Redis 缓存，30分钟过期（从 MongoDB 加载）
- **搜索历史**：Redis 列表，最近50条搜索
- **推荐数据**：Redis 缓存，2小时过期
- **Token 黑名单**：Redis 集合，Token 过期时间

### 4. 监控告警
- **认证失败率**：超过5%触发告警
- **API 响应时间**：超过500ms触发告警
- **数据库连接**：连接池使用率超过80%
- **错误日志**：关键错误实时通知

## 总结

这个用户登录模块设计的核心思想是"渐进式价值实现"：

1. **保持现有优势**：不破坏当前流畅的匿名使用体验
2. **价值驱动转化**：在用户感受到明确价值时才引导注册
3. **无缝数据迁移**：确保用户投入的时间和数据不会丢失
4. **灵活扩展架构**：为未来的高级功能和商业模式留出空间

通过这种设计，我们既满足了当前的技术需求，又为产品的长期发展奠定了坚实基础。用户可以从匿名体验开始，逐步升级到注册用户，最终成为付费的高级用户，整个过程自然而流畅。
