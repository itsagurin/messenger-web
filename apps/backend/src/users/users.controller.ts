import {Controller, Post, Body, Get} from '@nestjs/common';
import { UsersService } from './users.service';

@Controller('auth')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('register')
  async register(@Body() body: { email: string; password: string }) {
    console.log('Incoming data:', body);
    try {
      console.log('Registration:', body.email);
      return {
        success: true,
        data: await this.usersService.register(body.email, body.password)
      };
    } catch (error) {
      console.error('Registration Error:', error);
      return {
        success: false,
        message: error.message
      };
    }
  }

  @Post('login')
  async login(@Body() body: { email: string; password: string }) {
    console.log('Incoming data:', body);
    try {
      console.log('Login:', body.email);
      return {
        success: true,
        data: await this.usersService.login(body.email, body.password)
      }
    } catch (error) {
      console.error('Login Error:', error);
      return {
        success: false,
        message: error.message
      }
    }
  }

  @Get('users')
  async getAllUsers() {
    try {
      return this.usersService.findAll();
    } catch (error) {
      return {
        success: false,
        message: error.message
      }
    }
  }
}
