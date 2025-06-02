import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query, Put } from '@nestjs/common';
import { PomodoroService } from './pomodoro.service';
import { CreatePomodoroSessionDto } from './dto/create-pomodoro-session.dto';
import { UpdatePomodoroSettingsDto } from './dto/update-pomodoro-settings.dto';
import { AuthGuard } from '../auth/guards/auth/auth.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';

@Controller('pomodoro')
@UseGuards(AuthGuard)
export class PomodoroController {
  constructor(private readonly pomodoroService: PomodoroService) {}

  @Post('sessions')
  createSession(
    @GetUser('id') userId: string,
    @Body() createPomodoroSessionDto: CreatePomodoroSessionDto
  ) {
    return this.pomodoroService.createSession(userId, createPomodoroSessionDto);
  }

  @Get('sessions')
  getSessions(
    @GetUser('id') userId: string,
    @Query('limit') limit: number,
    @Query('page') page: number
  ) {
    return this.pomodoroService.getSessions(userId, limit, page);
  }

  @Get('settings')
  getSettings(@GetUser('id') userId: string) {
    return this.pomodoroService.getSettings(userId);
  }

  @Put('settings')
  updateSettings(
    @GetUser('id') userId: string,
    @Body() updatePomodoroSettingsDto: UpdatePomodoroSettingsDto
  ) {
    return this.pomodoroService.updateSettings(userId, updatePomodoroSettingsDto);
  }

  @Get('statistics')
  getStatistics(
    @GetUser('id') userId: string,
    @Query('days') days: number
  ) {
    return this.pomodoroService.getStatistics(userId, days);
  }
}