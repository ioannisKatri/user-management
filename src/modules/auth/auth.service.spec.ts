import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UserService } from '../user/user.service';
import { JwtService } from '@nestjs/jwt';
import { TokenManagerService } from '../token-manager/token-manager.service';
import { UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { User } from '../user/entities/user.entity';
import { UserNotFoundError } from '../../commons/errors';

describe('AuthService', () => {
  let authService: AuthService;
  let userService: UserService;
  let jwtService: JwtService;
  let tokenManagerService: TokenManagerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UserService,
          useValue: {
            findByUsername: jest.fn(),
            create: jest.fn(),
            findById: jest.fn(),
            update: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn(),
          },
        },
        {
          provide: TokenManagerService,
          useValue: {
            isTokenBlacklisted: jest.fn(),
            blacklistToken: jest.fn(),
          },
        },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    userService = module.get<UserService>(UserService);
    jwtService = module.get<JwtService>(JwtService);
    tokenManagerService = module.get<TokenManagerService>(TokenManagerService);
  });

  describe('validateUser', () => {
    it('should return user data without password if validation is successful', async () => {
      const mockUser = { username: 'test', password: 'hashedPassword' } as User;
      jest.spyOn(userService, 'findByUsername').mockResolvedValue(mockUser);
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(true);

      const result = await authService.validateUser('test', 'password');

      expect(result).toEqual({ username: 'test' });
    });

    it('should return null if validation fails', async () => {
      jest.spyOn(userService, 'findByUsername').mockResolvedValue(null);

      const result = await authService.validateUser('test', 'password');

      expect(result).toBeNull();
    });
  });

  describe('login', () => {
    it('should return access token if login is successful', async () => {
      const mockUser = {
        id: 1,
        username: 'test',
        password: 'hashedPassword',
      } as User;
      jest.spyOn(authService, 'validateUser').mockResolvedValue(mockUser);
      jest.spyOn(jwtService, 'sign').mockReturnValue('access_token');

      const result = await authService.login('test', 'password');

      expect(result).toEqual({ access_token: 'access_token' });
    });

    it('should throw UnauthorizedException if login fails', async () => {
      jest.spyOn(authService, 'validateUser').mockResolvedValue(null);

      await expect(authService.login('test', 'password')).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('register', () => {
    it('should return access token after successful registration', async () => {
      const mockUser = { username: 'test', password: 'password' } as User;
      const savedUser = {
        ...mockUser,
        id: 1,
        password: 'hashedPassword',
      } as User;
      jest.spyOn(bcrypt, 'hash').mockResolvedValue('hashedPassword');
      jest.spyOn(userService, 'create').mockResolvedValue(savedUser);
      jest.spyOn(jwtService, 'sign').mockReturnValue('access_token');

      const result = await authService.register(mockUser);

      expect(result).toEqual({ access_token: 'access_token' });
    });
  });

  describe('updatePassword', () => {
    it('should return access token if password update is successful', async () => {
      const mockUser = {
        id: 1,
        username: 'test',
        password: 'hashedPassword',
      } as User;
      jest.spyOn(userService, 'findById').mockResolvedValue(mockUser);
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(true);
      jest.spyOn(bcrypt, 'hash').mockResolvedValue('newHashedPassword');
      jest.spyOn(userService, 'update').mockResolvedValue(undefined);
      jest.spyOn(jwtService, 'sign').mockReturnValue('access_token');

      const result = await authService.updatePassword(
        1,
        'currentPassword',
        'newPassword',
      );

      expect(result).toEqual({ access_token: 'access_token' });
    });

    it('should throw error if user not found', async () => {
      jest.spyOn(userService, 'findById').mockResolvedValue(null);

      await expect(
        authService.updatePassword(1, 'currentPassword', 'newPassword'),
      ).rejects.toThrow(UserNotFoundError);
    });
  });

  describe('logout', () => {
    it('should call blacklistToken on tokenManagerService', () => {
      const token = 'someToken';
      jest.spyOn(tokenManagerService, 'blacklistToken');

      authService.logout(token);

      expect(tokenManagerService.blacklistToken).toHaveBeenCalledWith(token);
    });
  });

  describe('isTokenBlacklisted', () => {
    it('should call isTokenBlacklisted on tokenManagerService', () => {
      const token = 'someToken';
      jest
        .spyOn(tokenManagerService, 'isTokenBlacklisted')
        .mockReturnValue(true);

      const result = authService.isTokenBlacklisted(token);

      expect(result).toBe(true);
      expect(tokenManagerService.isTokenBlacklisted).toHaveBeenCalledWith(
        token,
      );
    });
  });
});
