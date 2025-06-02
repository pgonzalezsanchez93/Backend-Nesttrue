import { IsDateString, IsString, IsOptional, MinLength, IsBoolean } from 'class-validator';

export class CreateGlobalEventDto {
  @IsString()
  @MinLength(3)
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsDateString()
  startDate: string;

  @IsDateString()
  endDate: string;
  
  @IsString()
  @IsOptional()
  startTime?: string;

  @IsString()
  @IsOptional()
  endTime?: string;
  
  @IsBoolean()
  @IsOptional()
  allDay?: boolean;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}