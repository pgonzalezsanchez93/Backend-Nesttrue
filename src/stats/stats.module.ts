import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { StatsController } from './stats.controller';
import { StatsService } from './stats.service';
import { Task, TaskSchema } from '../task/entities/task.entity';
import { TaskList, TaskListSchema } from '../task-list/entities/task-list.entity';
import { User, UserSchema } from '../auth/entities/user.entity';
import { PomodoroSession, PomodoroSessionSchema } from './entities/pomodoro-session.entity';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Task.name, schema: TaskSchema },
      { name: TaskList.name, schema: TaskListSchema },
      { name: PomodoroSession.name, schema: PomodoroSessionSchema },
    ]),
    AuthModule,
  ],
  controllers: [StatsController],
  providers: [StatsService],
  exports: [StatsService],
})
export class StatsModule {}