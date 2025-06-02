import { IsBoolean, IsInt, IsNotEmpty, IsOptional, Max, Min } from 'class-validator';

export class UpdatePomodoroSettingsDto {
  @IsInt()
  @Min(1)
  @Max(120)
  @IsOptional()
  workDuration?: number;

  @IsInt()
  @Min(1)
  @Max(60)
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