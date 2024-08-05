import {
  Controller,
  Post,
  Body,
  UnauthorizedException,
  UseGuards,
  Request,
  Put,
  HttpCode,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { UserService } from '../user/user.service';
import { User } from '../user/entities/user.entity';
import { JwtAuthGuard } from './jwt/jwt-auth.guard';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { LoginDto } from './dto/login.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { RegisterDto } from './dto/register.dto';
import { AccessToken } from './types';

@ApiTags('auth')
@Controller({ version: '1', path: 'auth' })
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
  ) {}

  @ApiOperation({ summary: 'Log in a user' })
  @ApiBody({ type: LoginDto })
  @ApiResponse({
    status: 201,
    description: 'The user has been successfully logged in.',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @Post('login')
  async login(@Body() loginDto: LoginDto): Promise<AccessToken> {
    const { username, password } = loginDto;
    return this.authService.login(username, password);
  }

  @ApiOperation({ summary: 'Register a new user' })
  @ApiBody({ type: RegisterDto })
  @ApiResponse({
    status: 201,
    description: 'The user has been successfully registered.',
  })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @Post('register')
  async register(@Body() registerDto: RegisterDto): Promise<AccessToken> {
    const { username, password } = registerDto;
    const existingUser = await this.userService.findByUsername(username);
    if (existingUser) {
      throw new UnauthorizedException('User already exists');
    }
    const user = new User();
    user.username = username;
    user.password = password;
    return this.authService.register(user);
  }

  @ApiOperation({ summary: 'Update user password' })
  @ApiBearerAuth()
  @ApiBody({ type: UpdatePasswordDto })
  @ApiResponse({
    status: 200,
    description: 'The password has been successfully updated.',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @UseGuards(JwtAuthGuard)
  @Put('update-password')
  async updatePassword(
    @Request() req,
    @Body() updatePasswordDto: UpdatePasswordDto,
  ): Promise<AccessToken> {
    const { currentPassword, newPassword } = updatePasswordDto;
    const userId = req.user.userId;
    const result = await this.authService.updatePassword(
      userId,
      currentPassword,
      newPassword,
    );
    if (!result) {
      throw new UnauthorizedException('Current password is incorrect');
    }
    return result;
  }

  @ApiOperation({ summary: 'Log out a user' })
  @ApiBearerAuth()
  @ApiResponse({
    status: 200,
    description: 'The user has been successfully logged out.',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @UseGuards(JwtAuthGuard)
  @HttpCode(200)
  @Post('logout')
  async logout(@Request() req): Promise<{ message: string }> {
    const token = req.headers.authorization?.split(' ')[1];
    if (token) {
      this.authService.logout(token);
    }
    return { message: 'Logged out successfully' };
  }
}
