import { Test, TestingModule } from "@nestjs/testing";
import { UserCoursesService } from "../user-courses.service";
import { Repository } from "typeorm";
import { getRepositoryToken } from "@nestjs/typeorm";
import { UserCourse } from "../entities/user-course.entity";
import { CourseDependency } from "../../courses/entities/course-dependency.entity";
import { Course } from "../../courses/entities/course.entity";
import { BadRequestException, NotFoundException } from "@nestjs/common";

describe("UserCoursesService", () => {
    let service: UserCoursesService;
    let userCourseRepository: Repository<UserCourse>;
    let courseDependencyRepository: Repository<CourseDependency>;
    let courseRepository: Repository<Course>;

    const mockUserCourseRepository = {
        find: jest.fn(),
        findOne: jest.fn(),
        create: jest.fn(),
        save: jest.fn(),
    };

    const mockCourseDependencyRepository = {
        find: jest.fn(),
    };

    const mockCourseRepository = {
        createQueryBuilder: jest.fn().mockReturnValue({
            leftJoin: jest.fn().mockReturnThis(),
            innerJoin: jest.fn().mockReturnThis(),
            where: jest.fn().mockReturnThis(),
            andWhere: jest.fn().mockReturnThis(),
            getMany: jest.fn(),
        }),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                UserCoursesService,
                {
                    provide: getRepositoryToken(UserCourse),
                    useValue: mockUserCourseRepository,
                },
                {
                    provide: getRepositoryToken(CourseDependency),
                    useValue: mockCourseDependencyRepository,
                },
                {
                    provide: getRepositoryToken(Course),
                    useValue: mockCourseRepository,
                },
            ],
        }).compile();

        service = module.get<UserCoursesService>(UserCoursesService);
        userCourseRepository = module.get<Repository<UserCourse>>(
            getRepositoryToken(UserCourse)
        );
        courseDependencyRepository = module.get<Repository<CourseDependency>>(
            getRepositoryToken(CourseDependency)
        );
        courseRepository = module.get<Repository<Course>>(
            getRepositoryToken(Course)
        );
    });

    it("should be defined", () => {
        expect(service).toBeDefined();
    });

    describe("startCourse", () => {
        it("should throw an error if the user has an active course", async () => {
            mockUserCourseRepository.findOne.mockResolvedValue({
                isCompleted: false,
            });

            await expect(
                service.startCourse("user-id", "course-id")
            ).rejects.toThrow(BadRequestException);

            expect(mockUserCourseRepository.findOne).toHaveBeenCalledWith({
                where: { user: { id: "user-id" }, isCompleted: false },
            });
        });

        it("should create and save a new course for the user", async () => {
            mockUserCourseRepository.findOne.mockResolvedValue(null);
            mockCourseDependencyRepository.find.mockResolvedValue([]);
            mockUserCourseRepository.create.mockReturnValue({
                user: { id: "user-id" },
                course: { id: "course-id" },
                isCompleted: false,
            });
            mockUserCourseRepository.save.mockResolvedValue({
                id: "user-course-id",
            });

            const result = await service.startCourse("user-id", "course-id");
            expect(result).toEqual({ id: "user-course-id" });
            expect(mockUserCourseRepository.save).toHaveBeenCalled();
        });
    });

    describe("completeCourse", () => {
        it("should throw an error if no active course is found", async () => {
            mockUserCourseRepository.findOne.mockResolvedValue(null);

            await expect(
                service.completeCourse("user-id", "course-id")
            ).rejects.toThrow(NotFoundException);
        });

        it("should mark a course as completed", async () => {
            const userCourse = { id: "user-course-id", isCompleted: false };
            mockUserCourseRepository.findOne.mockResolvedValue(userCourse);
            mockUserCourseRepository.save.mockResolvedValue({
                ...userCourse,
                isCompleted: true,
                completedAt: new Date(),
            });

            const result = await service.completeCourse("user-id", "course-id");
            expect(result.isCompleted).toBe(true);
            expect(mockUserCourseRepository.save).toHaveBeenCalledWith({
                ...userCourse,
                isCompleted: true,
                completedAt: expect.any(Date),
            });
        });
    });

    describe("getUnlockableCourses", () => {
        it("should throw an error if userId is not provided", async () => {
            await expect(service.getUnlockableCourses(null)).rejects.toThrow(
                BadRequestException
            );
        });

        it("should return courses without prerequisites if no courses are completed", async () => {
            mockUserCourseRepository.find.mockResolvedValue([]);
            mockCourseRepository
                .createQueryBuilder()
                .getMany.mockResolvedValue([
                    { id: "course1", name: "Course 1" },
                    { id: "course2", name: "Course 2" },
                ]);

            const result = await service.getUnlockableCourses("user-id");
            expect(result.courses).toHaveLength(2);
            expect(result.courses[0].name).toBe("Course 1");
        });

        it("should return unlockable courses based on completed prerequisites", async () => {
            mockUserCourseRepository.find.mockResolvedValue([
                { course: { id: "completed-course" } },
            ]);
            mockCourseRepository
                .createQueryBuilder()
                .getMany.mockResolvedValue([
                    { id: "unlockable-course", name: "Unlockable Course" },
                ]);

            const result = await service.getUnlockableCourses("user-id");
            expect(result.courses).toHaveLength(1);
            expect(result.courses[0].name).toBe("Unlockable Course");
        });
    });
});
