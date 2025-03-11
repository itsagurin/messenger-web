import { Controller, Post, Body, Get, UseGuards, Delete, Param, Req } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersGateway } from '../websocket/wsgateway';
import { JwtService } from '@nestjs/jwt';
import { AuthGuard } from '@nestjs/passport';

@Controller('auth')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly usersGateway: UsersGateway,
    private readonly jwtService: JwtService,
  ) {}

  private generateTokens(userId: number, email: string) {
    const accessPayload = { sub: userId, email, type: 'access' };
    const refreshPayload = { sub: userId, email, type: 'refresh' };

    const accessToken = this.jwtService.sign(accessPayload, { expiresIn: '15m' });
    const refreshToken = this.jwtService.sign(refreshPayload, { expiresIn: '7d' });

    return { accessToken, refreshToken };
  }

  @Post('register')
  async register(@Body() body: { email: string; password: string }) {
    const result = await this.usersService.register(body.email, body.password);

    if (result.success) {
      const tokens = this.generateTokens(result.data.userId, result.data.email);
      await this.usersService.updateRefreshToken(result.data.userId, tokens.refreshToken);
      await this.usersGateway.handleUserAuth(result.data.email);

      return {
        ...result,
        ...tokens
      };
    }

    return result;
  }

  @Post('login')
  async login(@Body() body: { email: string; password: string }) {
    const result = await this.usersService.login(body.email, body.password);

    if (result.success) {
      const tokens = this.generateTokens(result.data.userId, result.data.email);
      await this.usersService.updateRefreshToken(result.data.userId, tokens.refreshToken);
      await this.usersGateway.handleUserAuth(result.data.email);

      return {
        ...result,
        ...tokens
      };
    }

    return result;
  }

  @Post('refresh')
  async refresh(@Body() body: { refreshToken: string }) {
    try {
      const decoded = this.jwtService.verify(body.refreshToken);
      const result = await this.usersService.refreshToken(body.refreshToken);

      if (result.success && result.userId === decoded.sub) {
        const tokens = this.generateTokens(result.userId, result.email);
        await this.usersService.updateRefreshToken(result.userId, tokens.refreshToken);

        return {
          success: true,
          ...tokens
        };
      }

      return {
        success: false,
        message: 'Invalid refresh token'
      };
    } catch (error) {
      return {
        success: false,
        message: 'Invalid refresh token'
      };
    }
  }

  @Get('users')
  @UseGuards(AuthGuard('jwt'))
  async getAllUsers() {
    return this.usersService.findAll();
  }

  @Delete('delete-account')
  @UseGuards(AuthGuard('jwt'))
  async deleteCurrentUser(@Req() req: any) {
    const currentUserId = req.user.userId;
    return this.usersService.deleteCurrentUser(currentUserId);
  }

  @Delete('users/all')
  @UseGuards(AuthGuard('jwt'))
  async deleteAllUsers() {
    return this.usersService.deleteAllUsers();
  }
}