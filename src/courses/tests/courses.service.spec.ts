import { Test, TestingModule } from '@nestjs/testing';
import { CoursesService } from '../courses.service';

describe('CoursesService', () => {
  let service: CoursesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CoursesService],
    }).compile();

    service = module.get<CoursesService>(CoursesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should sort courses correctly', () => {
    const inputCourses = [
      {
        desiredCourse: 'PortfolioConstruction',
        requiredCourse: 'PortfolioTheories',
      },
      { desiredCourse: 'InvestmentManagement', requiredCourse: 'Investment' },
      { desiredCourse: 'Investment', requiredCourse: 'Finance' },
      { desiredCourse: 'PortfolioTheories', requiredCourse: 'Investment' },
      {
        desiredCourse: 'InvestmentStyle',
        requiredCourse: 'InvestmentManagement',
      },
    ];

    const result = service.sortCourses(inputCourses);

    expect(result).toEqual([
      'Finance',
      'Investment',
      'InvestmentManagement',
      'PortfolioTheories',
      'InvestmentStyle',
      'PortfolioConstruction',
    ]);
  });

  it('should throw an error for cyclic dependencies', () => {
    const cyclicCourses = [
      { desiredCourse: 'A', requiredCourse: 'B' },
      { desiredCourse: 'B', requiredCourse: 'C' },
      { desiredCourse: 'C', requiredCourse: 'A' },
    ];

    expect(() => service.sortCourses(cyclicCourses)).toThrow(
      'Cyclic dependency detected in courses',
    );
  });

  it('should handle empty course list', () => {
    const result = service.sortCourses([]);
    expect(result).toEqual([]);
  });
});
