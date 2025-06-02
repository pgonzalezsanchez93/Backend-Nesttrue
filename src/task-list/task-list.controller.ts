import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { TaskListService } from './task-list.service';
import { CreateTaskListDto } from './dto/create-task-list.dto';
import { UpdateTaskListDto } from './dto/update-task-list.dto';
import { AuthGuard } from '../auth/guards/auth/auth.guard';
import { UserOwnerGuard } from '../auth/guards/user-owner/user-owner.guard';

@Controller('users/:userId/task-lists')
@UseGuards(AuthGuard, UserOwnerGuard)
export class TaskListController {
  constructor(private readonly taskListService: TaskListService) {}

  @Post()
  create(@Body() createTaskListDto: CreateTaskListDto, @Param('userId') userId: string) {
    return this.taskListService.create(createTaskListDto, userId);
  }

  @Get()
  findAll(@Param('userId') userId: string) {
    return this.taskListService.findAll(userId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Param('userId') userId: string) {
    return this.taskListService.findOne(id, userId);
  }

  @Patch(':id')
  update(
    @Param('id') id: string, 
    @Body() updateTaskListDto: UpdateTaskListDto,
    @Param('userId') userId: string
  ) {
    return this.taskListService.update(id, updateTaskListDto, userId);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Param('userId') userId: string) {
    return this.taskListService.remove(id, userId);
  }

  @Delete(':id/permanent')
  hardDelete(@Param('id') id: string, @Param('userId') userId: string) {
    return this.taskListService.hardDelete(id, userId);
  }
}