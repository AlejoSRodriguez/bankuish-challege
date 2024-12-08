import { Module } from '@nestjs/common';
import { CoursesController } from './courses.controller';
import { CoursesService } from './courses.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Course } from './entities/course.entity';
import { CourseDependency } from './entities/course-dependency.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Course, CourseDependency])],
  controllers: [CoursesController],
  providers: [CoursesService],
  exports: [TypeOrmModule],
})
export class CoursesModule {}
