import { Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Course } from './course.entity';

@Entity('course_dependencies')
export class CourseDependency {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Course, (course) => course.dependencies, { nullable: false })
  desiredCourse: Course;

  @ManyToOne(() => Course, { nullable: false })
  requiredCourse: Course;
}
