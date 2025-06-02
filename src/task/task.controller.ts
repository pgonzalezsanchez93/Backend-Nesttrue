import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request, Query, HttpCode } from '@nestjs/common';
import { TaskService } from './task.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { AuthGuard } from '../auth/guards/auth/auth.guard';
import { User } from '../auth/entities/user.entity';
import { UserOwnerGuard } from '../auth/guards/user-owner/user-owner.guard';

@Controller('users/:userId/tasks')
@UseGuards(AuthGuard, UserOwnerGuard)
export class TaskController {
  constructor(private readonly taskService: TaskService) {}

  @Post()
  create(@Body() createTaskDto: CreateTaskDto, @Param('userId') userId: string) {
    return this.taskService.create(createTaskDto, userId);
  }

  @Get()
  findAll(@Param('userId') userId: string, @Query('listId') listId?: string) {
    if (listId) {
      return this.taskService.findAllByList(userId, listId);
    }
    
    return this.taskService.findAll(userId);
  }

  @Get('pending')
  findAllPending(@Param('userId') userId: string) {
    return this.taskService.findAllPending(userId);
  }

  @Get('overdue')
  findOverdueTasks(@Param('userId') userId: string) {
    return this.taskService.getOverdueTasks(userId);
  }

  @Get('today')
  findTodayTasks(@Param('userId') userId: string) {
    return this.taskService.getTodayTasks(userId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Param('userId') userId: string) {
    return this.taskService.findOne(id, userId);
  }

  @Patch(':id')
  update(
    @Param('id') id: string, 
    @Body() updateTaskDto: UpdateTaskDto,
    @Param('userId') userId: string
  ) {
    return this.taskService.update(id, updateTaskDto, userId);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Param('userId') userId: string) {
    return this.taskService.remove(id, userId);
  }


  @Delete('completed/all')
  @HttpCode(200)
  removeCompletedTasks(@Param('userId') userId: string) {
    return this.taskService.removeCompletedTasks(userId);
  }

  @Patch('complete/all')
  @HttpCode(200)
  markAllAsCompleted(@Param('userId') userId: string) {
    return this.taskService.markAllAsCompleted(userId);
  }
}