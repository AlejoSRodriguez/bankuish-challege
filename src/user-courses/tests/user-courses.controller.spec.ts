import { Test, TestingModule } from "@nestjs/testing";
import { UserCoursesController } from "../user-courses.controller";
import { UserCoursesService } from "../user-courses.service";
import { BadRequestException } from "@nestjs/common";

describe("UserCoursesController", () => {
    let controller: UserCoursesController;
    let service: UserCoursesService;

    const mockUserCoursesService = {
        startCourse: jest.fn().mockResolvedValue({
            id: "456e7890-a12b-34c5-d678-123456789012",
            user: { id: "123e4567-e89b-12d3-a456-426614174000" },
            isCompleted: false,
            startedAt: "2024-12-08T20:00:00.000Z",
            completedAt: null,
        }),
        completeCourse: jest.fn().mockResolvedValue({
            id: "456e7890-a12b-34c5-d678-123456789012",
            user: { id: "123e4567-e89b-12d3-a456-426614174000" },
            isCompleted: true,
            startedAt: "2024-12-08T20:00:00.000Z",
            completedAt: "2024-12-09T20:00:00.000Z",
        }),
        getUnlockableCourses: jest.fn().mockResolvedValue({
            message: "Unlockable courses retrieved successfully",
            courses: [
                { id: "456e7890-a12b-34c5-d678-123456789012", name: "Finance" },
                {
                    id: "789a1234-b56c-78d9-012e-345678901234",
                    name: "Investment",
                },
            ],
        }),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [UserCoursesController],
            providers: [
                {
                    provide: UserCoursesService,
                    useValue: mockUserCoursesService,
                },
            ],
        }).compile();

        controller = module.get<UserCoursesController>(UserCoursesController);
        service = module.get<UserCoursesService>(UserCoursesService);
    });

    it("should be defined", () => {
        expect(controller).toBeDefined();
    });

    describe("startCourse", () => {
        it("should start a course for a user", async () => {
            const result = await controller.startCourse({
                userId: "123e4567-e89b-12d3-a456-426614174000",
                courseId: "456e7890-a12b-34c5-d678-123456789012",
            });
            expect(result).toEqual({
                message: "Course started successfully",
                course: {
                    id: "456e7890-a12b-34c5-d678-123456789012",
                    user: { id: "123e4567-e89b-12d3-a456-426614174000" },
                    isCompleted: false,
                    startedAt: "2024-12-08T20:00:00.000Z",
                    completedAt: null,
                },
            });
            expect(service.startCourse).toHaveBeenCalledWith(
                "123e4567-e89b-12d3-a456-426614174000",
                "456e7890-a12b-34c5-d678-123456789012"
            );
        });
    });

    describe("completeCourse", () => {
        it("should complete a course for a user", async () => {
            const result = await controller.completeCourse({
                userId: "123e4567-e89b-12d3-a456-426614174000",
                courseId: "456e7890-a12b-34c5-d678-123456789012",
            });
            expect(result).toEqual({
                message: "Course completed successfully",
                course: {
                    id: "456e7890-a12b-34c5-d678-123456789012",
                    user: { id: "123e4567-e89b-12d3-a456-426614174000" },
                    isCompleted: true,
                    startedAt: "2024-12-08T20:00:00.000Z",
                    completedAt: "2024-12-09T20:00:00.000Z",
                },
            });
            expect(service.completeCourse).toHaveBeenCalledWith(
                "123e4567-e89b-12d3-a456-426614174000",
                "456e7890-a12b-34c5-d678-123456789012"
            );
        });
    });

    describe("getUnlockableCourses", () => {
        it("should return unlockable courses for a user", async () => {
            const result = await controller.getUnlockableCourses(
                "123e4567-e89b-12d3-a456-426614174000"
            );
            expect(result).toEqual({
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
            });
            expect(service.getUnlockableCourses).toHaveBeenCalledWith(
                "123e4567-e89b-12d3-a456-426614174000"
            );
        });

        it("should throw BadRequestException if userId is not provided", async () => {
            await expect(controller.getUnlockableCourses(null)).rejects.toThrow(
                BadRequestException
            );
        });
    });
});
