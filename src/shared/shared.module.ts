import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { EmailService } from './services/email.service';
import { MockEmailService } from './services/mock-email.service';

@Module({
    imports: [ConfigModule],
    providers: [
      {
      provide: EmailService,
      useFactory: (configService: ConfigService) => {
        const isDevelopment = configService.get('NODE_ENV') !== 'production';
        console.log(' Email Service Factory:', {
          NODE_ENV: configService.get('NODE_ENV'),
          isDevelopment,
          EMAIL_HOST: configService.get('EMAIL_HOST'),
          EMAIL_USER: configService.get('EMAIL_USER'),
          EMAIL_PASSWORD: configService.get('EMAIL_PASSWORD') ? '[SET]' : '[NOT SET]'
        });
        
        if (isDevelopment) {
          console.log(' Using MockEmailService for development');
          return new MockEmailService();
        } else {
          console.log(' Using EmailService for production');
          return new EmailService(configService);
        }
      },
      inject: [ConfigService],
    },
  ],
    exports: [EmailService],
  })
export class SharedModule {}
