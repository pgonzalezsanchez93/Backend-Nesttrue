import { IsBoolean, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export enum PomodoroMode {
  WORK = 'work',
  SHORT_BREAK = 'short',
  LONG_BREAK = 'long'
}

export class CreatePomodoroSessionDto {
  @IsNumber()
  @IsNotEmpty()
  duration: number;

  @IsEnum(PomodoroMode)
  @IsNotEmpty()
  mode: PomodoroMode;

  @IsBoolean()
  @IsOptional()
  completed?: boolean;

  @IsString()
  @IsOptional()
  taskId?: string;
}