import {
    Injectable,
    BadRequestException,
    NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { UserCourse } from "./entities/user-course.entity";
import { CourseDependency } from "../courses/entities/course-dependency.entity";
import { Course } from "../courses/entities/course.entity";

@Injectable()
export class UserCoursesService {
    constructor(
        @InjectRepository(UserCourse)
        private readonly userCourseRepository: Repository<UserCourse>,
        @InjectRepository(CourseDependency)
        private readonly courseDependencyRepository: Repository<CourseDependency>,
        @InjectRepository(Course)
        private readonly courseRepository: Repository<Course>
    ) {}

    async startCourse(userId: string, courseId: string): Promise<UserCourse> {
        const activeCourse = await this.userCourseRepository.findOne({
            where: { user: { id: userId }, isCompleted: false },
        });

        if (activeCourse) {
            throw new BadRequestException("You already have an active course.");
        }

        const dependencies = await this.courseDependencyRepository.find({
            where: { desiredCourse: { id: courseId } },
            relations: ["requiredCourse"],
        });

        if (dependencies.length > 0) {
            const completedDependencies = await Promise.all(
                dependencies.map(async (dependency) => {
                    const completed = await this.userCourseRepository.findOne({
                        where: {
                            user: { id: userId },
                            course: { id: dependency.requiredCourse.id },
                            isCompleted: true,
                        },
                    });
                    return completed !== null;
                })
            );

            if (completedDependencies.includes(false)) {
                throw new BadRequestException(
                    `You must complete all prerequisites to start this course.`
                );
            }
        }

        const userCourse = this.userCourseRepository.create({
            user: { id: userId },
            course: { id: courseId },
            isCompleted: false,
        });

        return this.userCourseRepository.save(userCourse);
    }

    async completeCourse(
        userId: string,
        courseId: string
    ): Promise<UserCourse> {
        const userCourse = await this.userCourseRepository.findOne({
            where: {
                user: { id: userId },
                course: { id: courseId },
                isCompleted: false,
            },
        });

        if (!userCourse) {
            throw new NotFoundException("No active course found to complete.");
        }

        userCourse.isCompleted = true;
        userCourse.completedAt = new Date();

        return this.userCourseRepository.save(userCourse);
    }

    async getUnlockableCourses(
        userId: string
    ): Promise<{ message: string; courses: { id: string; name: string }[] }> {
        if (!userId) {
            throw new BadRequestException("User ID is required.");
        }

        const completedCourses = await this.userCourseRepository.find({
            where: { user: { id: userId }, isCompleted: true },
            relations: ["course"],
        });

        const completedCourseIds = completedCourses.map((uc) => uc.course.id);

        if (completedCourseIds.length === 0) {
            const coursesWithoutPrerequisites = await this.courseRepository
                .createQueryBuilder("course")
                .leftJoin("course.dependencies", "dependency")
                .where("dependency.requiredCourse IS NULL")
                .getMany();

            return {
                message: "Unlockable courses retrieved successfully",
                courses: coursesWithoutPrerequisites.map((course) => ({
                    id: course.id,
                    name: course.name,
                })),
            };
        }

        const unlockableCourses = await this.courseRepository
            .createQueryBuilder("desiredCourse")
            .innerJoin("desiredCourse.dependencies", "dependency")
            .innerJoin("dependency.requiredCourse", "requiredCourse")
            .where("requiredCourse.id IN (:...completed)", {
                completed: completedCourseIds,
            })
            .andWhere("desiredCourse.id NOT IN (:...completed)", {
                completed: completedCourseIds,
            })
            .getMany();

        const allUnlockableCourses = unlockableCourses.map((course) => ({
            id: course.id,
            name: course.name,
        }));

        return {
            message: "Unlockable courses retrieved successfully",
            courses: Array.from(new Set(allUnlockableCourses)), 
        };
    }
}
