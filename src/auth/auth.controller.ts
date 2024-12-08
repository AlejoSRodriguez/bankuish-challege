import {
    Controller,
    Post,
    Body,
    UseGuards,
    Req,
    Get,
    UseFilters,
} from "@nestjs/common";
import { AuthService } from "./auth.service";
import { AuthGuard } from "./guards/auth.guard";
import { RegisterDto } from "./dtos/register.dto";
import { HttpExceptionFilter } from "src/http-exception/http-exception.filter";
import {
    ApiTags,
    ApiOperation,
    ApiResponse,
    ApiBody,
    ApiBearerAuth,
} from "@nestjs/swagger";

@ApiTags("Authentication")
@Controller("auth")
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @Post("signup")
    @ApiOperation({ summary: "Register a new user" })
    @ApiBody({
        description: "User registration details",
        schema: {
            example: {
                email: "user@example.com",
                password: "strongpassword",
                name: "John Doe",
            },
        },
    })
    @ApiResponse({
        status: 201,
        description: "User registered successfully",
        schema: {
            example: {
                id: "123e4567-e89b-12d3-a456-426614174000",
                email: "user@example.com",
                name: "John Doe",
                createdAt: "2024-12-08T20:00:00.000Z",
            },
        },
    })
    @ApiResponse({
        status: 400,
        description: "Invalid registration details",
    })
    @UseFilters(HttpExceptionFilter)
    async register(@Body() registerDto: RegisterDto) {
        return this.authService.register(
            registerDto.email,
            registerDto.password,
            registerDto.name
        );
    }

    @Post("login")
    @ApiOperation({ summary: "Log in a user" })
    @ApiBody({
        description: "User login credentials",
        schema: {
            example: {
                email: "user@example.com",
                password: "strongpassword",
            },
        },
    })
    @ApiResponse({
        status: 200,
        description: "User logged in successfully",
        schema: {
            example: {
                firebaseData: {
                    idToken: "eyJhbGciOiJSUzI1NiIsImtpZCI6IjM...",
                    refreshToken: "AE6uC-m...",
                    expiresIn: "3600",
                    localId: "firebaseLocalId",
                    email: "user@example.com",
                },
                localUser: {
                    id: "123e4567-e89b-12d3-a456-426614174000",
                    email: "user@example.com",
                    name: "John Doe",
                },
            },
        },
    })
    @ApiResponse({
        status: 400,
        description: "Invalid login credentials",
    })
    async login(
        @Body() { email, password }: { email: string; password: string }
    ) {
        return this.authService.login(email, password);
    }

    @UseGuards(AuthGuard)
    @Get("profile")
    @ApiOperation({ summary: "Get user's profile" })
    @ApiBearerAuth()
    @ApiResponse({
        status: 200,
        description: "User profile retrieved successfully",
        schema: {
            example: {
                user: {
                    id: "123e4567-e89b-12d3-a456-426614174000",
                    email: "user@example.com",
                    name: "John Doe",
                    createdAt: "2024-12-08T20:00:00.000Z",
                },
            },
        },
    })
    @ApiResponse({
        status: 401,
        description: "Unauthorized",
    })
    getProfile(@Req() req: any) {
        return { user: req.user };
    }
}
