import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { AuthGuard } from '../src/auth/guards/auth.guard';

describe('Courses E2E', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideGuard(AuthGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('/POST courses/schedule (should return sorted courses)', () => {
    return request(app.getHttpServer())
      .post('/courses/schedule')
      .send({
        userId: '30ecc27b-9df7-4dd3-b52f-d001e79bd035',
        courses: [
          {
            desiredCourse: 'PortfolioConstruction',
            requiredCourse: 'PortfolioTheories',
          },
          {
            desiredCourse: 'InvestmentManagement',
            requiredCourse: 'Investment',
          },
          {
            desiredCourse: 'Investment',
            requiredCourse: 'Finance',
          },
          {
            desiredCourse: 'PortfolioTheories',
            requiredCourse: 'Investment',
          },
          {
            desiredCourse: 'InvestmentStyle',
            requiredCourse: 'InvestmentManagement',
          },
        ],
      })
      .expect(201)
      .expect([
        { course: 'Finance', order: 0 },
        { course: 'Investment', order: 1 },
        { course: 'InvestmentManagement', order: 2 },
        { course: 'PortfolioTheories', order: 3 },
        { course: 'InvestmentStyle', order: 4 },
        { course: 'PortfolioConstruction', order: 5 },
      ]);
  });
});
