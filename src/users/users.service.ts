/**
 * UsersService - Business Logic Layer
 *
 * Purpose: Contains the core business logic for user operations.
 * This service sits between the resolver (GraphQL layer) and repository (data layer).
 *
 * Responsibilities:
 * - Password hashing for security (never store plain text passwords)
 * - User verification for authentication
 * - Data validation and transformation
 * - Coordinating with the repository for database operations
 *
 * Why separate Service from Repository?
 * - Service: "What" to do (business rules, validation, security)
 * - Repository: "How" to do it (database operations)
 * This separation makes code more maintainable and testable
 */
import { Injectable, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { CreateUserInput } from './dto/create-user.input';
import { UpdateUserInput } from './dto/update-user.input';
import { UsersRepository } from './users.repository';

@Injectable()
export class UsersService {
  /**
   * Constructor - Dependency Injection
   * @param usersRepository - Injected repository for database operations
   *
   * NestJS automatically provides the UsersRepository instance
   */
  constructor(private readonly usersRepository: UsersRepository) {}

  /**
   * create() - Create a new user (Sign Up)
   *
   * @param createUserInput - User data from GraphQL mutation (email, password, etc.)
   * @returns Created user document from database
   *
   * Security: The password is hashed BEFORE storing in database
   * - Plain text passwords are never stored
   * - We use bcrypt with salt rounds of 10 for strong hashing
   *
   * Flow:
   * 1. Receive user data from resolver
   * 2. Hash the password
   * 3. Store user with hashed password in database
   */
  async create(createUserInput: CreateUserInput) {
    return this.usersRepository.create({
      ...createUserInput, // Spread all user fields (email, username, etc.)
      password: await this.hashPassword(createUserInput.password), // Override password with hashed version
    });
  }

  /**
   * hashPassword() - Hash a plain text password
   *
   * @param password - Plain text password
   * @returns Hashed password string
   *
   * Uses bcrypt with 10 salt rounds:
   * - Salt rounds = 10 means the algorithm runs 2^10 = 1024 times
   * - Higher = more secure but slower (10 is a good balance)
   * - Each hash is unique even for the same password (bcrypt generates random salt)
   *
   * Private method - only used internally within this service
   */
  private hashPassword(password: string) {
    return bcrypt.hash(password, 10);
  }

  /**
   * findAll() - Retrieve all users
   *
   * @returns Array of all user documents
   *
   * Called by GraphQL query to list all users
   * Empty object {} means no filter - get all users
   */
  async findAll() {
    return await this.usersRepository.find({});
  }

  /**
   * findOne() - Retrieve a single user by ID
   *
   * @param _id - MongoDB document ID
   * @returns User document or null if not found
   *
   * Used to fetch user profile by ID
   */
  async findOne(_id: string) {
    return this.usersRepository.findOne({ _id });
  }

  /**
   * update() - Update user information
   *
   * @param _id - User's MongoDB document ID
   * @param updateUserInput - Fields to update
   * @returns Updated user document
   *
   * Security: If password is being updated, it's hashed first
   *
   * The $set operator:
   * - MongoDB operator that sets field values
   * - Only updates specified fields, leaves others unchanged
   */
  async update(_id: string, updateUserInput: UpdateUserInput) {
    // If updating password, hash the new password
    if (updateUserInput.password) {
      updateUserInput.password = await this.hashPassword(updateUserInput.password);
    }

    return this.usersRepository.findOneAndUpdate(
      { _id }, // Filter: find user by ID
      {
        $set: {
          ...updateUserInput, // Update these fields
        },
      },
    );
  }

  /**
   * remove() - Delete a user
   *
   * @param _id - User's MongoDB document ID
   * @returns Deleted user document
   *
   * Permanently removes user from database
   */
  async remove(_id: string) {
    return this.usersRepository.findOneAndDelete({ _id });
  }

  /**
   * verifyUser() - Authenticate user credentials (Login)
   *
   * @param email - User's email address
   * @param password - Plain text password from login attempt
   * @returns User object if credentials are valid
   * @throws UnauthorizedException if email not found or password incorrect
   *
   * This is called by LocalStrategy during authentication
   *
   * Security Flow:
   * 1. Look up user by email
   * 2. If user doesn't exist, throw error (don't reveal which is wrong)
   * 3. Compare provided password with stored hash using bcrypt
   * 4. bcrypt.compare() hashes the plain text password and compares with stored hash
   * 5. If match, return user; if not, throw error
   *
   * Why not reveal if email or password is wrong?
   * - Security best practice: don't help attackers know if email exists
   * - Generic "credentials not valid" message for both cases
   */
  async verifyUser(email: string, password: string) {
    // Step 1: Find user by email
    const user = await this.usersRepository.findOne({ email });

    // Step 2: Check if user exists
    if (!user) {
      throw new UnauthorizedException('Credentials are not valid');
    }

    // Step 3: Verify password
    // bcrypt.compare() handles the hashing and comparison
    // It takes plain text password, hashes it, and compares with stored hash
    const passwordIsValid = await bcrypt.compare(password, user.password);

    // Step 4: Check password validity
    if (!passwordIsValid) {
      throw new UnauthorizedException('Credentials are not valid');
    }

    // Step 5: Success - return user object
    // This user object will be attached to the request by Passport
    return user;
  }
}
