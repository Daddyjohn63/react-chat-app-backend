# Authentication System - Passport, Local Strategy, JWT & Cookies

## Overview

This document explains how the authentication system works in this NestJS application, covering:

- Passport.js integration with NestJS
- Local Strategy for email/password authentication
- JWT token generation and management
- Cookie-based authentication for GraphQL requests
- The complete authentication flow from user creation to authenticated requests

---

## Architecture Components

### 1. **AuthModule** (`src/auth/auth.module.ts`)

The central module that orchestrates all authentication functionality:

```typescript
@Module({
  providers: [AuthService, LocalStrategy],
  imports: [
    UsersModule,
    JwtModule.registerAsync({
      useFactory: (configService: ConfigService) => ({
        secret: configService.getOrThrow('JWT_SECRET'),
        signOptions: {
          expiresIn: Number(configService.getOrThrow('JWT_EXPIRATION')),
        },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
})
```

**Key Components:**

- **LocalStrategy**: Implements the Passport local authentication strategy
- **AuthService**: Handles JWT token generation and cookie creation
- **AuthController**: Exposes REST endpoints for authentication (login)
- **JwtModule**: Configured with secret key and expiration time from environment variables

---

### 2. **LocalStrategy** (`src/auth/strategies/local.strategy.ts`)

Implements Passport's local authentication strategy for email/password verification.

```typescript
@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly usersService: UsersService) {
    super({ usernameField: 'email' });
  }

  async validate(email: string, password: string): Promise<User> {
    try {
      return await this.usersService.verifyUser(email, password);
    } catch (err) {
      throw new UnauthorizedException(err);
    }
  }
}
```

**How it Works:**

1. Extends `PassportStrategy(Strategy)` from `passport-local`
2. Configures `usernameField: 'email'` to use email instead of username
3. Injects `UsersService` to verify credentials
4. The `validate()` method is automatically called by Passport when authentication is triggered
5. If validation succeeds, the User object is attached to the request (`req.user`)
6. If validation fails, throws `UnauthorizedException`

---

### 3. **LocalAuthGuard** (`src/auth/guards/local-auth.guard.ts`)

A simple guard that triggers the Local Strategy.

```typescript
export class LocalAuthGuard extends AuthGuard('local') {}
```

**Purpose:**

- Extends NestJS's `AuthGuard` with the 'local' strategy name
- When applied to a route with `@UseGuards(LocalAuthGuard)`, it triggers the LocalStrategy
- Passport automatically:
  - Extracts `email` and `password` from the request body
  - Calls `LocalStrategy.validate(email, password)`
  - Attaches the returned user to `req.user`

---

### 4. **AuthService** (`src/auth/auth.service.ts`)

Handles JWT token generation and cookie creation.

```typescript
@Injectable()
export class AuthService {
  constructor(
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
  ) {}

  async login(user: User, response: Response) {
    // 1. Calculate expiration time
    const expires = new Date();
    expires.setSeconds(
      expires.getSeconds() + this.configService.getOrThrow<number>('JWT_EXPIRATION'),
    );

    // 2. Create JWT payload with user data
    const tokenPayload: TokenPayload = {
      _id: user._id.toHexString(),
      email: user.email,
    };

    // 3. Sign the JWT token
    const token = await this.jwtService.signAsync(tokenPayload);

    // 4. Set the cookie in the response
    response.cookie('Authentication', token, {
      httpOnly: true, // Prevents JavaScript access (XSS protection)
      expires, // Cookie expiration matches JWT expiration
    });
  }
}
```

**Token Payload (`TokenPayload` interface):**

```typescript
interface TokenPayload {
  _id: string; // User's MongoDB ObjectId
  email: string; // User's email address
}
```

**Cookie Configuration:**

- **Name**: `Authentication`
- **httpOnly**: `true` - Prevents client-side JavaScript from accessing the cookie (protection against XSS attacks)
- **expires**: Matches JWT expiration time (both token and cookie expire together)

---

### 5. **AuthController** (`src/auth/auth.controller.ts`)

Exposes the login endpoint as a REST API.

```typescript
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @UseGuards(LocalAuthGuard)
  async login(@CurrentUser() user: User, @Res({ passthrough: true }) response: Response) {
    await this.authService.login(user, response);
  }
}
```

**Decorators Explained:**

- `@Post('login')`: Creates POST endpoint at `/auth/login`
- `@UseGuards(LocalAuthGuard)`: Triggers Passport local authentication
- `@CurrentUser()`: Custom decorator to extract `req.user` (user attached by Passport)
- `@Res({ passthrough: true })`: Allows access to Express response object while still letting NestJS handle the response

---

### 6. **CurrentUser Decorator** (`src/auth/current-user.decorator.ts`)

A custom parameter decorator to extract the authenticated user from the request.

```typescript
const getCurrentUserByContext = (context: ExecutionContext): User => {
  return context.switchToHttp().getRequest<RequestWithUser>().user;
};

export const CurrentUser = createParamDecorator((_data: unknown, context: ExecutionContext) =>
  getCurrentUserByContext(context),
);
```

**Purpose:**

- Extracts `user` property from the HTTP request
- The user was previously attached to `req.user` by Passport after successful authentication
- Allows clean injection of the current user into controller methods

---

## Complete Authentication Flow

### Flow 1: User Registration (GraphQL Mutation)

User creation happens via GraphQL and does **NOT** automatically generate a JWT token.

```
1. Client → GraphQL Mutation: createUser
   ↓
2. UsersResolver.createUser() receives CreateUserInput
   ↓
3. UsersService.create() is called
   ↓
4. Password is hashed using bcrypt (10 salt rounds)
   ↓
5. UsersRepository.create() saves user to MongoDB
   ↓
6. User document returned to client (password hash NOT exposed in GraphQL)
```

**GraphQL Mutation Example:**

```graphql
mutation {
  createUser(createUserInput: { email: "user@example.com", password: "StrongPassword123!" }) {
    _id
    email
  }
}
```

**Important:**

- No JWT token or cookie is created during registration
- User must login separately to receive an authentication token
- Password is hashed using bcrypt before storage

---

### Flow 2: User Login (REST Endpoint)

Login happens via REST API and generates a JWT token stored in a cookie.

```
1. Client → POST /auth/login
   Body: { email: "user@example.com", password: "StrongPassword123!" }
   ↓
2. LocalAuthGuard is triggered
   ↓
3. Passport extracts email & password from request body
   ↓
4. Passport calls LocalStrategy.validate(email, password)
   ↓
5. LocalStrategy calls UsersService.verifyUser(email, password)
   ↓
6. UsersService:
   - Finds user by email in database
   - Compares password with stored hash using bcrypt.compare()
   - If valid, returns User object
   - If invalid, throws UnauthorizedException
   ↓
7. Passport attaches User to req.user
   ↓
8. AuthController.login() is executed
   - Receives user via @CurrentUser() decorator
   - Receives response object via @Res() decorator
   ↓
9. AuthService.login(user, response) is called
   ↓
10. AuthService:
    - Creates TokenPayload { _id, email }
    - Signs JWT token using JwtService
    - Sets cookie in response with token
   ↓
11. Response sent to client with Set-Cookie header
    ↓
12. Browser automatically stores cookie
```

**Login Request Example:**

```bash
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "StrongPassword123!"
}
```

**Login Response Headers:**

```
HTTP/1.1 201 Created
Set-Cookie: Authentication=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...; HttpOnly; Expires=...
```

---

### Flow 3: How Cookies Travel with GraphQL Requests

Once the user is authenticated and has the cookie, it automatically travels with subsequent requests.

```
1. User logs in → Receives JWT in 'Authentication' cookie
   ↓
2. Browser stores cookie automatically
   ↓
3. Client makes GraphQL request (e.g., query users)
   ↓
4. Browser AUTOMATICALLY includes cookie in request headers
   Cookie: Authentication=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ↓
5. NestJS server receives request with cookie
   ↓
6. (Future implementation) JWT guard will:
   - Extract token from cookie
   - Verify token signature
   - Decode payload { _id, email }
   - Attach user to request
   ↓
7. GraphQL resolver executes with authenticated context
   ↓
8. Response sent back to client
```

**Important CORS Configuration** (`main.ts`):

```typescript
app.enableCors({
  origin: ['https://studio.apollographql.com', /^(http|https):\/\/localhost:\d+$/],
  credentials: true, // CRITICAL: Allows cookies to be sent/received
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
  allowedHeaders: 'Content-Type,Authorization,...',
});
```

**Why `credentials: true` is Critical:**

- Without this, browsers will NOT send cookies with cross-origin requests
- Enables the browser to include the `Authentication` cookie in GraphQL requests
- Must also be set in the Apollo Client configuration (frontend)

---

## User Creation vs Login: Key Difference

### User Creation (GraphQL)

- **Endpoint**: GraphQL mutation `createUser`
- **Purpose**: Register new user account
- **Action**: Store user with hashed password
- **Authentication**: NO token/cookie generated
- **Next Step**: User must login to receive token

### User Login (REST)

- **Endpoint**: REST POST `/auth/login`
- **Purpose**: Authenticate existing user
- **Action**: Verify credentials, generate JWT, set cookie
- **Authentication**: YES - token/cookie created
- **Result**: User can make authenticated requests

---

## How JWT Token Generation is Integrated with User Creation

**Important Clarification:** JWT token generation is **NOT** integrated with the `createUser` method.

### The Two-Step Process:

#### Step 1: User Registration (GraphQL)

```typescript
// UsersResolver
@Mutation(() => User)
createUser(@Args('createUserInput') createUserInput: CreateUserInput) {
  return this.usersService.create(createUserInput);
}

// UsersService
async create(createUserInput: CreateUserInput) {
  return this.usersRepository.create({
    ...createUserInput,
    password: await this.hashPassword(createUserInput.password),
  });
}
```

- User is created with hashed password
- User document is returned
- **NO authentication token is created**

#### Step 2: User Login (REST)

```typescript
// AuthController
@Post('login')
@UseGuards(LocalAuthGuard)
async login(@CurrentUser() user: User, @Res({ passthrough: true }) response: Response) {
  await this.authService.login(user, response);
}

// AuthService
async login(user: User, response: Response) {
  const tokenPayload: TokenPayload = { _id: user._id.toHexString(), email: user.email };
  const token = await this.jwtService.signAsync(tokenPayload);
  response.cookie('Authentication', token, { httpOnly: true, expires });
}
```

- User credentials are verified via LocalStrategy
- JWT token is generated with user's `_id` and `email`
- Token is set as httpOnly cookie
- Cookie automatically sent with future requests

### Why Separate Registration and Login?

1. **Security**: Registration doesn't automatically log user in (prevents account hijacking)
2. **Flexibility**: User might register but not immediately need authentication
3. **Standard Practice**: Most applications require explicit login after registration
4. **Session Management**: Allows better control over when authentication sessions start

### If You Want Auto-Login After Registration

You could modify `UsersResolver.createUser()` to also call `AuthService.login()`:

```typescript
// This is NOT currently implemented, but could be done:
@Mutation(() => User)
async createUser(
  @Args('createUserInput') createUserInput: CreateUserInput,
  @Res({ passthrough: true }) response: Response
) {
  const user = await this.usersService.create(createUserInput);
  await this.authService.login(user, response); // Auto-login after creation
  return user;
}
```

**However**, this is currently **NOT** implemented in your codebase. Users must:

1. Register via GraphQL mutation `createUser`
2. Login via REST endpoint POST `/auth/login`
3. Then make authenticated GraphQL requests with the cookie

---

## Cookie Lifecycle

### 1. Cookie Creation

```typescript
response.cookie('Authentication', token, {
  httpOnly: true,
  expires: new Date(Date.now() + JWT_EXPIRATION_SECONDS * 1000),
});
```

### 2. Cookie Storage

- Browser automatically stores cookie upon receiving `Set-Cookie` header
- Stored in browser's cookie storage (not accessible to JavaScript due to httpOnly)

### 3. Cookie Transmission

- Browser automatically includes cookie in every request to the same domain
- Sent via `Cookie` request header
- No manual intervention needed

### 4. Cookie Expiration

- Cookie expires based on `expires` property
- After expiration, browser automatically deletes cookie
- User must login again to get new cookie

---

## Security Considerations

### Password Security

- **Never stored in plain text**
- Hashed using bcrypt with 10 salt rounds
- bcrypt generates unique hash even for identical passwords (random salt)

### JWT Security

- **Signed with secret key** (JWT_SECRET from environment)
- Token includes `_id` and `email` in payload
- Token has expiration time (JWT_EXPIRATION from environment)
- Cannot be modified without invalidating signature

### Cookie Security

- **httpOnly flag**: Prevents JavaScript access (XSS protection)
- **Automatic transmission**: Browser handles securely
- **Same-origin policy**: Only sent to same domain

### CORS Security

- **credentials: true**: Allows cookie transmission
- **origin whitelist**: Only specified origins can make requests
- **Specific allowed headers**: Limits attack surface

---

## Environment Variables Required

```env
# JWT Configuration
JWT_SECRET=your-super-secret-key-change-in-production
JWT_EXPIRATION=3600  # seconds (1 hour)

# MongoDB
MONGODB_URI=mongodb://localhost:27017/chatter

# Server
PORT=3000
```

---

## Testing the Authentication Flow

### 1. Create a User (GraphQL)

```graphql
mutation {
  createUser(createUserInput: { email: "test@example.com", password: "StrongPass123!" }) {
    _id
    email
  }
}
```

### 2. Login (REST)

```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"StrongPass123!"}' \
  -c cookies.txt
```

### 3. Make Authenticated GraphQL Request

```bash
curl -X POST http://localhost:3000/graphql \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{"query":"{ users { _id email } }"}'
```

---

## Future Enhancements

### JWT Authentication Guard (not yet implemented)

To protect GraphQL resolvers, you'll need to implement:

1. **JwtStrategy** - Extract and verify JWT from cookies
2. **JwtAuthGuard** - Guard to protect routes/resolvers
3. **Apply guard to resolvers** - Require authentication for specific queries/mutations

Example:

```typescript
@Query(() => [User])
@UseGuards(JwtAuthGuard)
findAll(@CurrentUser() user: User) {
  // Only authenticated users can access
  return this.usersService.findAll();
}
```

---

## Summary

1. **User Registration**: GraphQL mutation creates user with hashed password (NO token)
2. **User Login**: REST endpoint verifies credentials and generates JWT cookie
3. **Token in Payload**: JWT contains `{ _id, email }` signed with secret key
4. **Cookie Storage**: Browser automatically stores and sends cookie with requests
5. **GraphQL Requests**: Cookie travels automatically with CORS `credentials: true`
6. **Two Separate Flows**: Registration (GraphQL) and Authentication (REST) are independent

The key insight is that **token generation is NOT integrated into createUser** - it's a separate login flow. Users must explicitly login after registration to receive their authentication token.
