import { Controller, Post, Body, Get, HttpCode, UseGuards } from '@nestjs/common';
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

  @Post('register')
  @UseGuards(AuthGuard('jwt'))
  async register(@Body() body: { email: string; password: string }) {
    console.log('Incoming data:', body);
    try {
      console.log('Registration:', body.email);

      const user = await this.usersService.register(body.email, body.password);

      // Генерация токена
      const payload = { sub: user.userId, email: body.email };
      const token = this.jwtService.sign(payload);

      await this.usersGateway.updateUsers();

      return {
        success: true,
        data: user,
        accessToken: token, // Возвращаем токен
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
  @UseGuards(AuthGuard('jwt'))
  async login(@Body() body: { email: string; password: string }) {
    console.log('Incoming data:', body);
    try {
      console.log('Login:', body.email);

      const user = await this.usersService.login(body.email, body.password);

      // Генерация токена
      const payload = { sub: user.userId, email: body.email };
      const token = this.jwtService.sign(payload);

      return {
        success: true,
        data: user,
        accessToken: token, // Возвращаем токен
      };
    } catch (error) {
      console.error('Login Error:', error);
      return {
        success: false,
        message: error.message,
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
}