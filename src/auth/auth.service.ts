import { Injectable } from '@nestjs/common';
import { AuthUserDto, JWTPayloadDto, LoginDto } from 'src/dto/auth.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { hash } from 'argon2';
import { EmailService, EjsService } from 'src/utils/emails/index';
import { ConfigService } from '@nestjs/config';
import { verify } from 'argon2';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private emailService: EmailService,
    private ejsService: EjsService,
    private config: ConfigService,
    private jwtService: JwtService,
  ) {}

  // Register user service
  async register(userDto: AuthUserDto) {
    try {
      const existingUser = await this.prisma.users.findUnique({
        where: { email: userDto.email },
      });

      if (existingUser) {
        return { message: 'User already exists', success: false };
      }

      // Hash password
      const passwordHash = await hash(userDto.password);

      // Create user
      const createdUser = await this.prisma.users.create({
        data: {
          firstName: userDto.firstName,
          lastName: userDto.lastName,
          middleName: userDto.middleName || null,
          birthYear: userDto.birthYear,
          password: passwordHash,
          email: userDto.email,
        },
      });

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, ...returnValues } = createdUser;

      //call the ejs file and it's payload
      const ejsPayload = {
        firstName: userDto.firstName,
        homePageLink: this.config.get<string>('APP_CLIENT_HOME_PAGE'),
      };

      //call the ejs render file
      const renderEjs = await this.ejsService.registerEmail(ejsPayload);

      //send an email when the user successfully registers
      await this.emailService.createEmail(
        userDto.email,
        renderEjs,
        'Account Registration',
      );

      return {
        user: returnValues,
        message: 'User created successfully',
        success: true,
      };
    } catch (error) {
      console.error('Error creating user:', error);
      return {
        message: 'An error occurred during registration',
        success: false,
      };
    }
  }

  //login method
  async login(loginDto: LoginDto) {
    try {
      //get the user from the database
      const user = await this.prisma.users.findUnique({
        where: { email: loginDto.email },
      });

      //check if user exists
      if (!user) {
        return { success: false, message: 'User not found' };
      }

      //verify password from the database
      const comparePasswords = await verify(user.password, loginDto.password);
      if (!comparePasswords) {
        return { success: false, message: 'User password mismatch' };
      }

      //sign the token if everything goes well
      const payload: JWTPayloadDto = {
        sub: user.id,
        email: loginDto.email,
      };

      const accessToken = this.jwtService.sign(payload);
      return {
        success: true,
        message: 'Login Successful',
        token: accessToken,
        name: user.firstName,
      };
    } catch (error) {
      console.error(error);
    }
  }
}
