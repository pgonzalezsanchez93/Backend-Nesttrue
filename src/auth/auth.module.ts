import { Module } from '@nestjs/common';
import { AuthService } from './services/auth.service';
import { AuthController } from './auth.controller';
import { User, UserSchema } from './entities/user.entity';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { SharedModule } from 'src/shared/shared.module';

@Module({
  imports: [
    SharedModule, 
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema }
    ]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get('JWT_SEED') || 'CozyApp_Secret_JWT_Seed',
        signOptions: { expiresIn: '7d' }
      })
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService],
  exports: [JwtModule, AuthService, MongooseModule]
})
export class AuthModule {}
