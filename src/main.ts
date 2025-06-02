import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { getModelToken } from '@nestjs/mongoose';
import { User } from './auth/entities/user.entity';
import { initializeApp } from './app.init';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // CORS Configuration
  app.enableCors({
    origin: ['http://localhost:4200', 'http://127.0.0.1:4200'], 
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
    exposedHeaders: ['Authorization']
  });

  // Global Validation Pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    })
  );

  app.setGlobalPrefix('api');

  // Initialize App (Create Admin User)
  try {
    const userModel = app.get(getModelToken(User.name));
    await initializeApp(userModel);
  } catch (error) {
    console.error('Error during app initialization:', error);
  }

  // Port Configuration with fallback
  const PORT = process.env.PORT || 3000;
  
  // Try to start on the preferred port, if not available, try alternatives
  try {
    await app.listen(PORT);
    console.log(`===========================================`);
    console.log(`🚀 App running on port: ${PORT}`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`📊 Database: ${process.env.MONGO_URI ? 'Connected' : 'Local'}`);
    console.log(`🔗 Frontend URL: ${process.env.CORS_ORIGIN || 'http://localhost:4200'}`);
    console.log(`===========================================`);
  } catch (error) {
    if (error.code === 'EADDRINUSE') {
      console.error(`❌ Port ${PORT} is already in use.`);
      console.log('💡 Try one of these solutions:');
      console.log('   1. Kill the process using the port:');
      console.log('      Windows: netstat -ano | findstr :3000, then taskkill /PID <PID> /F');
      console.log('      Mac/Linux: lsof -i :3000, then kill -9 <PID>');
      console.log('   2. Use a different port: PORT=3001 npm run start:dev');
      console.log('   3. Set PORT in your .env file');
      process.exit(1);
    } else {
      console.error('Error starting application:', error);
      process.exit(1);
    }
  }
}

bootstrap();