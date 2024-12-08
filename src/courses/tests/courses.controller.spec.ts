import { Test, TestingModule } from '@nestjs/testing';
import { CoursesController } from '../courses.controller';
import { CoursesService } from '../courses.service';
import { AuthGuard } from '../../auth/guards/auth.guard';

describe('CoursesController', () => {
  let controller: CoursesController;
  let service: CoursesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CoursesController],
      providers: [CoursesService],
    })
      .overrideGuard(AuthGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .compile();

    controller = module.get<CoursesController>(CoursesController);
    service = module.get<CoursesService>(CoursesService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should call sortCourses from the service', () => {
    const mockCourses = [
      { desiredCourse: 'A', requiredCourse: 'B' },
      { desiredCourse: 'B', requiredCourse: 'C' },
    ];
    const sortedCourses = ['C', 'B', 'A'];

    jest.spyOn(service, 'sortCourses').mockReturnValue(sortedCourses);

    const result = controller.createSchedule({
      userId: '1',
      courses: mockCourses,
    });

    expect(service.sortCourses).toHaveBeenCalledWith(mockCourses);
    expect(result).toEqual(
      sortedCourses.map((course, index) => ({
        course,
        order: index,
      })),
    );
  });
});
