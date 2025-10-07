/**
 * LocalStrategy - Passport Local Authentication Strategy
 *
 * Purpose: This strategy handles username/password authentication for login.
 * It extends PassportStrategy from @nestjs/passport which integrates Passport.js
 * with NestJS's dependency injection system.
 *
 * Flow:
 * 1. When a user attempts to login, Passport calls the validate() method
 * 2. validate() receives the credentials from the request body
 * 3. It delegates verification to UsersService.verifyUser()
 * 4. If successful, the User object is returned and attached to the request
 * 5. If failed, an UnauthorizedException is thrown
 */
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { User } from 'src/users/entities/user.entity';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  /**
   * Constructor
   * @param usersService - Injected service to verify user credentials
   * super() calls the parent class's constructor to properly initialize the inherited parts * of the Strategy class.
   * The super() call configures the strategy:
   * - usernameField: 'email' tells Passport to look for 'email' field instead of 'username'
   *   in the request body (since we're using email-based authentication)
   */
  constructor(private readonly usersService: UsersService) {
    super({
      usernameField: 'email', // By default, passport-local expects 'username', we override it to 'email'
    });
  }

  /**
   * validate() - Core authentication method
   *
   * This method is automatically called by Passport when using LocalStrategy.
   * Passport extracts the email and password from the request body and passes them here.
   *
   * @param email - User's email from request body
   * @param password - User's plain text password from request body
   * @returns User object if authentication succeeds
   * @throws UnauthorizedException if credentials are invalid
   *
   * If this method returns a user object, Passport will:
   * 1. Attach it to the request object (req.user)
   * 2. Consider the authentication successful
   *
   * If it throws an error, authentication fails.
   */
  async validate(email: string, password: string): Promise<User> {
    try {
      // Delegate the actual verification logic to UsersService
      // This service will check if user exists and password matches
      return await this.usersService.verifyUser(email, password);
    } catch (err) {
      // If verification fails, wrap the error in UnauthorizedException
      // This ensures proper HTTP status code (401) is returned
      throw new UnauthorizedException(err);
    }
  }
}
