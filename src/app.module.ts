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
;
 

@Module({
    imports: [
      ConfigModule.forRoot({
        isGlobal: true,
      }),
      MongooseModule.forRootAsync({
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: (configService: ConfigService) => ({
          uri: configService.get('MONGO_URI') || 'mongodb://localhost:27017/cozyapp',
          dbName: configService.get('MONGO_DB_NAME') || 'cozyapp',
        }),
      }),
      SharedModule,
      AuthModule,
      TaskModule,
      TaskListModule,
      GlobalEventModule,
      PomodoroModule,
      StatsModule,
      ThemeModule
    ],
    providers: [ {
      provide: EmailService,
      useClass: process.env.NODE_ENV === 'production' ? EmailService : MockEmailService,
 } ]

    
})
export class AppModule {}
