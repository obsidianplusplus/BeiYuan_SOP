import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';

describe('AppController (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/api/v1/stations (GET)', () => {
    return request(app.getHttpServer())
      .get('/api/v1/stations')
      .expect(200)
      .expect((res) => {
        expect(res.body.code).toBe(200);
        expect(Array.isArray(res.body.data)).toBe(true);
      });
  });
});
