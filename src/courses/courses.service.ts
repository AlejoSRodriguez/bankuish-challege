import { BadRequestException, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Course } from "./entities/course.entity";
import { CourseDependency } from "./entities/course-dependency.entity";

@Injectable()
export class CoursesService {
    constructor(
        @InjectRepository(Course)
        private readonly courseRepository: Repository<Course>,
        @InjectRepository(CourseDependency)
        private readonly courseDependencyRepository: Repository<CourseDependency>
    ) {}

    sortCourses(
        courses: { desiredCourse: string; requiredCourse: string }[]
    ): string[] {
        const graph = new Map<string, string[]>();
        const inDegree = new Map<string, number>();

        courses.forEach(({ desiredCourse, requiredCourse }) => {
            if (!graph.has(requiredCourse)) graph.set(requiredCourse, []);
            if (!graph.has(desiredCourse)) graph.set(desiredCourse, []);
            graph.get(requiredCourse).push(desiredCourse);

            inDegree.set(desiredCourse, (inDegree.get(desiredCourse) || 0) + 1);
            inDegree.set(requiredCourse, inDegree.get(requiredCourse) || 0);
        });

        const queue = Array.from(inDegree.entries())
            .filter(([_, degree]) => degree === 0)
            .map(([course]) => course);

        const sorted = [];
        while (queue.length > 0) {
            const course = queue.shift();
            sorted.push(course);

            (graph.get(course) || []).forEach((nextCourse) => {
                inDegree.set(nextCourse, inDegree.get(nextCourse) - 1);
                if (inDegree.get(nextCourse) === 0) queue.push(nextCourse);
            });
        }

        if (sorted.length !== graph.size) {
            throw new BadRequestException(
                "Cyclic dependency detected in courses"
            );
        }

        return sorted;
    }

    async createCourses(
        courses: { desiredCourse: string; requiredCourse: string }[]
    ): Promise<{ id: string; name: string }[]> {
        this.sortCourses(courses);

        const createdCourses: { id: string; name: string }[] = [];

        for (const { desiredCourse, requiredCourse } of courses) {
            let required = await this.courseRepository.findOneBy({
                name: requiredCourse,
            });
            if (!required) {
                required = await this.courseRepository.save(
                    this.courseRepository.create({ name: requiredCourse })
                );
            }

            let desired = await this.courseRepository.findOneBy({
                name: desiredCourse,
            });
            if (!desired) {
                desired = await this.courseRepository.save(
                    this.courseRepository.create({ name: desiredCourse })
                );
            }

            const dependencyExists =
                await this.courseDependencyRepository.findOne({
                    where: { desiredCourse: desired, requiredCourse: required },
                });
            if (!dependencyExists) {
                const dependency = this.courseDependencyRepository.create({
                    desiredCourse: desired,
                    requiredCourse: required,
                });
                await this.courseDependencyRepository.save(dependency);
            }

            createdCourses.push({ id: desired.id, name: desired.name });
        }

        return createdCourses;
    }
}
