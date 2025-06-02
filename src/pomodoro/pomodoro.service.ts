import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from '../auth/entities/user.entity';
import { PomodoroSession } from './entities/pomodro-session.entity';
import { CreatePomodoroSessionDto, PomodoroMode } from './dto/create-pomodoro-session.dto';
import { UpdatePomodoroSettingsDto } from './dto/update-pomodoro-settings.dto';
import moment from 'moment';
import { BehaviorSubject, catchError, interval, Observable, of, Subscription } from 'rxjs';
import { PomodoroSettings } from '../../../cozyApp/src/app/auth/interfaces/user.interface';
import { environment } from '../../../cozyApp/src/environments/environments';
import { PomodoroStatus } from '../../../cozyApp/src/app/pomodoro/interfaces/pomodoro-enums';
import { PomodoroState } from '../../../cozyApp/src/app/pomodoro/interfaces/pomodoro-state.interface';
import { HttpClient } from '@angular/common/http';

interface PomodoroSettingsComplete {
  workDuration: number;
  shortBreakDuration: number;
  longBreakDuration: number;
  sessionsUntilLongBreak: number;
  autoStartBreaks: boolean;
  autoStartPomodoros: boolean;
  soundEnabled: boolean;
  notificationsEnabled: boolean;
}

@Injectable()
export class PomodoroService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
    @InjectModel(PomodoroSession.name) private readonly pomodoroSessionModel: Model<PomodoroSession>
  ) {}

  async createSession(userId: string, createPomodoroSessionDto: CreatePomodoroSessionDto) {
    const session = new this.pomodoroSessionModel({
      userId,
      ...createPomodoroSessionDto,
      startTime: new Date(),
      endTime: createPomodoroSessionDto.completed ? new Date() : null
    });

    await session.save();
    return session;
  }

  async getSessions(userId: string, limit: number = 10, page: number = 1) {
    const skip = (page - 1) * limit;
    
    const [sessions, totalSessions] = await Promise.all([
      this.pomodoroSessionModel.find({ userId })
        .sort({ startTime: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      this.pomodoroSessionModel.countDocuments({ userId })
    ]);

    return {
      sessions,
      page,
      limit,
      totalSessions,
      totalPages: Math.ceil(totalSessions / limit)
    };
  }

  async getSettings(userId: string) {
    const user = await this.userModel.findById(userId).lean();

    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    const defaultSettings = {
      workDuration: 25,
      shortBreakDuration: 5,
      longBreakDuration: 15,
      sessionsUntilLongBreak: 4,
      autoStartBreaks: true,
      autoStartPomodoros: false,
      soundEnabled: true,
      notificationsEnabled: true
    };

    // Si no tiene configuraciones, devolver las por defecto
    if (!user.preferences || !user.preferences.pomodoroSettings) {
      return defaultSettings;
    }

    // Combinar configuración existente con valores por defecto
    const userSettings = user.preferences.pomodoroSettings;
    return {
      workDuration: userSettings.workDuration ?? defaultSettings.workDuration,
      shortBreakDuration: userSettings.shortBreakDuration ?? defaultSettings.shortBreakDuration,
      longBreakDuration: userSettings.longBreakDuration ?? defaultSettings.longBreakDuration,
      sessionsUntilLongBreak: userSettings.sessionsUntilLongBreak ?? defaultSettings.sessionsUntilLongBreak,
      autoStartBreaks: userSettings.autoStartBreaks ?? defaultSettings.autoStartBreaks,
      autoStartPomodoros: userSettings.autoStartPomodoros ?? defaultSettings.autoStartPomodoros,
      soundEnabled: userSettings.soundEnabled ?? defaultSettings.soundEnabled,
      notificationsEnabled: userSettings.notificationsEnabled ?? defaultSettings.notificationsEnabled
    };
  }

  async updateSettings(userId: string, updatePomodoroSettingsDto: UpdatePomodoroSettingsDto) {
    const user = await this.userModel.findById(userId);

    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    if (!user.preferences) {
      user.preferences = {};
    }

    // Configuración por defecto
    const defaultSettings = {
      workDuration: 25,
      shortBreakDuration: 5,
      longBreakDuration: 15,
      sessionsUntilLongBreak: 4,
      autoStartBreaks: true,
      autoStartPomodoros: false,
      soundEnabled: true,
      notificationsEnabled: true
    };

    // Obtener configuración actual o usar objeto vacío
    const currentPomodoroSettings = user.preferences.pomodoroSettings || {};

    // Función helper para obtener valor de forma segura
    const getValue = (key: string, newValue: any, defaultValue: any): any => {
      if (newValue !== undefined) return newValue;
      if (currentPomodoroSettings && currentPomodoroSettings[key] !== undefined) {
        return currentPomodoroSettings[key];
      }
      return defaultValue;
    };

    // Crear la nueva configuración
    const newSettings = {
      workDuration: getValue('workDuration', updatePomodoroSettingsDto.workDuration, defaultSettings.workDuration),
      shortBreakDuration: getValue('shortBreakDuration', updatePomodoroSettingsDto.shortBreakDuration, defaultSettings.shortBreakDuration),
      longBreakDuration: getValue('longBreakDuration', updatePomodoroSettingsDto.longBreakDuration, defaultSettings.longBreakDuration),
      sessionsUntilLongBreak: getValue('sessionsUntilLongBreak', updatePomodoroSettingsDto.sessionsUntilLongBreak, defaultSettings.sessionsUntilLongBreak),
      autoStartBreaks: getValue('autoStartBreaks', updatePomodoroSettingsDto.autoStartBreaks, defaultSettings.autoStartBreaks),
      autoStartPomodoros: getValue('autoStartPomodoros', updatePomodoroSettingsDto.autoStartPomodoros, defaultSettings.autoStartPomodoros),
      soundEnabled: getValue('soundEnabled', updatePomodoroSettingsDto.soundEnabled, defaultSettings.soundEnabled),
      notificationsEnabled: getValue('notificationsEnabled', updatePomodoroSettingsDto.notificationsEnabled, defaultSettings.notificationsEnabled)
    };

    // Asignar la nueva configuración
    user.preferences.pomodoroSettings = newSettings;
    await user.save();

    return newSettings;
  }

  async getStatistics(userId: string, days: number = 7) {
    // Sesiones totales completadas
    const totalSessions = await this.pomodoroSessionModel.countDocuments({
      userId,
      completed: true
    });


    const totalMinutesResult = await this.pomodoroSessionModel.aggregate([
      { $match: { userId, completed: true } },
      { $group: { _id: null, duration: { $sum: '$duration' } } }
    ]);

    const totalMinutes = totalMinutesResult.length > 0 
      ? Math.floor(totalMinutesResult[0].duration / 60) 
      : 0;

   
    const startDate = moment().subtract(days, 'days').startOf('day').toDate();
    

    const sessionsByDayData = await this.pomodoroSessionModel.aggregate([
      { 
        $match: { 
          userId,
          completed: true,
          startTime: { $gte: startDate }
        } 
      },
      {
        $group: {
          _id: {
            year: { $year: '$startTime' },
            month: { $month: '$startTime' },
            day: { $dayOfMonth: '$startTime' }
          },
          count: { $sum: 1 },
          duration: { $sum: '$duration' }
        }
      },
      {
        $sort: { 
          '_id.year': 1,
          '_id.month': 1,
          '_id.day': 1
        }
      }
    ]);

    const sessionsByDay: Array<{ date: string; count: number; duration: number }> = [];
    
    for (let i = 0; i < days; i++) {
      const date = moment().subtract(days - i - 1, 'days').format('YYYY-MM-DD');
      const dayData = sessionsByDayData.find(d => 
        moment(`${d._id.year}-${d._id.month}-${d._id.day}`, 'YYYY-M-D').format('YYYY-MM-DD') === date
      );
      
      sessionsByDay.push({
        date,
        count: dayData ? dayData.count : 0,
        duration: dayData ? Math.floor(dayData.duration / 60) : 0 // Convert to minutes
      });
    }


    const sessionsByType = await this.pomodoroSessionModel.aggregate([
      { 
        $match: { 
          userId,
          completed: true
        } 
      },
      {
        $group: {
          _id: '$mode',
          count: { $sum: 1 },
          duration: { $sum: '$duration' }
        }
      }
    ]);

    const formattedSessionsByType = sessionsByType.map(type => ({
      type: type._id,
      count: type.count,
      duration: Math.floor(type.duration / 60) // Convert to minutes
    }));

    return {
      totalSessions,
      totalMinutes,
      sessionsByDay,
      sessionsByType: formattedSessionsByType
    };
  }
}