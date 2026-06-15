import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { OAuth2Client } from 'google-auth-library';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../users/users.service';
import { User } from '../users/entities/user.entity';
import { JwtPayload } from './strategies/jwt.strategy';

@Injectable()
export class AuthService {
  private readonly googleClient: OAuth2Client;

  constructor(
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
    private readonly config: ConfigService,
  ) {
    this.googleClient = new OAuth2Client(
      config.get<string>('GOOGLE_CLIENT_ID'),
    );
  }

  /** Verify a Google ID-token credential, find/create user, return our JWT */
  async googleLogin(credential: string): Promise<{ token: string; user: Partial<User> }> {
    const clientId = this.config.get<string>('GOOGLE_CLIENT_ID');

    let ticket;
    try {
      ticket = await this.googleClient.verifyIdToken({
        idToken: credential,
        audience: clientId,
      });
    } catch {
      throw new UnauthorizedException('Invalid Google credential');
    }

    const payload = ticket.getPayload();
    if (!payload || !payload.sub) {
      throw new UnauthorizedException('Could not extract Google profile');
    }

    const user = await this.usersService.findOrCreateByGoogle({
      googleId: payload.sub,
      email:    payload.email   ?? '',
      name:     payload.name    ?? payload.email ?? '',
      avatar:   payload.picture ?? '',
    });

    const jwtPayload: JwtPayload = { sub: user.id, email: user.email };
    const token = this.jwtService.sign(jwtPayload);

    // Return safe user object (no sensitive fields)
    const { id, name, email, avatar, isAdmin, createdAt } = user;
    return { token, user: { id, name, email, avatar, isAdmin, createdAt } };
  }

  /** Verify our own JWT and return user */
  async me(userId: string): Promise<Partial<User>> {
    const user = await this.usersService.findOne(userId);
    if (!user) throw new UnauthorizedException();
    const { id, name, email, avatar, isAdmin, createdAt } = user;
    return { id, name, email, avatar, isAdmin, createdAt };
  }
}
