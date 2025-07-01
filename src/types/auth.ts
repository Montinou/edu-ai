// Authentication and User Management Types

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  birthDate: string;
  emailVerified: boolean;
  createdAt: string;
  updatedAt: string;
  lastLogin?: string;
  status: 'active' | 'suspended' | 'deleted';
}

export interface UserSession {
  id: string;
  userId: string;
  sessionToken: string;
  expiresAt: string;
  createdAt: string;
  lastAccessed: string;
  ipAddress?: string;
  userAgent?: string;
}

export interface UserProfile {
  id: string;
  userId: string;
  displayName?: string;
  avatarUrl?: string;
  gradeLevel?: number;
  preferredCategories: string[];
  learningGoals?: string;
  difficultyPreference: number;
  languagePreference: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserStats {
  id: string;
  userId: string;
  totalGamesPlayed: number;
  totalProblemsSolved: number;
  totalCorrectAnswers: number;
  totalCardsCollected: number;
  currentStreak: number;
  longestStreak: number;
  totalStudyTime: number; // en minutos
  level: number;
  experiencePoints: number;
  createdAt: string;
  updatedAt: string;
}

export interface UserAchievement {
  id: string;
  userId: string;
  achievementType: string;
  achievementData: Record<string, any>;
  unlockedAt: string;
}

export interface GameSession {
  id: string;
  userId: string;
  sessionType: 'practice' | 'challenge' | 'multiplayer';
  cardsUsed: string[];
  problemsAttempted: number;
  problemsCorrect: number;
  totalDamageDealt: number;
  totalDamageReceived: number;
  sessionDuration?: number; // en segundos
  experienceGained: number;
  result?: 'victory' | 'defeat' | 'incomplete';
  sessionData: Record<string, any>;
  startedAt: string;
  completedAt?: string;
}

// Request/Response Types
export interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  birthDate: string;
}

export interface RegisterResponse {
  user: User;
  requireEmailVerification: boolean;
  message: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: User;
  sessionToken: string;
  expiresAt: string;
  message: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ForgotPasswordResponse {
  message: string;
  emailSent: boolean;
}

export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
}

export interface ResetPasswordResponse {
  message: string;
  success: boolean;
}

export interface VerifyEmailRequest {
  token: string;
}

export interface VerifyEmailResponse {
  message: string;
  verified: boolean;
}

export interface UpdateProfileRequest {
  displayName?: string;
  gradeLevel?: number;
  preferredCategories?: string[];
  learningGoals?: string;
  difficultyPreference?: number;
  languagePreference?: string;
}

export interface UpdateProfileResponse {
  profile: UserProfile;
  message: string;
}

// Auth Context Types
export interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  stats: UserStats | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: UpdateProfileRequest) => Promise<void>;
  refreshUser: () => Promise<void>;
}

// Auth State Types
export interface AuthState {
  user: User | null;
  profile: UserProfile | null;
  stats: UserStats | null;
  loading: boolean;
  error: string | null;
}

export type AuthAction =
  | { type: 'AUTH_START' }
  | { type: 'AUTH_SUCCESS'; payload: { user: User; profile?: UserProfile; stats?: UserStats } }
  | { type: 'AUTH_ERROR'; payload: string }
  | { type: 'AUTH_LOGOUT' }
  | { type: 'UPDATE_PROFILE'; payload: UserProfile }
  | { type: 'UPDATE_STATS'; payload: UserStats };

// Validation Types
export interface ValidationError {
  field: string;
  message: string;
}

export interface FormValidationState {
  isValid: boolean;
  errors: ValidationError[];
}

// Achievement Types
export type AchievementType = 
  | 'first_login'
  | 'first_game'
  | 'first_win'
  | 'streak_5'
  | 'streak_10'
  | 'streak_25'
  | 'streak_50'
  | 'streak_100'
  | 'problems_100'
  | 'problems_500'
  | 'problems_1000'
  | 'problems_5000'
  | 'cards_10'
  | 'cards_50'
  | 'cards_100'
  | 'cards_500'
  | 'level_5'
  | 'level_10'
  | 'level_25'
  | 'level_50'
  | 'study_time_10h'
  | 'study_time_50h'
  | 'study_time_100h'
  | 'perfect_game'
  | 'speed_demon'
  | 'master_mathematician';

export interface AchievementDefinition {
  type: AchievementType;
  name: string;
  description: string;
  icon: string;
  requirement: string;
  points: number;
  rarity: 'común' | 'raro' | 'épico' | 'legendario';
}

// Session Management Types
export interface SessionInfo {
  isValid: boolean;
  expiresAt: string;
  user?: User;
}

// Rate Limiting Types
export interface RateLimitInfo {
  remaining: number;
  resetTime: number;
  limit: number;
}

// Email Types
export interface EmailVerificationTemplate {
  to: string;
  subject: string;
  html: string;
  text: string;
}

export interface PasswordResetTemplate {
  to: string;
  subject: string;
  html: string;
  text: string;
}

// Security Types
export interface SecuritySettings {
  passwordMinLength: number;
  passwordRequireUppercase: boolean;
  passwordRequireLowercase: boolean;
  passwordRequireNumbers: boolean;
  passwordRequireSymbols: boolean;
  sessionDurationDays: number;
  maxLoginAttempts: number;
  lockoutDurationMinutes: number;
}

// Audit Log Types
export interface AuditLog {
  id: string;
  userId: string;
  action: string;
  resource: string;
  details: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
}

export type AuditAction = 
  | 'login'
  | 'logout'
  | 'register'
  | 'password_reset_request'
  | 'password_reset_complete'
  | 'email_verification'
  | 'profile_update'
  | 'account_suspension'
  | 'account_deletion';

// Middleware Types
export interface AuthenticatedRequest extends Request {
  user?: User;
  session?: UserSession;
}

// Error Types
export class AuthError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 400
  ) {
    super(message);
    this.name = 'AuthError';
  }
}

export class ValidationError extends Error {
  constructor(
    message: string,
    public errors: ValidationError[]
  ) {
    super(message);
    this.name = 'ValidationError';
  }
}

export class RateLimitError extends Error {
  constructor(
    message: string,
    public resetTime: number
  ) {
    super(message);
    this.name = 'RateLimitError';
  }
} 