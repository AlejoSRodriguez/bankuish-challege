import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { CoursesModule } from "./courses/courses.module";
import { UsersModule } from "./users/users.module";
import { UserCoursesModule } from "./user-courses/user-courses.module";
import { AuthModule } from "./auth/auth.module";
import { User } from "./users/entities/user.entity";
import { UserCourse } from "./user-courses/entities/user-course.entity";
import { Course } from "./courses/entities/course.entity";
import { CourseDependency } from "./courses/entities/course-dependency.entity";

@Module({
    imports: [
        ConfigModule.forRoot({
            envFilePath: `.env.${process.env.NODE_ENV}`,
            isGlobal: true,
        }),
        TypeOrmModule.forRootAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (config: ConfigService) => ({
                type: "postgres",
                host: config.get("DATABASE_HOST"),
                port: config.get("DATABASE_PORT"),
                username: config.get("DATABASE_USERNAME"),
                password: config.get("DATABASE_PASSWORD"),
                database: config.get("DATABASE_NAME"),
                entities: [User, UserCourse, Course, CourseDependency],
                synchronize: true,
            }),
        }),
        CoursesModule,
        UsersModule,
        UserCoursesModule,
        AuthModule,
    ],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule {}
