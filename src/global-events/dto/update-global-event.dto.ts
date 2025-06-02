import { IsDateString, IsString, IsOptional, MinLength, IsBoolean } from 'class-validator';

export class UpdateGlobalEventDto {
  @IsString()
  @MinLength(3)
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsDateString()
  @IsOptional()
  startDate?: string;

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

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}