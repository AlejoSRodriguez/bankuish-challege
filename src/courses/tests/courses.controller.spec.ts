import { Test, TestingModule } from "@nestjs/testing";
import { CoursesController } from "../courses.controller";
import { CoursesService } from "../courses.service";
import { AuthGuard } from "../../auth/guards/auth.guard";

describe("CoursesController", () => {
    let controller: CoursesController;
    let service: CoursesService;

    const mockCoursesService = {
        sortCourses: jest.fn(),
        createCourses: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [CoursesController],
            providers: [
                {
                    provide: CoursesService,
                    useValue: mockCoursesService,
                },
            ],
        })
            .overrideGuard(AuthGuard)
            .useValue({ canActivate: jest.fn(() => true) })
            .compile();

        controller = module.get<CoursesController>(CoursesController);
        service = module.get<CoursesService>(CoursesService);
    });

    it("should be defined", () => {
        expect(controller).toBeDefined();
    });

    describe("createSchedule", () => {
        it("should call sortCourses from the service and return the sorted list", () => {
            const mockCourses = [
                { desiredCourse: "A", requiredCourse: "B" },
                { desiredCourse: "B", requiredCourse: "C" },
            ];
            const sortedCourses = ["C", "B", "A"];

            mockCoursesService.sortCourses.mockReturnValue(sortedCourses);

            const result = controller.createSchedule({
                userId: "test-user-id",
                courses: mockCourses,
            });

            expect(service.sortCourses).toHaveBeenCalledWith(mockCourses);
            expect(result).toEqual(
                sortedCourses.map((course, index) => ({
                    course,
                    order: index,
                }))
            );
        });
    });

    describe("createCourses", () => {
        it("should call createCourses from the service and return the created courses", async () => {
            const mockPayload = {
                courses: [
                    { desiredCourse: "A", requiredCourse: "B" },
                    { desiredCourse: "B", requiredCourse: "C" },
                ],
            };
            const createdCourses = [
                { id: "1", name: "A" },
                { id: "2", name: "B" },
            ];

            mockCoursesService.createCourses.mockResolvedValue(createdCourses);

            const result = await controller.createCourses(mockPayload);

            expect(service.createCourses).toHaveBeenCalledWith(
                mockPayload.courses
            );
            expect(result).toEqual({
                message: "Courses created successfully",
                data: createdCourses,
            });
        });
    });
});
