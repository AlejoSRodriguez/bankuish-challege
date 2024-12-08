import { Body, Controller, Post, UseGuards } from "@nestjs/common";
import { CoursesService } from "./courses.service";
import { CreateCourseScheduleDto } from "./dtos/create-course-schedule.dto";
import { AuthGuard } from "../auth/guards/auth.guard";
import {
    ApiBearerAuth,
    ApiOperation,
    ApiResponse,
    ApiTags,
    ApiBody,
} from "@nestjs/swagger";

@ApiTags("Courses")
@Controller("courses")
export class CoursesController {
    constructor(private readonly coursesService: CoursesService) {}

    @Post("sort")
    @ApiOperation({ summary: "Sort courses by their dependencies" })
    @ApiBody({
        schema: {
            example: {
                courses: [
                    {
                        desiredCourse: "InvestmentManagement",
                        requiredCourse: "Investment",
                    },
                    {
                        desiredCourse: "PortfolioConstruction",
                        requiredCourse: "PortfolioTheories",
                    },
                ],
            },
        },
    })
    @ApiResponse({
        status: 201,
        description: "Returns the sorted list of courses",
        schema: {
            example: [
                { course: "Finance", order: 0 },
                { course: "Investment", order: 1 },
                { course: "InvestmentManagement", order: 2 },
                { course: "PortfolioTheories", order: 3 },
                { course: "PortfolioConstruction", order: 4 },
            ],
        },
    })
    @ApiResponse({
        status: 400,
        description: "Invalid input or cyclic dependency detected",
        schema: {
            example: {
                statusCode: 400,
                message: "Cyclic dependency detected in courses",
            },
        },
    })
    createSchedule(@Body() createCourseScheduleDto: CreateCourseScheduleDto) {
        const { courses } = createCourseScheduleDto;
        const sortedCourses = this.coursesService.sortCourses(courses);

        return sortedCourses.map((course, index) => ({
            course,
            order: index,
        }));
    }

    @Post("create")
    @ApiBearerAuth()
    @UseGuards(AuthGuard)
    @ApiOperation({ summary: "Create courses and their dependencies" })
    @ApiBody({
        schema: {
            example: {
                courses: [
                    {
                        desiredCourse: "InvestmentManagement",
                        requiredCourse: "Investment",
                    },
                    {
                        desiredCourse: "PortfolioConstruction",
                        requiredCourse: "PortfolioTheories",
                    },
                ],
            },
        },
    })
    @ApiResponse({
        status: 201,
        description: "Courses created successfully",
        schema: {
            example: {
                message: "Courses created successfully",
                data: [
                    {
                        id: "123e4567-e89b-12d3-a456-426614174001",
                        name: "InvestmentManagement",
                    },
                    {
                        id: "123e4567-e89b-12d3-a456-426614174002",
                        name: "PortfolioConstruction",
                    },
                ],
            },
        },
    })
    @ApiResponse({
        status: 400,
        description: "Invalid input or cyclic dependency detected",
        schema: {
            example: {
                statusCode: 400,
                message: "Cyclic dependency detected in courses",
            },
        },
    })
    async createCourses(
        @Body()
        payload: {
            courses: { desiredCourse: string; requiredCourse: string }[];
        }
    ) {
        const createdCourses = await this.coursesService.createCourses(
            payload.courses
        );
        return {
            message: "Courses created successfully",
            data: createdCourses,
        };
    }
}
