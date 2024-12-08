import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { CoursesService } from './courses.service';
import { CreateCourseScheduleDto } from './dtos/create-course-schedule.dto';
import { AuthGuard } from '../auth/guards/auth.guard';
import { ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';

@Controller('courses')
@ApiBearerAuth()
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) {}

  @Post('sort')
  // @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Sort courses by their dependencies' })
  @ApiResponse({
    status: 201,
    description: 'Returns the sorted list of courses',
    schema: {
      example: {
        sortedCourses: [
          'Finance',
          'Investment',
          'InvestmentManagement',
          'PortfolioTheories',
          'InvestmentStyle',
          'PortfolioConstruction',
        ],
      },
    },
  })
  @ApiResponse({
    status: 400,
    description:
      'userId should not be empty, userId must be a string, courses must be an array',
  })
  createSchedule(@Body() createCourseScheduleDto: CreateCourseScheduleDto) {
    const { courses } = createCourseScheduleDto;
    const sortedCourses = this.coursesService.sortCourses(courses);

    return sortedCourses.map((course, index) => ({
      course,
      order: index,
    }));
  }

  @Post('create')
  @UseGuards(AuthGuard)
  async createCourses(
    @Body()
    payload: {
      courses: { desiredCourse: string; requiredCourse: string }[];
    },
  ) {
    const createdCourses = await this.coursesService.createCourses(
      payload.courses,
    );
    return {
      message: 'Courses created successfully',
      data: createdCourses,
    };
  }
}
