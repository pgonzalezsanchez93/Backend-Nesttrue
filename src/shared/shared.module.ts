import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { EmailService } from './services/email.service';
import { MockEmailService } from './services/mock-email.service';

@Module({
    imports: [ConfigModule],
    providers: [
      {
        provide: EmailService,
        /* useFactory: (configService: ConfigService) => {
          const isDevelopment = configService.get('NODE_ENV') !== 'production';
          return isDevelopment ? new MockEmailService() : new EmailService(configService);
        },
        inject: [ConfigService], */
        useClass: process.env.NODE_ENV === 'production' ? EmailService : MockEmailService,
      },
    ],
    exports: [EmailService],
  })
export class SharedModule {}
