export const environment = {
  production: process.env.NODE_ENV === 'production',
  development: process.env.NODE_ENV === 'development',
  port: parseInt(process.env.PORT) || 3000,
  
  // MongoDB
  mongoDbName: process.env.MONGO_DB_NAME || 'cozyapp',
  mongoUri: process.env.MONGODB_URI || `mongodb://localhost:27017/${process.env.MONGO_DB_NAME || 'cozyapp'}`,
  
  // JWT
  jwtSecret: process.env.JWT_SEED || 'CozyApp_Secret_JWT_Seed_Development_Key_2024',
  jwtExpiresIn: '7d',
  
  // Admin por defecto
  adminEmail: process.env.ADMIN_EMAIL || 'admin@cozyapp.com',
  adminPassword: process.env.ADMIN_PASSWORD || 'Admin123!',
  adminName: process.env.ADMIN_NAME || 'Administrator',
  
  // Email
  email: {
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT) || 587,
    secure: process.env.EMAIL_SECURE === 'true',
    user: process.env.EMAIL_USER,
    password: process.env.EMAIL_PASSWORD,
    from: process.env.EMAIL_FROM || 'noreply@cozyapp.com',
    fromName: process.env.EMAIL_FROM_NAME || 'CozyApp'
  },
  
  // CORS
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:4200',
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:4200'
};
