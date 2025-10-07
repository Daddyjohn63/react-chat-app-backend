/**
 * UsersModule - User Management Module
 *
 * Purpose: This module handles all user-related operations including:
 * - Creating new users (signup)
 * - Reading user data
 * - Updating user information
 * - Deleting users
 * - Verifying user credentials (used by authentication)
 *
 * Architecture Pattern: This follows the NestJS layered architecture
 * - Resolver: GraphQL entry point (handles incoming GraphQL queries/mutations)
 * - Service: Business logic layer (validation, password hashing, etc.)
 * - Repository: Data access layer (MongoDB operations)
 */
import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersResolver } from './users.resolver';
import { UsersRepository } from './users.repository';
import { DatabaseModule } from 'src/common/database/database.module';
import { User, UserSchema } from './entities/user.entity';

@Module({
  /**
   * Imports: Set up database connection for User entity
   *
   * DatabaseModule.forFeature() registers the User model with Mongoose
   * - name: 'User' - The model name used in the database
   * - schema: UserSchema - Mongoose schema defining the structure of User documents
   *
   * This makes the User model available for injection into UsersRepository
   */
  imports: [DatabaseModule.forFeature([{ name: User.name, schema: UserSchema }])],

  /**
   * Providers: Services available within this module
   * - UsersResolver: Handles GraphQL queries/mutations for users
   * - UsersService: Contains business logic (password hashing, validation)
   * - UsersRepository: Handles direct database operations
   */
  providers: [UsersResolver, UsersService, UsersRepository],

  /**
   * Exports: Services made available to other modules
   *
   * UsersService is exported so that other modules (like AuthModule) can use it.
   * This is crucial because:
   * - AuthModule needs UsersService to verify credentials during login
   * - Other modules might need to access user data
   *
   * By exporting, any module that imports UsersModule can inject UsersService
   */
  exports: [UsersService],
})
export class UsersModule {}
