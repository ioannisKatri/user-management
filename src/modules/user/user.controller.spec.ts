import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { JwtAuthGuard } from '../auth/jwt/jwt-auth.guard';
import { User } from './entities/user.entity';

describe('UserController', () => {
  let userController: UserController;
  let userService: UserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        {
          provide: UserService,
          useValue: {
            findByUsername: jest.fn(),
            update: jest.fn(),
            findById: jest.fn(),
          },
        },
        JwtAuthGuard,
      ],
    }).compile();

    userController = module.get<UserController>(UserController);
    userService = module.get<UserService>(UserService);
  });

  it('should be defined', () => {
    expect(userController).toBeDefined();
  });

  it('should get user profile', async () => {
    const request = {
      user: { userId: 1, username: 'test' } as unknown as User,
    };
    jest
      .spyOn(userService, 'findById')
      .mockImplementation(async () => request.user);

    expect(await userController.getProfile(request)).toBe(request.user);
  });

  it('should update user profile', async () => {
    const request = { user: { userId: 1, username: 'test' } };
    const updateDto = {
      username: 'updated_test',
      createdAt: new Date(),
    } as unknown as User;
    jest.spyOn(userService, 'update').mockImplementation(async () => undefined);
    jest.spyOn(userService, 'findById').mockImplementation(async () => {
      return { ...request.user, ...updateDto, password: 'asdsadsda' };
    });

    expect(await userController.updateProfile(request, updateDto)).toEqual(
      expect.objectContaining({
        username: updateDto.username,
      }),
    );
  });
});
