import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { UserCoursesService } from './user-courses.service';
import { AuthGuard } from '../auth/guards/auth.guard';

@Controller('user-courses')
export class UserCoursesController {
  constructor(private readonly userCoursesService: UserCoursesService) {}

  @UseGuards(AuthGuard)
  @Post('start')
  async startCourse(
    @Body() { userId, courseId }: { userId: string; courseId: string },
  ) {
    const course = await this.userCoursesService.startCourse(userId, courseId);
    return {
      message: 'Course started successfully',
      course,
    };
  }

  @Post('complete')
  async completeCourse(
    @Body() { userId, courseId }: { userId: string; courseId: string },
  ) {
    const course = await this.userCoursesService.completeCourse(
      userId,
      courseId,
    );
    return {
      message: 'Course completed successfully',
      course,
    };
  }

  @Get('unlockable')
  async getUnlockableCourses(@Body() { userId }: { userId: string }) {
    const courses = await this.userCoursesService.getUnlockableCourses(userId);
    return courses;
  }
}
