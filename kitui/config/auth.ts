// Authentication configuration
export const authConfig = {
  jwtSecret: process.env.JWT_SECRET || 'fallback-secret-key',
  sessionTimeout: 3600, // 1 hour
  bcryptRounds: 10,
  cookieName: 'sbg-session',
  cookieOptions: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    maxAge: 3600000 // 1 hour
  }
};