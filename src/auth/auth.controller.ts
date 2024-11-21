/*
https://docs.nestjs.com/controllers#controllers
*/

import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Logger,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthUserDto, LoginDto } from 'src/dto/index';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { Request } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  logger = new Logger();
  //register user endpoint
  @Post('register')
  async register(@Body() user: AuthUserDto) {
    const authServiceResponse = await this.authService.register(user);

    //check if the user exists
    if (
      !authServiceResponse.success &&
      authServiceResponse.message.includes('User already exists')
    ) {
      this.logger.error(authServiceResponse.message);
      throw new HttpException(authServiceResponse.message, HttpStatus.CONFLICT);
    }

    // Return a success message to the client
    return {
      message: authServiceResponse.message,
      user: authServiceResponse.user,
    };
  }

  //login controller

  @Post('login')
  async Login(@Body() loginDto: LoginDto) {
    const loginService = await this.authService.login(loginDto);

    // check if the user exists
    if (
      !loginService.success &&
      loginService.message.includes('User not found')
    ) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    //check if the password entered is right
    if (
      !loginService.success &&
      loginService.message.includes('User password mismatch')
    ) {
      throw new HttpException('Password mismatch', HttpStatus.FORBIDDEN);
    }

    //return the token to the client
    return {
      token: loginService.token,
      name: loginService.name,
    };
  }

  @Get('/google')
  @UseGuards(JwtAuthGuard)
  async googleOauth(@Req() req: Request) {
    return { message: 'I am good', user: (req.user as any).userEmail };
  }

  @Get('google/callback')
  async googleOauthCallback() {}
}
