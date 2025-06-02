import { Module } from '@nestjs/common';
import { TaskListController } from './task-list.controller';
import { TaskListService } from './task-list.service';
import { MongooseModule } from '@nestjs/mongoose';
import { TaskList, TaskListSchema } from './entities/task-list.entity';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  controllers: [TaskListController],
  providers: [TaskListService],
  imports: [
    MongooseModule.forFeature([
      {
        name: TaskList.name,
        schema: TaskListSchema
      }
    ]),
    AuthModule
  ],
  exports: [TaskListService]
})
export class TaskListModule {}