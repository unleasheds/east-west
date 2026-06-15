import { Body, Controller, Get, Post, Request, UseGuards } from '@nestjs/common';
import { IsString } from 'class-validator';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

class GoogleTokenDto {
  @IsString()
  credential: string;
}

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * POST /api/auth/google/token
   * Receives a Google ID-token credential from @react-oauth/google,
   * verifies it, and returns our own JWT + user profile.
   */
  @Post('google/token')
  googleToken(@Body() dto: GoogleTokenDto) {
    return this.authService.googleLogin(dto.credential);
  }

  /**
   * GET /api/auth/me
   * Returns the currently authenticated user (requires Bearer JWT).
   */
  @UseGuards(JwtAuthGuard)
  @Get('me')
  me(@Request() req: { user: { id: string } }) {
    return this.authService.me(req.user.id);
  }
}
