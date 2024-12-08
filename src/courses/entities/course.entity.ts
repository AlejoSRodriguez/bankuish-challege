import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { CourseDependency } from './course-dependency.entity';
import { UserCourse } from '../../user-courses/entities/user-course.entity';

@Entity('courses')
export class Course {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  name: string;

  @OneToMany(() => CourseDependency, (dependency) => dependency.desiredCourse)
  dependencies: CourseDependency[];

  @OneToMany(() => UserCourse, (userCourse) => userCourse.course)
  userCourses: UserCourse[];
}
