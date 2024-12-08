import { Module } from '@nestjs/common';
import { UserCoursesController } from './user-courses.controller';
import { UserCoursesService } from './user-courses.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserCourse } from './entities/user-course.entity';
import { CoursesModule } from 'src/courses/courses.module';

@Module({
  imports: [TypeOrmModule.forFeature([UserCourse]), CoursesModule],
  controllers: [UserCoursesController],
  providers: [UserCoursesService],
  exports: [UserCoursesService],
})
export class UserCoursesModule {}
