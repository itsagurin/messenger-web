import {
  Controller,
  Post,
  Body,
  Get,
  UseGuards,
  Delete,
  Req,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersGateway } from '../websocket/wsgateway';
import { JwtService } from '@nestjs/jwt';
import { AuthGuard } from '@nestjs/passport';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { CustomValidationPipe} from './dto/validation.pipe';

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
  async register(@Body(new CustomValidationPipe()) createUserDto: CreateUserDto) {
    const result = await this.usersService.register(createUserDto.email, createUserDto.password);

    const tokens = this.generateTokens(result.userId, result.email);
    await this.usersService.updateRefreshToken(result.userId, tokens.refreshToken);
    await this.usersGateway.handleUserAuth(result.email);

    return {
      message: 'Registration successful',
      userId: result.userId,
      email: result.email,
      subscription: result.subscription,
      ...tokens
    };
  }

  @Post('login')
  async login(@Body(new CustomValidationPipe()) loginUserDto: LoginUserDto) {
    const result = await this.usersService.login(loginUserDto.email, loginUserDto.password);

    const tokens = this.generateTokens(result.userId, result.email);
    await this.usersService.updateRefreshToken(result.userId, tokens.refreshToken);
    await this.usersGateway.handleUserAuth(result.email);

    return {
      message: 'Login successful',
      userId: result.userId,
      email: result.email,
      ...tokens
    };
  }

  @Post('refresh')
  async refresh(@Body() body: { refreshToken: string }) {
    try {
      const decoded = this.jwtService.verify(body.refreshToken);
      const result = await this.usersService.refreshToken(body.refreshToken);

      if (result.userId === decoded.sub) {
        const tokens = this.generateTokens(result.userId, result.email);
        await this.usersService.updateRefreshToken(result.userId, tokens.refreshToken);

        return {
          ...tokens
        };
      }

      throw new HttpException('Invalid refresh token', HttpStatus.UNAUTHORIZED);
    } catch (error) {
      throw new HttpException('Invalid refresh token', HttpStatus.UNAUTHORIZED);
    }
  }

  @Get('users')
  @UseGuards(AuthGuard('jwt'))
  async getAllUsers() {
    const users = await this.usersService.findAll();
    return users;
  }

  @Delete()
  @UseGuards(AuthGuard('jwt'))
  async deleteCurrentUser(@Req() req: any) {
    const currentUserId = req.user.userId;
    await this.usersService.deleteCurrentUser(currentUserId);
    return { message: 'Your account has been successfully deleted' };
  }

  @Delete('users/all')
  @UseGuards(AuthGuard('jwt'))
  async deleteAllUsers() {
    await this.usersService.deleteAllUsers();
    return { message: 'All users have been deleted successfully' };
  }
}