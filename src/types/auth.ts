// User authentication related type definitions

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  phone?: string;
  avatar?: string;
  status: 'active' | 'suspended' | 'pending_verification';
  tier: 'anonymous' | 'registered' | 'premium';
  emailVerified: boolean;
  phoneVerified: boolean;
  createdAt: Date;
  lastLoginAt: Date;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: UserProfile | null;
  tokens: TokenPair | null;
  sessionId: string;
  loading: boolean;
  error: string | null;
}

export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegistrationData {
  email: string;
  password: string;
  confirmPassword: string;
  name: string;
  phone?: string;
  agreeToTerms: boolean;
  marketingConsent?: boolean;
  sessionId?: string; // For data migration
}

export interface AuthResponse {
  user: UserProfile;
  tokens: TokenPair;
  migrationResult?: MigrationResult;
}

export interface MigrationResult {
  success: boolean;
  migratedItems: string[];
  errors?: string[];
}

export interface ChatMessage {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
  metadata?: Record<string, unknown>;
}

export interface SearchQuery {
  id: string;
  query: string;
  filters: Record<string, unknown>;
  timestamp: Date;
  resultsCount: number;
}

export interface AnonymousUserData {
  sessionId: string;
  savedProperties: string[];
  chatHistory: ChatMessage[];
  preferences: Record<string, unknown>;
  searchHistory: SearchQuery[];
}

export interface UserPreferences {
  // Search preferences
  preferredLocations: string[];
  budgetRange: {
    min: number;
    max: number;
    currency: string;
  };
  propertyTypes: string[];
  
  // Property requirements
  minBedrooms?: number;
  minBathrooms?: number;
  minCarSpaces?: number;
  
  // Special requirements
  mustHaveFeatures: string[];
  avoidFeatures: string[];
  
  // Notification preferences
  notifications: {
    priceAlerts: boolean;
    newListings: boolean;
    marketReports: boolean;
    email: boolean;
    push: boolean;
    sms: boolean;
  };
  
  // AI assistant preferences
  aiAssistant: {
    communicationStyle: 'professional' | 'casual' | 'detailed';
    language: 'en' | 'zh-CN' | 'zh-TW';
    responseLength: 'brief' | 'moderate' | 'detailed';
  };
}

export interface OAuthProfile {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  provider: 'google' | 'apple';
}

export interface MagicLinkRequest {
  email: string;
  purpose: 'login' | 'register' | 'password_reset';
}

export interface AuthError {
  code: string;
  message: string;
  field?: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

// API response types
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: AuthError;
  message?: string;
}

// Local storage key names
export const LOCAL_STORAGE_KEYS = {
  ACCESS_TOKEN: 'auth_access_token',
  REFRESH_TOKEN: 'auth_refresh_token',
  USER_PROFILE: 'auth_user_profile',
  SESSION_ID: 'chat_session_id', // Maintain backward compatibility
  SAVED_PROPERTIES: 'savedProperties', // Maintain backward compatibility
  AUTH_STATE: 'auth_state',
} as const;

// Authentication event types
export type AuthEventType = 
  | 'login_success'
  | 'login_failed'
  | 'register_success'
  | 'register_failed'
  | 'logout'
  | 'token_refresh'
  | 'session_migration'
  | 'profile_updated';

export interface AuthEvent {
  type: AuthEventType;
  payload?: Record<string, unknown>;
  timestamp: Date;
}
