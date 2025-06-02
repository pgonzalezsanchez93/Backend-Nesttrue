
import { Module } from '@nestjs/common';
import { TaskController } from './task.controller';
import { TaskService } from './task.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Task } from './entities/task.entity';
import {  TaskSchema } from './entities/task.entity';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  controllers: [TaskController],
  providers: [TaskService],
  imports: [
    MongooseModule.forFeature([
      {
        name: Task.name,
        schema: TaskSchema
      }
    ]),
    AuthModule
  ],
  exports: [TaskService]
})
export class TaskModule {}