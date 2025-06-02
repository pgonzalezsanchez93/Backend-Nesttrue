import { IsDateString, IsString, IsOptional, MinLength, IsEnum, IsBoolean } from 'class-validator';

export class CreateTaskDto {
  @IsString()
  @MinLength(3)
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsDateString()
  @IsOptional()
  startDate?: string;

  @IsDateString()
  @IsOptional()
  dueDate?: string;
  
  @IsDateString()
  @IsOptional()
  endDate?: string;

  @IsString()
  @IsOptional()
  startTime?: string;

  @IsString()
  @IsOptional()
  endTime?: string;
  
  @IsBoolean()
  @IsOptional()
  allDay?: boolean;

  @IsEnum(['low', 'medium', 'high'])
  @IsOptional()
  priority?: 'low' | 'medium' | 'high';

  @IsEnum(['pending', 'in_progress', 'completed'])
  @IsOptional()
  status?: 'pending' | 'in_progress' | 'completed';

  @IsString()
  @IsOptional()
  listId?: string;

  @IsBoolean()
  @IsOptional()
  isCompleted?: boolean;
}