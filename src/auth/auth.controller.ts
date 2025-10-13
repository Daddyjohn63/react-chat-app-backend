/**
 * AuthController - REST API Controller for Authentication
 *
 * Purpose: Provides REST endpoints for authentication operations (login, logout, etc.)
 * This controller works alongside GraphQL for a hybrid API approach:
 * - User CRUD operations → GraphQL (UsersResolver)
 * - Authentication operations → REST (AuthController)
 *
 * Why REST for Authentication?
 * - Authentication often involves setting cookies and HTTP headers
 * - REST provides direct access to HTTP request/response objects
 * - Simpler integration with Passport.js guards
 *
 * Base Route: /auth (all endpoints prefixed with /auth)
 */
import { Controller, Post, Res, UseGuards } from '@nestjs/common';
import type { Response } from 'express';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { CurrentUser } from './current-user.decorator';
import { User } from '../users/entities/user.entity';
import { AuthService } from './auth.service';

/**
 * @Controller('auth') - Defines this as a REST controller with base path '/auth'
 * All routes in this controller will be prefixed with /auth
 * Example: @Post('login') becomes POST /auth/login
 */
@Controller('auth')
export class AuthController {
  /**
   * Constructor - Dependency Injection
   * @param authService - Injected service to handle JWT token generation and cookie management
   *
   * NestJS automatically provides an instance of AuthService
   */
  constructor(private readonly authService: AuthService) {}

  /**
   * login() - User Login Endpoint
   *
   * Route: POST /auth/login
   * Purpose: Authenticate user credentials and issue JWT token as httpOnly cookie
   *
   * Flow:
   * 1. Client sends POST request with { email, password } in body
   * 2. @UseGuards(LocalAuthGuard) triggers Passport local authentication:
   *    - Extracts email & password from request body
   *    - Calls LocalStrategy.validate(email, password)
   *    - LocalStrategy calls UsersService.verifyUser(email, password)
   *    - If valid: User object attached to req.user
   *    - If invalid: Throws UnauthorizedException (401)
   * 3. @CurrentUser() decorator extracts user from req.user
   * 4. @Res({ passthrough: true }) provides access to Express response object
   *    - passthrough: true lets NestJS still handle the response automatically
   *    - We need this to set cookies via response.cookie()
   * 5. AuthService.login() generates JWT and sets it as cookie
   * 6. Response sent with Set-Cookie header containing JWT
   *
   * Request Body:
   * {
   *   "email": "user@example.com",
   *   "password": "UserPassword123!"
   * }
   *
   * Response:
   * - HTTP Status: 201 Created (POST default in NestJS)
   * - Headers: Set-Cookie: Authentication=<jwt-token>; HttpOnly; Expires=...
   * - Body: Empty (login() is async void, no return value)
   *
   * Security:
   * - Password verified using bcrypt (UsersService.verifyUser)
   * - JWT token signed with secret key (AuthService.login)
   * - Cookie set with httpOnly flag (prevents XSS attacks)
   *
   * @param user - Authenticated user object (injected by @CurrentUser decorator)
   *                This is only available if LocalAuthGuard succeeds
   * @param response - Express response object to set cookies
   */
  @Post('login')
  @UseGuards(LocalAuthGuard)
  async login(@CurrentUser() user: User, @Res({ passthrough: true }) response: Response) {
    await this.authService.login(user, response);
  }
}
