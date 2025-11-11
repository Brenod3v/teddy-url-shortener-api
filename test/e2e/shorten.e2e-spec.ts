import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../../src/app.module';

/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */

describe('Shorten (e2e)', () => {
  let app: INestApplication;
  let authToken: string;
  let createdUrlId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({ transform: true, whitelist: true }),
    );
    await app.init();

    const registerResponse = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: `e2e${Date.now()}@example.com`,
        password: 'Password123!',
      });

    authToken = registerResponse.body.access_token;
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });

  describe('/shorten (POST)', () => {
    it('should create short URL without authentication', () => {
      return request(app.getHttpServer())
        .post('/shorten')
        .send({
          longUrl: 'https://example.com',
        })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body).toHaveProperty('shortUrl');
          expect(res.body).toHaveProperty('slug');
          expect(res.body.longUrl).toBe('https://example.com');
        });
    });

    it('should create short URL with authentication', () => {
      return request(app.getHttpServer())
        .post('/shorten')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          longUrl: 'https://google.com',
        })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('userId');
          createdUrlId = res.body.id;
        });
    });

    it('should create short URL with custom alias', async () => {
      const customAlias = `alias${Date.now()}`;
      return request(app.getHttpServer())
        .post('/shorten')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          longUrl: 'https://github.com',
          customAlias,
        })
        .expect(201)
        .expect((res) => {
          expect(res.body.slug).toBe(customAlias);
        });
    });

    it('should fail with custom alias without authentication', () => {
      return request(app.getHttpServer())
        .post('/shorten')
        .send({
          longUrl: 'https://example.com',
          customAlias: 'myalias',
        })
        .expect(400);
    });

    it('should fail with invalid URL', () => {
      return request(app.getHttpServer())
        .post('/shorten')
        .send({
          longUrl: 'invalid-url',
        })
        .expect(400);
    });

    it('should fail with reserved alias', () => {
      return request(app.getHttpServer())
        .post('/shorten')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          longUrl: 'https://example.com',
          customAlias: 'auth',
        })
        .expect(400);
    });
  });

  describe('/:slug (GET)', () => {
    let testSlug: string;

    beforeAll(async () => {
      const response = await request(app.getHttpServer())
        .post('/shorten')
        .send({
          longUrl: 'https://redirect-test.com',
        });
      testSlug = response.body.slug;
    });

    it('should redirect to long URL with 302 status', () => {
      return request(app.getHttpServer())
        .get(`/${testSlug}`)
        .expect(302)
        .expect('Location', 'https://redirect-test.com');
    });

    it('should fail with non-existent slug', () => {
      return request(app.getHttpServer()).get('/nonexistent123').expect(404);
    });
  });

  describe('/my-urls (GET)', () => {
    it('should return user URLs', () => {
      return request(app.getHttpServer())
        .get('/my-urls')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          expect(res.body.length).toBeGreaterThan(0);
        });
    });

    it('should fail without authentication', () => {
      return request(app.getHttpServer()).get('/my-urls').expect(401);
    });
  });

  describe('/my-urls/:id (PUT)', () => {
    it('should update URL', () => {
      return request(app.getHttpServer())
        .put(`/my-urls/${createdUrlId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          url: 'https://updated-example.com',
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.message).toBe('URL atualizada com sucesso');
        });
    });

    it('should fail without authentication', () => {
      return request(app.getHttpServer())
        .put(`/my-urls/${createdUrlId}`)
        .send({
          url: 'https://updated-example.com',
        })
        .expect(401);
    });

    it('should fail with invalid URL', () => {
      return request(app.getHttpServer())
        .put(`/my-urls/${createdUrlId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          url: 'invalid-url',
        })
        .expect(400);
    });
  });

  describe('/my-urls/:id (DELETE)', () => {
    it('should delete URL', () => {
      return request(app.getHttpServer())
        .delete(`/my-urls/${createdUrlId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.message).toBe('URL deletada com sucesso');
        });
    });

    it('should fail without authentication', async () => {
      const response = await request(app.getHttpServer())
        .post('/shorten')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          longUrl: 'https://to-delete.com',
        });

      return request(app.getHttpServer())
        .delete(`/my-urls/${response.body.id}`)
        .expect(401);
    });

    it('should fail with non-existent URL', () => {
      return request(app.getHttpServer())
        .delete('/my-urls/00000000-0000-0000-0000-000000000000')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });
  });
});
