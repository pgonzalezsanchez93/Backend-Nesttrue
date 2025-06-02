import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { CreateTaskListDto } from './dto/create-task-list.dto';
import { UpdateTaskListDto } from './dto/update-task-list.dto';
import { InjectModel } from '@nestjs/mongoose';
import { TaskList } from './entities/task-list.entity';
import { Model } from 'mongoose';

@Injectable()
export class TaskListService {
  private readonly logger = new Logger('TaskListService');

  constructor(
    @InjectModel(TaskList.name)
    private readonly taskListModel: Model<TaskList>
  ) {}

  
  async create(createTaskListDto: CreateTaskListDto, userId: string) {
    try {
      this.logger.log(`Creating task list for user ${userId}: ${JSON.stringify(createTaskListDto)}`);
      
      const taskList = new this.taskListModel({
        ...createTaskListDto,
        userId
      });

      await taskList.save();
      this.logger.log(`Task list created with ID: ${taskList._id}`);
      return taskList;
    } catch (error) {
      this.logger.error(`Error creating task list: ${error.message}`);
      this.handleExceptions(error);
    }
  }

  async findAll(userId: string) {
    this.logger.log(`Finding all task lists for user ${userId}`);
    return this.taskListModel.find({ userId, isActive: true }).sort({ name: 1 });
  }

  async findOne(id: string, userId: string) {
    this.logger.log(`Finding task list ${id} for user ${userId}`);
    const taskList = await this.taskListModel.findOne({ _id: id, userId });
    if (!taskList) {
      this.logger.warn(`Task list with id ${id} not found for user ${userId}`);
      throw new NotFoundException(`Task list with id ${id} not found`);
    }
    return taskList;
  }

  async update(id: string, updateTaskListDto: UpdateTaskListDto, userId: string) {
    try {
      this.logger.log(`Updating task list ${id} for user ${userId}: ${JSON.stringify(updateTaskListDto)}`);
      
      const taskList = await this.taskListModel.findOneAndUpdate(
        { _id: id, userId },
        updateTaskListDto,
        { new: true }
      );

      if (!taskList) {
        this.logger.warn(`Task list with id ${id} not found for user ${userId}`);
        throw new NotFoundException(`Task list with id ${id} not found`);
      }

      this.logger.log(`Task list updated: ${taskList._id}`);
      return taskList;
    } catch (error) {
      this.logger.error(`Error updating task list ${id}: ${error.message}`);
      this.handleExceptions(error);
    }
  }

  async remove(id: string, userId: string) {
    this.logger.log(`Archiving task list ${id} for user ${userId}`);
    

    const taskList = await this.taskListModel.findOneAndUpdate(
      { _id: id, userId },
      { isActive: false },
      { new: true }
    );
    
    if (!taskList) {
      this.logger.warn(`Task list with id ${id} not found for user ${userId}`);
      throw new NotFoundException(`Task list with id ${id} not found`);
    }
    
    this.logger.log(`Task list archived: ${taskList._id}`);
    return { message: 'Task list archived successfully' };
  }

  async hardDelete(id: string, userId: string) {
    this.logger.log(`Permanently deleting task list ${id} for user ${userId}`);
    
    const taskList = await this.taskListModel.findOneAndDelete({ _id: id, userId });
    if (!taskList) {
      this.logger.warn(`Task list with id ${id} not found for user ${userId}`);
      throw new NotFoundException(`Task list with id ${id} not found`);
    }
    
    this.logger.log(`Task list permanently deleted: ${id}`);
    return { message: 'Task list deleted permanently' };
  }

  private handleExceptions(error: any) {
    if (error.code === 11000) {
      throw new BadRequestException(`Task list already exists in the database ${JSON.stringify(error.keyValue)}`);
    }
    if (error.status === 404) {
      throw error;
    }
    console.error(error);
    throw new InternalServerErrorException('Unexpected error, check server logs');
  }
}