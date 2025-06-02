import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ThemeController } from './theme.controller';
import { ThemeService } from './theme.service';
import { User, UserSchema } from '../auth/entities/user.entity';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: User.name,
        schema: UserSchema
      }
    ]),
    AuthModule
  ],
  controllers: [ThemeController],
  providers: [ThemeService],
  exports: [ThemeService]
})
export class ThemeModule {}