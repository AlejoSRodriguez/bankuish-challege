import { Module } from '@nestjs/common';
import { UsersModule } from '../users/users.module';
import { CommonModule } from '../common/common.module';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { AuthGuard } from './guards/auth.guard';

@Module({
  imports: [UsersModule, CommonModule],
  providers: [AuthService, AuthGuard],
  controllers: [AuthController],
})
export class AuthModule {}
