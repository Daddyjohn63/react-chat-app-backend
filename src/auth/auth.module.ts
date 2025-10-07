/**
 * AuthModule - Authentication Module
 *
 * Purpose: This module encapsulates all authentication-related functionality.
 * It brings together authentication strategies, services, and dependencies.
 *
 * Architecture:
 * - Imports UsersModule to access UsersService for user verification
 * - Provides LocalStrategy to enable passport-local authentication
 * - Provides AuthService for additional auth business logic (like JWT generation)
 *
 * This module should be imported in AppModule to enable authentication
 * throughout the application.
 */
import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalStrategy } from './strategies/local.strategy';
import { UsersModule } from 'src/users/users.module';

@Module({
  /**
   * Providers: Services and strategies that this module provides
   * - AuthService: Contains authentication business logic
   * - LocalStrategy: Passport strategy for email/password authentication
   *
   * These are registered with NestJS's dependency injection container
   * and can be injected into other classes within this module
   */
  providers: [AuthService, LocalStrategy],

  /**
   * Imports: Other modules that this module depends on
   * - UsersModule: We need this because LocalStrategy depends on UsersService
   *   UsersModule exports UsersService, making it available here
   *
   * Without this import, LocalStrategy wouldn't be able to inject UsersService
   */
  imports: [UsersModule],
})
export class AuthModule {}
