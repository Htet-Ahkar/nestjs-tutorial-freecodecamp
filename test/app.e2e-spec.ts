import { Test } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { PrismaService } from '../src/prisma/prisma.service';
import * as pactum from 'pactum';
import { AuthDto } from '../src/auth/dto';
import { EditUserDto } from '../src/user/dto';
import { CreateBookmarkDto, EditBookmarkDto } from 'src/bookmark/dto';

describe('App e2e', () => {
  let app: INestApplication;
  let prismaSerive: PrismaService;
  const userAt = 'userAt';
  const bookmarkId = 'bookmarkId';

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
      }),
    );

    await app.init();
    await app.listen(3333);

    prismaSerive = app.get(PrismaService);
    await prismaSerive.cleanDb();
    pactum.request.setBaseUrl('http://localhost:3333');
  });

  afterAll(async () => {
    app.close();
  });

  describe('Auth', () => {
    const dto: AuthDto = {
      email: 'xero@gmail.com',
      password: '123',
    };

    describe('SignUp', () => {
      const localRoute = '/auth/signup';

      it('it should throw if email empty', () => {
        return pactum
          .spec()
          .post(localRoute)
          .withBody({
            password: dto.password,
          })
          .expectStatus(400);
      });
      it('it should throw if password empty', () => {
        return pactum
          .spec()
          .post(localRoute)
          .withBody({
            email: dto.email,
          })
          .expectStatus(400);
      });
      it('it should throw if empty', () => {
        return pactum.spec().post(localRoute).withBody({}).expectStatus(400);
      });

      it('should sign up', () => {
        return pactum.spec().post(localRoute).withBody(dto).expectStatus(201);
      });
    });

    describe('SignIn', () => {
      const localRoute = '/auth/signin';

      it('it should throw if email empty', () => {
        return pactum
          .spec()
          .post(localRoute)
          .withBody({
            password: dto.password,
          })
          .expectStatus(400);
      });
      it('it should throw if password empty', () => {
        return pactum
          .spec()
          .post(localRoute)
          .withBody({
            email: dto.email,
          })
          .expectStatus(400);
      });
      it('it should throw if empty', () => {
        return pactum.spec().post(localRoute).withBody({}).expectStatus(400);
      });

      it('should sign in', () => {
        return pactum
          .spec()
          .post(localRoute)
          .withBody(dto)
          .expectStatus(200)
          .stores(userAt, 'access_token');
      });
    });
  });

  describe('User', () => {
    const localRoute = '/users';

    describe('Get me', () => {
      it('should get current user', () => {
        return pactum
          .spec()
          .get(localRoute + '/me')
          .withHeaders({ Authorization: `Bearer $S{${userAt}}` })
          .expectStatus(200);
      });
    });

    describe('Edit user', () => {
      const editDto: EditUserDto = {
        firstName: 'Htet',
        lastName: 'Ahkar',
      };

      it('should edit current user', () => {
        return pactum
          .spec()
          .patch(localRoute)
          .withHeaders({ Authorization: `Bearer $S{${userAt}}` })
          .withBody(editDto)
          .expectStatus(200)
          .expectBodyContains(editDto.firstName)
          .expectBodyContains(editDto.lastName);
      });
    });
  });

  describe('Bookmark', () => {
    const localRoute = '/bookmarks';

    describe('Get empty bookmark', () => {
      it('should get empty bookmark', () => {
        return pactum
          .spec()
          .get(localRoute)
          .withHeaders({ Authorization: `Bearer $S{${userAt}}` })
          .expectStatus(200)
          .expectBody([]);
      });
    });

    describe('Create bookmark', () => {
      const createDto: CreateBookmarkDto = {
        title: 'bookmarkTitle',
        link: 'bookmarkLink',
        // description: 'bookmarkDescription',
      };

      it('should create bookmark', () => {
        return pactum
          .spec()
          .post(localRoute)
          .withHeaders({ Authorization: `Bearer $S{${userAt}}` })
          .withBody(createDto)
          .expectStatus(201)
          .stores(bookmarkId, 'id');
      });
    });

    describe('Get bookmarks', () => {
      it('should get bookmarks', () => {
        return pactum
          .spec()
          .get(localRoute)
          .withHeaders({ Authorization: `Bearer $S{${userAt}}` })
          .expectStatus(200)
          .expectJsonLength(1);
      });
    });

    describe('Get bookmark by id', () => {
      it('should get bookmark by id', () => {
        return pactum
          .spec()
          .get(localRoute)
          .withHeaders({ Authorization: `Bearer $S{${userAt}}` })
          .withPathParams('id', `$S{${bookmarkId}}`)
          .expectStatus(200)
          .expectBodyContains(`$S{${bookmarkId}}`);
      });
    });

    describe('Edit bookmark', () => {
      const editDto: EditBookmarkDto = {
        description: 'description',
      };

      it('should edit bookmark by id', () => {
        return pactum
          .spec()
          .patch(localRoute + '/{id}')
          .withHeaders({ Authorization: `Bearer $S{${userAt}}` })
          .withPathParams('id', `$S{${bookmarkId}}`)
          .withBody(editDto)
          .expectStatus(200)
          .expectBodyContains(editDto.description);
      });
    });

    describe('Delete bookmark by id', () => {
      it('should delete bookmark by id', () => {
        return pactum
          .spec()
          .delete(localRoute + '/{id}')
          .withHeaders({ Authorization: `Bearer $S{${userAt}}` })
          .withPathParams('id', `$S{${bookmarkId}}`)
          .expectStatus(204);
      });

      it('should get empty bookmark', () => {
        return pactum
          .spec()
          .get(localRoute)
          .withHeaders({ Authorization: `Bearer $S{${userAt}}` })
          .expectStatus(200)
          .expectJsonLength(0);
      });
    });
  });
});
