import {
    BadRequestException,
    Body,
    Controller,
    Get,
    Post,
    Query,
    UseGuards,
} from "@nestjs/common";
import { UserCoursesService } from "./user-courses.service";
import { AuthGuard } from "../auth/guards/auth.guard";
import {
    ApiOperation,
    ApiResponse,
    ApiBody,
    ApiTags,
    ApiBearerAuth,
    ApiQuery,
} from "@nestjs/swagger";

@ApiTags("User Courses")
@ApiBearerAuth()
@Controller("user-courses")
export class UserCoursesController {
    constructor(private readonly userCoursesService: UserCoursesService) {}

    @Post("start")
    @UseGuards(AuthGuard)
    @ApiOperation({ summary: "Start a course for a user" })
    @ApiBody({
        schema: {
            example: {
                userId: "123e4567-e89b-12d3-a456-426614174000",
                courseId: "456e7890-a12b-34c5-d678-123456789012",
            },
        },
    })
    @ApiResponse({
        status: 200,
        description: "Course started successfully",
        schema: {
            example: {
                message: "Course started successfully",
                course: {
                    id: "456e7890-a12b-34c5-d678-123456789012",
                    user: { id: "123e4567-e89b-12d3-a456-426614174000" },
                    isCompleted: false,
                    startedAt: "2024-12-08T20:00:00.000Z",
                    completedAt: null,
                },
            },
        },
    })
    @ApiResponse({
        status: 400,
        description: "Invalid input or missing prerequisites",
    })
    async startCourse(
        @Body() { userId, courseId }: { userId: string; courseId: string }
    ) {
        const course = await this.userCoursesService.startCourse(
            userId,
            courseId
        );
        return {
            message: "Course started successfully",
            course,
        };
    }

    @Post("complete")
    @UseGuards(AuthGuard)
    @ApiOperation({ summary: "Complete a course for a user" })
    @ApiBody({
        schema: {
            example: {
                userId: "123e4567-e89b-12d3-a456-426614174000",
                courseId: "456e7890-a12b-34c5-d678-123456789012",
            },
        },
    })
    @ApiResponse({
        status: 200,
        description: "Course completed successfully",
        schema: {
            example: {
                message: "Course completed successfully",
                course: {
                    id: "456e7890-a12b-34c5-d678-123456789012",
                    user: { id: "123e4567-e89b-12d3-a456-426614174000" },
                    isCompleted: true,
                    startedAt: "2024-12-08T20:00:00.000Z",
                    completedAt: "2024-12-09T20:00:00.000Z",
                },
            },
        },
    })
    @ApiResponse({
        status: 400,
        description: "No active course found to complete",
    })
    async completeCourse(
        @Body() { userId, courseId }: { userId: string; courseId: string }
    ) {
        const course = await this.userCoursesService.completeCourse(
            userId,
            courseId
        );
        return {
            message: "Course completed successfully",
            course,
        };
    }

    @Get("unlockable")
    @ApiOperation({ summary: "Get unlockable courses for a user" })
    @ApiQuery({
        name: "userId",
        type: String,
        description: "The ID of the user to retrieve unlockable courses for",
        example: "123e4567-e89b-12d3-a456-426614174000",
    })
    @ApiResponse({
        status: 200,
        description: "Unlockable courses retrieved successfully",
        schema: {
            example: {
                message: "Unlockable courses retrieved successfully",
                courses: [
                    {
                        id: "456e7890-a12b-34c5-d678-123456789012",
                        name: "Finance",
                    },
                    {
                        id: "789a1234-b56c-78d9-012e-345678901234",
                        name: "Investment",
                    },
                ],
            },
        },
    })
    @ApiResponse({
        status: 400,
        description: "User ID is required",
    })
    async getUnlockableCourses(@Query("userId") userId: string) {
        if (!userId) {
            throw new BadRequestException("User ID is required");
        }

        const courses =
            await this.userCoursesService.getUnlockableCourses(userId);
        return courses;
    }
}
