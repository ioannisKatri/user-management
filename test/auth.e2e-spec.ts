import { INestApplication, VersioningType } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { v4 as uuidv4 } from 'uuid';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppModule } from '../src/modules/app/app.module';

describe('AuthController (e2e)', () => {
  let app: INestApplication;
  let username: string;

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

  it('should register a new user and return an access token (POST /v1/auth/register)', async () => {
    const response = await request(app.getHttpServer())
      .post('/v1/auth/register')
      .send({ username, password: 'testpassword' })
      .expect(201);

    expect(response.body).toHaveProperty('access_token');
  });

  it('should login an existing user and return an access token (POST /v1/auth/login)', async () => {
    await request(app.getHttpServer())
      .post('/v1/auth/register')
      .send({ username, password: 'testpassword' })
      .expect(201);

    const response = await request(app.getHttpServer())
      .post('/v1/auth/login')
      .send({ username, password: 'testpassword' })
      .expect(201);

    expect(response.body).toHaveProperty('access_token');
  });

  it('should update the user password and return a new access token (PUT /v1/auth/update-password)', async () => {
    await request(app.getHttpServer())
      .post('/v1/auth/register')
      .send({ username, password: 'testpassword' })
      .expect(201);

    const loginResponse = await request(app.getHttpServer())
      .post('/v1/auth/login')
      .send({ username, password: 'testpassword' })
      .expect(201);

    const accessToken = loginResponse.body.access_token;

    const response = await request(app.getHttpServer())
      .put('/v1/auth/update-password')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ currentPassword: 'testpassword', newPassword: 'newpassword' })
      .expect(200);

    expect(response.body).toHaveProperty('access_token');
  });

  it('should logout the user (POST /v1/auth/logout)', async () => {
    await request(app.getHttpServer())
      .post('/v1/auth/register')
      .send({ username, password: 'newpassword' })
      .expect(201);

    const loginResponse = await request(app.getHttpServer())
      .post('/v1/auth/login')
      .send({ username, password: 'newpassword' })
      .expect(201);

    const accessToken = loginResponse.body.access_token;

    const response = await request(app.getHttpServer())
      .post('/v1/auth/logout')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    expect(response.body).toEqual({ message: 'Logged out successfully' });
  });

  afterAll(async () => {
    await app.close();
  });
});
