import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { UserCourse } from '../../user-courses/entities/user-course.entity';
import { Roles } from '../../auth/enums/roles.enum';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  firebaseUid: string;

  @Column({ unique: true })
  email: string;

  @Column()
  name: string;

  @Column({ nullable: false, unique: false, default: Roles.REGULAR })
  role: string;

  @OneToMany(() => UserCourse, (userCourse) => userCourse.user)
  userCourses: UserCourse[];
}
