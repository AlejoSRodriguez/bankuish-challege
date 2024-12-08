import { IsArray, IsNotEmpty, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class CourseDto {
  @IsString()
  @IsNotEmpty()
  desiredCourse: string;

  @IsString()
  @IsNotEmpty()
  requiredCourse: string;
}

export class CreateCourseScheduleDto {
  @IsString()
  @IsNotEmpty()
  userId: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CourseDto)
  courses: CourseDto[];
}
