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
;
 
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        // Railway puede usar MONGODB_URI o MONGO_URI
        const mongoUri = 
          configService.get('MONGODB_URI') || 
          configService.get('MONGO_URI') || 
          'mongodb://localhost:27017/cozyapp';
        
        const dbName = configService.get('MONGO_DB_NAME') || 'cozyapp';
        
        console.log(`🔗 Connecting to MongoDB: ${mongoUri.split('@')[1] || mongoUri}`);
        
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
    {
      provide: EmailService,
      useClass: process.env.NODE_ENV === 'production' ? EmailService : MockEmailService,
    }
  ]
})
export class AppModule {}