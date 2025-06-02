import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { StatsService } from './stats.service';
import { AuthGuard } from '../auth/guards/auth/auth.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';

@Controller('stats')
@UseGuards(AuthGuard)
export class StatsController {

  constructor(private readonly statsService: StatsService) {}

  @Get('tasks')
  async getTaskStatistics(@GetUser('id') userId: string) {
    return this.statsService.getTaskStatistics(userId);
  }

  @Get('recent-tasks')
  async getRecentTasks(
    @GetUser('id') userId: string,
    @Query('limit') limit: number
  ) {
    return this.statsService.getRecentTasks(userId, limit || 5);
  }

  @Get('pomodoro')
  async getPomodoroStatistics(@GetUser('id') userId: string) {
    return this.statsService.getPomodoroStatistics(userId);
  }

  @Get('productivity')
  async getProductivityByDay(
    @GetUser('id') userId: string,
    @Query('days') days: number
  ) {
    return this.statsService.getProductivityByDay(userId, days || 7);
  }

  @Get('productive-hours')
  async getMostProductiveHours(
    @GetUser('id') userId: string,
    @Query('days') days: number
  ) {
    return this.statsService.getMostProductiveHours(userId, days || 30);
  }
}