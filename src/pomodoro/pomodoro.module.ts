import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PomodoroController } from './pomodoro.controller';
import { PomodoroService } from './pomodoro.service';
import { PomodoroSession, PomodoroSessionSchema } from './entities/pomodro-session.entity';
import { User, UserSchema } from '../auth/entities/user.entity';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [
    AuthModule, 
    MongooseModule.forFeature([
      { name: PomodoroSession.name, schema: PomodoroSessionSchema },
      { name: User.name, schema: UserSchema }
    ])
  ],
  controllers: [PomodoroController],
  providers: [PomodoroService],
  exports: [PomodoroService]
})
export class PomodoroModule {}