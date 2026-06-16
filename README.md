# Buddy Script — Backend API

A NestJS 11 REST API powering the Buddy Script social feed: authentication,
posts, threaded comments, likes, and Cloudinary-backed image uploads. Built on
PostgreSQL (TypeORM) with Redis-backed HTTP caching, JWT auth, a uniform
response envelope, and Swagger/OpenAPI docs.

## Tech stack

| Concern              | Choice                                                          |
| -------------------- | -------------------------------------------------------------- |
| Framework            | NestJS 11 (Express platform), TypeScript (strict)              |
| Database / ORM       | PostgreSQL 16 + TypeORM 0.3 (`synchronize: true`, autoload)    |
| Auth                 | JWT (`@nestjs/jwt` + Passport `passport-jwt`), bcrypt hashing  |
| Caching              | Redis (Redis Stack) via `cache-manager` + `@keyv/redis`        |
| Validation           | `class-validator` / `class-transformer` (global ValidationPipe)|
| File storage         | Cloudinary (`multer` memory upload, image-only)                |
| Logging              | Winston (`nest-winston`) + request logging interceptor         |
| API docs             | Swagger / OpenAPI (`@nestjs/swagger`)                           |
| Tests                | Jest (unit + e2e), Supertest                                   |

## Getting started

### Prerequisites

- Node.js 22+ and **pnpm** (via Corepack)
- PostgreSQL 16 and a Redis instance — or just use Docker Compose (below)

### Local (with Docker for infra)

```bash
pnpm install
cp .env.example .env          # then fill in real values
docker compose up -d postgres redis   # start infra only
pnpm start:dev                # watch mode on http://localhost:4000
```

### Full stack with Docker Compose

```bash
docker compose up --build     # api + postgres + redis
```

> **Note:** `main.ts` listens on `PORT` (default **4000**). The dev
> `docker-compose.yaml` maps host `3000 → container 3000`, so when running the
> API in Compose set `PORT=3000` (or adjust the port mapping) so the published
> port matches the listening port. The production `Dockerfile.prod` exposes
> `3000` and runs `node dist/src/main.js` as a non-root user.

Once running, browse the interactive API docs at **`/docs`** (Swagger UI).

## Environment variables

| Variable                 | Description                                  | Example                          |
| ------------------------ | -------------------------------------------- | -------------------------------- |
| `PORT`                   | HTTP port the API listens on (default 4000)  | `4000`                           |
| `DB_TYPE`                | Database driver                              | `postgres`                       |
| `DB_HOST`                | Postgres host                                | `localhost`                      |
| `DB_PORT`                | Postgres port                                | `5432`                           |
| `DB_USERNAME`            | Postgres user                                | `postgres`                       |
| `DB_PASSWORD`            | Postgres password                            | `postgres`                       |
| `DB_NAME`                | Database name                                | `academic_db`                    |
| `JWT_SECRET`             | Secret used to sign JWTs                      | `change-in-production`           |
| `JWT_EXPIRES_IN`         | Configured token lifetime                    | `7d`                             |
| `CLOUDINARY_CLOUD_NAME`  | Cloudinary cloud name                        | `my-cloud`                       |
| `CLOUDINARY_API_KEY`     | Cloudinary API key                           | `1234567890`                     |
| `CLOUDINARY_API_SECRET`  | Cloudinary API secret                        | `••••••`                         |
| `CLOUDINARY_FOLDER`      | Target folder for uploads                    | `uploads`                        |
| `CACHE_REDIS_HOST`       | Redis host (Compose sets this to `redis`)    | `localhost`                      |

> Issued access tokens currently expire in **30m** and refresh tokens in **7d**
> (see `token.helper.ts`); `JWT_EXPIRES_IN` is wired through config for the JWT
> module default.

## Architecture

The codebase follows a layered, feature-modular structure: a **`core/`** layer
of cross-cutting infrastructure, a **`common/`** layer of shared helpers, and a
**`modules/`** layer of business domains. Every module is a standard NestJS
`controller → service → entity (+ DTOs)` slice.

```
src/
├── main.ts                  # Bootstrap: CORS, global pipe/filter/interceptors, Swagger
├── app.module.ts            # Root: Config + Database + Auth + Modules
├── common/
│   ├── helpers/             # PasswordHelper (bcrypt)
│   └── pagination/          # PaginationDto + helpers (page/limit)
├── core/
│   ├── authentication/auth/ # JWT auth: controller, service, strategy, guard, decorators
│   ├── cache/               # Redis HttpCacheInterceptor + InvalidationInterceptor
│   ├── config/              # registerAs configs (database, jwt, cloudinary, cache-redis)
│   ├── database/            # TypeOrm + cache-manager wiring (@Global)
│   ├── filters/             # HttpExceptionFilter
│   ├── interceptors/        # TransformInterceptor (response envelope)
│   ├── logger/              # Winston config + LoggingInterceptor
│   ├── pipes/               # Global ValidationPipe
│   └── swagger/             # OpenAPI setup + swagger.yaml
└── modules/
    ├── users/               # User entity, profile lookup, unique-email validator
    ├── posts/               # Posts CRUD + post-likes submodule
    ├── comments/            # Comments CRUD + comment-likes + comment-replies submodules
    └── file-upload/         # Cloudinary single/multiple image upload
```

### Cross-cutting behaviour

- **Response envelope.** `TransformInterceptor` wraps every successful response
  in a consistent shape, so clients always read the same structure:

  ```json
  {
    "status_code": 200,
    "message": "Success",
    "data": { },
    "meta": { },
    "_links": { }
  }
  ```

  (`meta` carries pagination; `_links` carries HATEOAS-style links when present.)

- **Validation.** A global `ValidationPipe` validates and transforms all
  incoming DTOs via `class-validator`. `useContainer` is enabled so custom
  validators (e.g. `IsEmailUnique`) can inject services.
- **Errors.** `HttpExceptionFilter` normalises thrown exceptions into the same
  envelope with the correct status code.
- **Auth.** Routes are protected per-controller with `JwtAuthGuard`. The
  `@AuthUser()` / `@User()` decorator injects the authenticated user; the
  `@Public()` decorator opts a route out of auth.
- **Caching.** Redis-backed `HttpCacheInterceptor` caches GET responses (1-day
  TTL, namespace `appifylab_api`); `InvalidationInterceptor` busts related keys
  on writes.
- **Logging.** Winston handles structured logs (to `logs/`) and a
  `LoggingInterceptor` records each request.

## Data model

All entities use UUID primary keys and snake_case columns with TypeORM
`synchronize: true` (schema auto-syncs in dev — use migrations for production).

- **User** — `id, first_name, last_name, email (unique), password (select:false), created_at, updated_at`
- **Post** — `id, content, image?, status (public|private, default private), user_id → User, created_at (indexed), updated_at`
- **Comment** — `id, text, image?, post_id → Post, user_id → User, parent_id? (self-ref for replies), timestamps`
- **PostLike** — composite PK `(post_id, user_id)`, cascade delete
- **CommentLike** — composite PK `(comment_id, user_id)`, cascade delete

Feed visibility: `findAll` returns public posts plus the requesting user's own
private posts, newest first.

## API reference

Base URL: `http://localhost:4000`. All routes except `auth/register`,
`auth/login`, and the root health check require an
`Authorization: Bearer <auth_token>` header. Full schemas live in Swagger at
**`/docs`**.

### Auth (`/auth`)

| Method | Path             | Auth | Description                                            |
| ------ | ---------------- | ---- | ------------------------------------------------------ |
| POST   | `/auth/register` | No   | Register a user (`first_name, last_name, email, password ≥8`) |
| POST   | `/auth/login`    | No   | Log in; returns `{ auth_token, refresh_token }`        |
| GET    | `/auth/me`       | Yes  | Current authenticated user                             |

### Users (`/users`)

| Method | Path         | Auth | Description            |
| ------ | ------------ | ---- | ---------------------- |
| GET    | `/users/:id` | Yes  | Fetch a user profile   |

### Posts (`/posts`)

| Method | Path          | Auth | Description                                         |
| ------ | ------------- | ---- | -------------------------------------------------- |
| POST   | `/posts`      | Yes  | Create a post (`content`, optional `image` URL, `status`) |
| GET    | `/posts`      | Yes  | Paginated feed (`?page=&limit=`)                   |
| GET    | `/posts/:id`  | Yes  | Single post                                        |
| PATCH  | `/posts/:id`  | Yes  | Update own post                                    |
| DELETE | `/posts/:id`  | Yes  | Delete own post                                    |

### Post likes (`/posts/:post_id/likes`)

| Method | Path                       | Auth | Description                       |
| ------ | -------------------------- | ---- | -------------------------------- |
| GET    | `/posts/:post_id/likes`    | Yes  | Paginated list of users who liked |
| POST   | `/posts/:post_id/likes`    | Yes  | Toggle like for current user      |

### Comments (`/posts/:post_id/comments`)

| Method | Path                                | Auth | Description                  |
| ------ | ----------------------------------- | ---- | ---------------------------- |
| POST   | `/posts/:post_id/comments`          | Yes  | Add a comment (`text`, `image?`) |
| GET    | `/posts/:post_id/comments`          | Yes  | Paginated comments           |
| GET    | `/posts/:post_id/comments/:id`      | Yes  | Single comment               |
| PATCH  | `/posts/:post_id/comments/:id`      | Yes  | Update a comment             |
| DELETE | `/posts/:post_id/comments/:id`      | Yes  | Delete a comment             |

### Comment replies (`/comments/:comment_id/replies`)

| Method | Path                                  | Auth | Description           |
| ------ | ------------------------------------- | ---- | --------------------- |
| POST   | `/comments/:comment_id/replies`       | Yes  | Reply to a comment    |
| GET    | `/comments/:comment_id/replies`       | Yes  | Paginated replies     |
| GET    | `/comments/:comment_id/replies/:id`   | Yes  | Single reply          |
| PATCH  | `/comments/:comment_id/replies/:id`   | Yes  | Update a reply        |
| DELETE | `/comments/:comment_id/replies/:id`   | Yes  | Delete a reply        |

### Comment likes (`/comments/:comment_id/likes`)

| Method | Path                              | Auth | Description                |
| ------ | --------------------------------- | ---- | -------------------------- |
| GET    | `/comments/:comment_id/likes`     | Yes  | Paginated likers           |
| POST   | `/comments/:comment_id/likes`     | Yes  | Toggle like for current user |

### File upload (`/file-upload`)

| Method | Path                   | Auth | Description                                       |
| ------ | ---------------------- | ---- | ------------------------------------------------ |
| POST   | `/file-upload`         | Yes  | Upload one image (`file`, multipart)             |
| POST   | `/file-upload/multiple`| Yes  | Upload up to 10 images (`files`, multipart)      |

Images only: `jpeg/png/webp/gif`, max **5 MB** each, up to **10** per request.
Returns the Cloudinary URL(s).

## Design decisions & trade-offs

- **Caching is a hard requirement at scale, but not fully enabled yet.** This
  API is read-heavy and intended to serve millions of users, so Redis-backed
  caching is essential rather than optional. The building blocks are already in
  the codebase — `CacheService`, the `HttpCacheInterceptor`, and the
  `InvalidationInterceptor` — and can be wired up for caching. It hasn't been
  fully turned on in deployment yet because of the initial plan to ship this as
  a SaaS platform without managed Redis access; once a Redis instance is
  available, the existing services can be enabled with minimal changes.
- **Cloudinary for image storage instead of S3 (cost trade-off).** AWS S3 would
  be the preferred object store, but Cloudinary was chosen to keep costs down
  for now. Storing uploads on the server's local filesystem was deliberately
  avoided — it doesn't survive horizontal scaling or container restarts and
  would become a liability as traffic grows. Cloudinary keeps storage off the
  app servers and is straightforward to swap for S3 later.
- **Likes now, reactions later.** Only the "like" reaction is implemented for
  the current scope, exposed as a toggle on posts and comments. The
  `post_likes` / `comment_likes` design is extensible — adding a reaction-type
  column would let it support other reactions (love, haha, etc.) without
  reshaping the API.
- **Docker for the database only, for now.** The local Docker Compose setup is
  used to run PostgreSQL (and Redis), but the API container isn't relied on yet
  due to a known issue building the image tied to recent **pnpm** security
  changes. For now the API is run directly (`pnpm start:dev`) against the
  containerised database; the `Dockerfile.prod` path is intended for once that
  pnpm/build issue is resolved.

## Scripts

```bash
pnpm start            # start
pnpm start:dev        # watch mode
pnpm start:prod       # run compiled build (node dist/main)
pnpm build            # nest build
pnpm lint             # eslint --fix
pnpm format           # prettier
pnpm test             # unit tests (jest)
pnpm test:e2e         # e2e tests
pnpm test:cov         # coverage
```

## Testing

Unit specs live next to their subjects (`*.spec.ts`) covering services,
controllers, and helpers (password, token, pagination). E2E tests live under
`test/`. Run `pnpm test` for the unit suite and `pnpm test:e2e` for end-to-end.

## Deployment

Use `Dockerfile.prod` (multi-stage, non-root, `dist/src/main.js`) with
`docker-compose.prod.yaml`. Set production-grade secrets for `JWT_SECRET`, the
database, and Cloudinary, and disable TypeORM `synchronize` in favour of
migrations before going live.
