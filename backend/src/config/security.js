/**
 * Security Configuration
 * Centralized security settings for the application
 */

module.exports = {
  // JWT Configuration
  jwt: {
    secret: process.env.JWT_SECRET,
    accessExpiresIn: process.env.JWT_ACCESS_EXPIRES || '1d',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES || '7d',
    rememberMeExpiresIn: '30d',
    issuer: 'vexenhanh',
  },

  // Session Configuration
  session: {
    timeoutMinutes: parseInt(process.env.SESSION_TIMEOUT_MINUTES, 10) || 30,
    extendOnActivity: true, // Extend session on each authenticated request
  },

  // Rate Limiting
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW, 10) || 60000, // 1 minute
    max: parseInt(process.env.RATE_LIMIT_MAX, 10) || 100, // 100 requests per minute
    standardHeaders: true,
    legacyHeaders: false,
  },

  // CORS Configuration
  cors: {
    origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
    credentials: true,
    optionsSuccessStatus: 200,
  },

  // Password Requirements
  password: {
    minLength: 6,
    requireUppercase: true,
    requireLowercase: true,
    requireNumbers: true,
    requireSpecialChars: false,
  },

  // File Upload
  upload: {
    maxFileSize: 5 * 1024 * 1024, // 5MB
    allowedImageTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'],
    allowedDocumentTypes: ['application/pdf'],
  },

  // Security Headers (Helmet.js)
  helmet: {
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", 'data:', 'https:'],
        fontSrc: ["'self'", 'data:'],
        connectSrc: ["'self'"],
        frameSrc: ["'none'"],
        objectSrc: ["'none'"],
      },
    },
    hsts: {
      maxAge: 31536000, // 1 year
      includeSubDomains: true,
      preload: true,
    },
    noSniff: true,
    frameguard: {
      action: 'deny',
    },
    xssFilter: true,
  },

  // HTTPS Configuration
  https: {
    enabled: process.env.NODE_ENV === 'production',
    strictTransportSecurity: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true,
    },
  },

  // Allowed Parameters for HPP (HTTP Parameter Pollution)
  hppWhitelist: ['price', 'rating', 'seats', 'date', 'sort', 'limit', 'page'],

  // OAuth Configuration
  oauth: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
    },
    facebook: {
      clientId: process.env.FACEBOOK_APP_ID,
      clientSecret: process.env.FACEBOOK_APP_SECRET,
      callbackURL: process.env.FACEBOOK_CALLBACK_URL,
    },
  },

  // Brute Force Protection
  bruteForce: {
    freeRetries: 5,
    minWait: 5 * 60 * 1000, // 5 minutes
    maxWait: 60 * 60 * 1000, // 1 hour
    lifetime: 24 * 60 * 60, // 1 day
  },

  // Logging
  logging: {
    logSecurityEvents: true,
    logFailedLogins: true,
    logSuspiciousActivity: true,
  },

  // Attack Detection Patterns
  attackPatterns: {
    xss: /<script[^>]*>.*?<\/script>/gi,
    javascript: /javascript:/gi,
    eventHandlers: /on\w+\s*=/gi,
    templateInjection: /\$\{.*\}/g,
    pathTraversal: /\.\.\//g,
    iframeInjection: /<iframe/gi,
  },

  // Input Sanitization
  sanitization: {
    removeNullBytes: true,
    trimWhitespace: true,
    replaceNoSQLOperators: true,
  },
};
