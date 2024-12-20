import { Controller, Post, Body, Get, UseGuards, Delete } from '@nestjs/common';
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
    try {
      const user = await this.usersService.register(body.email, body.password);
      const tokens = this.generateTokens(user.userId, user.email);

      // Сохраняем refresh token в базе
      await this.usersService.updateRefreshToken(user.userId, tokens.refreshToken);

      await this.usersGateway.updateUsers();

      return {
        success: true,
        data: user,
        ...tokens
      };
    } catch (error) {
      console.error('Registration Error:', error);
      return {
        success: false,
        message: error.message,
      };
    }
  }

  @Post('login')
  async login(@Body() body: { email: string; password: string }) {
    try {
      const user = await this.usersService.login(body.email, body.password);
      const tokens = this.generateTokens(user.userId, user.email);

      // Сохраняем refresh token в базе
      await this.usersService.updateRefreshToken(user.userId, tokens.refreshToken);

      return {
        success: true,
        data: user,
        ...tokens
      };
    } catch (error) {
      console.error('Login Error:', error);
      return {
        success: false,
        message: error.message,
      };
    }
  }

  @Post('refresh')
  async refresh(@Body() body: { refreshToken: string }) {
    try {
      // Верифицируем refresh token
      const decoded = this.jwtService.verify(body.refreshToken);
      const user = await this.usersService.findUserByRefreshToken(body.refreshToken);

      if (!user || user.id !== decoded.sub) {
        throw new Error('Invalid refresh token');
      }

      // Генерируем новые токены
      const tokens = this.generateTokens(user.id, user.email);

      // Обновляем refresh token в базе
      await this.usersService.updateRefreshToken(user.id, tokens.refreshToken);

      return {
        success: true,
        ...tokens
      };
    } catch (error) {
      console.error('Refresh Token Error:', error);
      return {
        success: false,
        message: 'Invalid refresh token',
      };
    }
  }

  @Get('users')
  @UseGuards(AuthGuard('jwt'))
  async getAllUsers() {
    try {
      return this.usersService.findAll();
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  }

  @Delete('users/all')
  @UseGuards(AuthGuard('jwt'))
  async deleteAllUsers() {
    try {
      await this.usersService.deleteAllUsers();
      return {
        success: true,
        message: 'All users have been deleted successfully'
      };
    } catch (error) {
      return {
        success: false,
        message: error.message
      };
    }
  }
}