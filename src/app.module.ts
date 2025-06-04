import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config'

import { AuthModule } from './auth/auth.module';
import { GlobalEventModule } from './global-events/global-events.module';
import { TaskListModule } from './task-list';
import { TaskModule } from './task/task.module';
import { SharedModule } from './shared/shared.module';
import { StatsModule } from './stats/stats.module';
import { PomodoroModule } from './pomodoro/pomodoro.module';
import { APP_GUARD } from '@nestjs/core';
import { AuthGuard } from './auth/guards/auth/auth.guard';
import { ThemeModule } from './theme/theme.module';
import { EmailService } from './shared/services/email.service';
import { MockEmailService } from './shared/services/mock-email.service';
import { HealthModule } from './health/health.module';
import { AppController } from './app.controller';
;
 
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', '.env.local'],
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const mongoUri = 
          configService.get('MONGODB_URI') || 
          configService.get('MONGO_URI') || 
          'mongodb://localhost:27017/cozyapp';
        
        const dbName = configService.get('MONGO_DB_NAME') || 'cozyapp';
        
        console.log(' Environment variables check:');
        console.log('- MONGODB_URI:', configService.get('MONGODB_URI') ? 'SET' : 'NOT SET');
        console.log('- MONGO_URI:', configService.get('MONGO_URI') ? 'SET' : 'NOT SET');
        console.log('- EMAIL_HOST:', configService.get('EMAIL_HOST') ? 'SET' : 'NOT SET');
        console.log('- EMAIL_USER:', configService.get('EMAIL_USER') ? 'SET' : 'NOT SET');
        console.log('- EMAIL_PASSWORD:', configService.get('EMAIL_PASSWORD') ? 'SET' : 'NOT SET');
        console.log('- NODE_ENV:', configService.get('NODE_ENV'));
        console.log('- Using URI:', mongoUri);
        
        return {
          uri: mongoUri,
          dbName: dbName,
        };
      },
    }),
    SharedModule, 
    AuthModule,
    TaskModule,
    TaskListModule,
    GlobalEventModule,
    PomodoroModule,
    StatsModule,
    ThemeModule,
    HealthModule
  ],
  controllers: [AppController],
  providers: [

  ]
})
export class AppModule {}