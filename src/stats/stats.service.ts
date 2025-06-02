import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Task } from '../task/entities/task.entity';
import { TaskList } from '../task-list/entities/task-list.entity';
import { PomodoroSession } from '../pomodoro/entities/pomodro-session.entity';
import moment from 'moment';

@Injectable()
export class StatsService {
  constructor(
    @InjectModel(Task.name) private readonly taskModel: Model<Task>,
    @InjectModel(TaskList.name) private readonly taskListModel: Model<TaskList>,
    @InjectModel(PomodoroSession.name) private readonly pomodoroSessionModel: Model<PomodoroSession>,
  ) {}

  async getTaskStatistics(userId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const totalTasks = await this.taskModel.countDocuments({ userId });
    const completedTasks = await this.taskModel.countDocuments({ userId, isCompleted: true });
    const pendingTasks = await this.taskModel.countDocuments({ userId, isCompleted: false });
    const todayTasks = await this.taskModel.countDocuments({
      userId,
      $or: [
        { dueDate: { $gte: today, $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000) } },
        { startDate: { $gte: today, $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000) } }
      ]
    });

    const totalLists = await this.taskListModel.countDocuments({ userId });

    return {
      total: totalTasks,
      completed: completedTasks,
      pending: pendingTasks,
      today: todayTasks,
      lists: totalLists,
    };
  }

  async getRecentTasks(userId: string, limit: number = 5) {
    return this.taskModel.find({ userId })
      .sort({ updatedAt: -1 })
      .limit(limit)
      .select('title isCompleted updatedAt')
      .lean();
  }

  async getPomodoroStatistics(userId: string) {
    const totalSessions = await this.pomodoroSessionModel.countDocuments({ 
      userId, 
      completed: true 
    });
    
    const totalMinutesResult = await this.pomodoroSessionModel.aggregate([
      { $match: { userId, completed: true } },
      { $group: { _id: null, total: { $sum: '$duration' } } }
    ]);
    
    const totalMinutes = totalMinutesResult.length > 0 ? totalMinutesResult[0].total : 0;
    
    return {
      totalSessions,
      totalMinutes: Math.floor(totalMinutes / 60),
    };
  }

  async getProductivityByDay(userId: string, days: number = 7): Promise<any[]> {
    const results: any[] = [];
    const endDate = moment().endOf('day');
    const startDate = moment().subtract(days - 1, 'days').startOf('day');
    
    for (let i = 0; i < days; i++) {
      const date = moment(startDate).add(i, 'days');
      const dayStart = date.toDate();
      const dayEnd = date.endOf('day').toDate();
      
      const completed = await this.taskModel.countDocuments({
        userId,
        isCompleted: true,
        completedAt: { $gte: dayStart, $lte: dayEnd }
      });

      const created = await this.taskModel.countDocuments({
        userId,
        createdAt: { $gte: dayStart, $lte: dayEnd }
      });
      
      results.push({
        date: dayStart,
        completed,
        created
      });
    }
    
    return results;
  }

  async getMostProductiveHours(userId: string, days: number = 30) {
    const startDate = moment().subtract(days, 'days').toDate();
    
    const completionsByHour = await this.taskModel.aggregate([
      { 
        $match: { 
          userId,
          isCompleted: true,
          completedAt: { $gte: startDate }
        } 
      },
      {
        $project: {
          hour: { $hour: '$completedAt' }
        }
      },
      {
        $group: {
          _id: '$hour',
          count: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);
    
    const result = Array(24).fill(0).map((_, index) => {
      const hour = completionsByHour.find(h => h._id === index);
      return {
        hour: index,
        count: hour ? hour.count : 0
      };
    });
    
    return result;
  }
}