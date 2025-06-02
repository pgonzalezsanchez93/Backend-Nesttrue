import { IsBoolean, IsInt, IsNumber, IsObject, IsOptional, IsString, Max, Min, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class PomodoroSettingsDto {
  @IsInt()
  @Min(1)
  @Max(60)
  @IsOptional()
  workDuration?: number;

  @IsInt()
  @Min(1)
  @Max(30)
  @IsOptional()
  shortBreakDuration?: number;

  @IsInt()
  @Min(1)
  @Max(120)
  @IsOptional()
  longBreakDuration?: number;

  @IsInt()
  @Min(1)
  @Max(10)
  @IsOptional()
  sessionsUntilLongBreak?: number;

  @IsBoolean()
  @IsOptional()
  autoStartBreaks?: boolean;

  @IsBoolean()
  @IsOptional()
  autoStartPomodoros?: boolean;

  @IsBoolean()
  @IsOptional()
  soundEnabled?: boolean;

  @IsBoolean()
  @IsOptional()
  notificationsEnabled?: boolean;
}

export class TaskStatsDto {
  @IsNumber()
  @Min(0)
  @IsOptional()
  completed?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  pending?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  lists?: number;
}

export class UpdateUserPreferencesDto {
  @IsString()
  @IsOptional()
  theme?: string;

  @IsBoolean()
  @IsOptional()
  emailNotifications?: boolean;

  @IsBoolean()
  @IsOptional()
  pushNotifications?: boolean;

  @IsString()
  @IsOptional()
  avatarColor?: string;

  @IsString()
  @IsOptional()
  bio?: string;

  @IsString()
  @IsOptional()
  location?: string;

  @IsString()
  @IsOptional()
  website?: string;

  @IsObject()
  @ValidateNested()
  @Type(() => PomodoroSettingsDto)
  @IsOptional()
  pomodoroSettings?: PomodoroSettingsDto;

  @IsObject()
  @ValidateNested()
  @Type(() => TaskStatsDto)
  @IsOptional()
  taskStats?: TaskStatsDto;
}