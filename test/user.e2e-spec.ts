import { INestApplication, VersioningType } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { v4 as uuidv4 } from 'uuid';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppModule } from '../src/modules/app/app.module';

describe('UserController (e2e)', () => {
  let app: INestApplication;
  let username: string;
  const password = 'testpassword';

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        AppModule,
        TypeOrmModule.forRoot({
          type: 'sqlite',
          database: 'database.sqlite',
          autoLoadEntities: true,
          synchronize: true,
        }),
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.enableVersioning({
      type: VersioningType.URI,
    });
    await app.init();
  });

  beforeEach(() => {
    username = `user_${uuidv4()}`;
  });

  afterAll(async () => {
    await app.close();
  });

  it('should get user profile (GET /v1/users/profile)', async () => {
    await request(app.getHttpServer())
      .post('/v1/auth/register')
      .send({ username, password })
      .expect(201);

    const loginResponse = await request(app.getHttpServer())
      .post('/v1/auth/login')
      .send({ username, password })
      .expect(201);

    const accessToken = loginResponse.body.access_token;

    const response = await request(app.getHttpServer())
      .get('/v1/users/profile')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    expect(response.body).toHaveProperty('id');
    expect(response.body).toHaveProperty('username');
    expect(response.body.username).toBe(username);
  });

  it('should update the user profile (PUT /v1/users/profile)', async () => {
    await request(app.getHttpServer())
      .post('/v1/auth/register')
      .send({ username, password })
      .expect(201);

    const loginResponse = await request(app.getHttpServer())
      .post('/v1/auth/login')
      .send({ username, password })
      .expect(201);

    const accessToken = loginResponse.body.access_token;

    const newName = `updated_${username}`;
    const response = await request(app.getHttpServer())
      .put('/v1/users/profile')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ username: newName })
      .expect(200);

    expect(response.body).toHaveProperty('id');
    expect(response.body).toHaveProperty('username');
    expect(response.body.username).toBe(newName);
  });
});
