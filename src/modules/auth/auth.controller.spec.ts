import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UserService } from '../user/user.service';
import { JwtService } from '@nestjs/jwt';
import { JwtAuthGuard } from './jwt/jwt-auth.guard';
import { AuthController } from './auth.controller';
import { TokenManagerService } from '../token-manager/token-manager.service';

describe('AuthController', () => {
  let authController: AuthController;
  let authService: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            login: jest.fn(),
            register: jest.fn(),
            logout: jest.fn(),
            updatePassword: jest.fn(),
          },
        },
        {
          provide: TokenManagerService,
          useValue: {
            isTokenBlacklisted: jest.fn(),
            blacklistToken: jest.fn(),
          },
        },
        {
          provide: UserService,
          useValue: {
            findByUsername: jest.fn(),
            create: jest.fn(),
          },
        },
        JwtService,
        JwtAuthGuard,
      ],
    }).compile();

    authController = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(authController).toBeDefined();
  });

  it('should register a user', async () => {
    const result = { access_token: 'test_token' };
    jest.spyOn(authService, 'register').mockImplementation(async () => result);
    const req = await authController.register({
      username: 'test',
      password: 'test',
    });
    expect(req).toBe(result);
  });

  it('should login a user', async () => {
    const result = { access_token: 'test_token' };
    jest.spyOn(authService, 'login').mockImplementation(async () => result);

    expect(
      await authController.login({ username: 'test', password: 'test' }),
    ).toBe(result);
  });
});
