import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Task, TaskStatus } from './entities/task.entity';
import { Model } from 'mongoose';


@Injectable()
export class TaskService {
  private readonly logger = new Logger('TaskService');
  
  constructor(
    @InjectModel(Task.name)
    private readonly taskModel: Model<Task>
  ) {}

  async create(createTaskDto: CreateTaskDto, userId: string) {
    try {
      this.logger.log(`Creating task for user ${userId}: ${JSON.stringify(createTaskDto)}`);
      
      if (!createTaskDto.title || createTaskDto.title.trim().length === 0) {
        throw new BadRequestException('El título es obligatorio');
      }
      
      if (createTaskDto.title.length > 100) {
        throw new BadRequestException('El título no puede exceder 100 caracteres');
      }
      
      if (createTaskDto.description && createTaskDto.description.length > 500) {
        throw new BadRequestException('La descripción no puede exceder 500 caracteres');
      }
      
      const task = new this.taskModel({
        ...createTaskDto,
        userId,
        createdAt: new Date(),
        updatedAt: new Date()
      });
  
      const savedTask = await task.save();
      this.logger.log(`Task saved successfully with ID: ${savedTask._id}`);
      return savedTask;
    } catch (error) {
      this.logger.error(`Error creating task: ${error.message}`);
      this.handleExceptions(error);
    }
  }

  async findAll(userId: string) {
    this.logger.log(`Finding all tasks for user ${userId}`);
    return this.taskModel.find({ userId }).sort({ createdAt: -1 });
  }

  async findAllByList(userId: string, listId: string) {
    this.logger.log(`Finding tasks for user ${userId} in list ${listId}`);
    return this.taskModel.find({ userId, listId }).sort({ createdAt: -1 });
  }

  async findAllPending(userId: string) {
    this.logger.log(`Finding pending tasks for user ${userId}`);
    return this.taskModel.find({ userId, isCompleted: false }).sort({ dueDate: 1 });
  }

  async findOne(id: string, userId: string) {
    this.logger.log(`Finding task ${id} for user ${userId}`);
    const task = await this.taskModel.findOne({ _id: id, userId });
    if (!task) {
      this.logger.warn(`Task with id ${id} not found for user ${userId}`);
      throw new NotFoundException(`Task with id ${id} not found`);
    }
    return task;
  }

  async update(id: string, updateTaskDto: UpdateTaskDto, userId: string) {
    try {
      this.logger.log(`Updating task ${id} for user ${userId}: ${JSON.stringify(updateTaskDto)}`);
      
      const updateData: any = { ...updateTaskDto };

      if (updateTaskDto.isCompleted === true) {
        updateData.completedAt = new Date();
      } else if (updateTaskDto.isCompleted === false) {
        updateData.completedAt = null;
      }

      const task = await this.taskModel.findOneAndUpdate(
        { _id: id, userId },
        updateData,
        { new: true }
      );

      if (!task) {
        this.logger.warn(`Task with id ${id} not found for user ${userId}`);
        throw new NotFoundException(`Task with id ${id} not found`);
      }

      this.logger.log(`Task updated: ${task._id}`);
      return task;
    } catch (error) {
      this.logger.error(`Error updating task ${id}: ${error.message}`);
      this.handleExceptions(error);
    }
  }

  async remove(id: string, userId: string) {
    this.logger.log(`Removing task ${id} for user ${userId}`);
    
    const task = await this.taskModel.findOneAndDelete({ _id: id, userId });
    if (!task) {
      this.logger.warn(`Task with id ${id} not found for user ${userId}`);
      throw new NotFoundException(`Task with id ${id} not found`);
    }
    
    this.logger.log(`Task deleted: ${id}`);
    return { message: 'Task deleted successfully' };
  }

  async removeCompletedTasks(userId: string): Promise<{ message: string; deletedCount: number }> {
    try {
      this.logger.log(`Removing completed tasks for user ${userId}`);
      
      const result = await this.taskModel.deleteMany({ 
        userId, 
        isCompleted: true 
      });
      
      this.logger.log(`Deleted ${result.deletedCount} completed tasks for user ${userId}`);
      
      return {
        message: `${result.deletedCount} tareas completadas eliminadas correctamente`,
        deletedCount: result.deletedCount || 0
      };
    } catch (error) {
      this.logger.error(`Error removing completed tasks for user ${userId}: ${error.message}`);
      this.handleExceptions(error);
      throw error;
    }
  }

  async markAllAsCompleted(userId: string): Promise<{ message: string; modifiedCount: number }> {
    try {
      this.logger.log(`Marking all pending tasks as completed for user ${userId}`);
      
      const result = await this.taskModel.updateMany(
        { 
          userId, 
          isCompleted: false 
        },
        { 
          isCompleted: true,
          completedAt: new Date(),
          status: TaskStatus.COMPLETED
        }
      );
      
      this.logger.log(`Marked ${result.modifiedCount} tasks as completed for user ${userId}`);
      
      return {
        message: `${result.modifiedCount} tareas marcadas como completadas`,
        modifiedCount: result.modifiedCount || 0
      };
    } catch (error) {
      this.logger.error(`Error marking tasks as completed for user ${userId}: ${error.message}`);
      this.handleExceptions(error);
      throw error;
    }
  }

  async getTaskStatistics(userId: string) {
    try {
      this.logger.log(`Getting task statistics for user ${userId}`);
      
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(today.getDate() + 1);

      const [total, completed, pending, todayTasks, overdue] = await Promise.all([
        this.taskModel.countDocuments({ userId }),
        this.taskModel.countDocuments({ userId, isCompleted: true }),
        this.taskModel.countDocuments({ userId, isCompleted: false }),
        this.taskModel.countDocuments({
          userId,
          dueDate: { $gte: today, $lt: tomorrow }
        }),
        this.taskModel.countDocuments({
          userId,
          isCompleted: false,
          dueDate: { $lt: today }
        })
      ]);

      const statistics = {
        total,
        completed,
        pending,
        todayTasks,
        overdue,
        completionRate: total > 0 ? Math.round((completed / total) * 100) : 0
      };

      this.logger.log(`Task statistics for user ${userId}: ${JSON.stringify(statistics)}`);
      return statistics;
    } catch (error) {
      this.logger.error(`Error getting task statistics for user ${userId}: ${error.message}`);
      this.handleExceptions(error);
    }
  }

  async getOverdueTasks(userId: string): Promise<Task[]> {
    try {
      this.logger.log(`Finding overdue tasks for user ${userId}`);
      
      const now = new Date();
      
      const overdueTasks = await this.taskModel.find({
        userId,
        isCompleted: false,
        dueDate: { $lt: now }
      }).sort({ dueDate: 1 });
      
      this.logger.log(`Found ${overdueTasks.length} overdue tasks for user ${userId}`);
      
      return overdueTasks;
    } catch (error) {
      this.logger.error(`Error finding overdue tasks for user ${userId}: ${error.message}`);
      this.handleExceptions(error);
      throw error;
    }
  }

  async getTodayTasks(userId: string): Promise<Task[]> {
    try {
      this.logger.log(`Finding today's tasks for user ${userId}`);
      
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      const todayTasks = await this.taskModel.find({
        userId,
        $or: [
          {
            dueDate: {
              $gte: today,
              $lt: tomorrow
            }
          },
          {
            createdAt: {
              $gte: today,
              $lt: tomorrow
            }
          }
        ]
      }).sort({ dueDate: 1, createdAt: 1 });
      
      this.logger.log(`Found ${todayTasks.length} tasks for today for user ${userId}`);
      
      return todayTasks;
    } catch (error) {
      this.logger.error(`Error finding today's tasks for user ${userId}: ${error.message}`);
      this.handleExceptions(error);
      throw error;
    }
  }

  private handleExceptions(error: any): never {
    if (error.code === 11000) {
      throw new BadRequestException(`Task already exists in the database ${JSON.stringify(error.keyValue)}`);
    }
    if (error.status === 404) {
      throw error;
    }
    console.error(error);
    throw new InternalServerErrorException('Unexpected error, check server logs');
  }
}