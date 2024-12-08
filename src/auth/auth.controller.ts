import {
  Controller,
  Post,
  Body,
  UseGuards,
  Req,
  Get,
  UseFilters,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from './guards/auth.guard';
import { RegisterDto } from './dtos/register.dto';
import { HttpExceptionFilter } from 'src/http-exception/http-exception.filter';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @UseFilters(HttpExceptionFilter)
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(
      registerDto.email,
      registerDto.password,
      registerDto.name,
    );
  }

  @UseGuards(AuthGuard)
  @Get('profile')
  getProfile(@Req() req: any) {
    return { user: req.user };
  }
}
