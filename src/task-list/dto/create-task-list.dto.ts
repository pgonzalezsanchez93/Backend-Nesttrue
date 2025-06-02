import { IsBoolean, IsOptional, IsString, MinLength } from "class-validator";

export class CreateTaskListDto {
    @IsString()
    @MinLength(2)
    name: string;

    @IsString()
    @IsOptional()
    description?: string;

    @IsString()
    @IsOptional()
    color?: string;

    @IsString()
    @IsOptional()
    icon?: string;

    @IsBoolean()
    @IsOptional()
    isActive?: boolean;
}