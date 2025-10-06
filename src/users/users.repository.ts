//The UsersRepository class serves as a data access layer specifically for user-related operations in your application. It extends the AbstractRepository class, which provides a generic implementation of CRUD operations.

// Import the AbstractRepository class from the common database module.
// This is a generic repository class that provides basic CRUD operations.
import { AbstractRepository } from 'src/common/database/abstract.repository';

// Import the UserDocument type, which represents the structure of a user document in the database.
import { User } from './entities/user.entity';

// Import Injectable and Logger from NestJS common module.
// Injectable is used to mark this class as a provider that can be injected into other classes.
// Logger is used for logging messages.
import { Injectable, Logger } from '@nestjs/common';

// Import the Model type from Mongoose, which represents a Mongoose model.
import { Model } from 'mongoose';

// Import the InjectModel decorator from NestJS Mongoose package.
// This decorator is used to inject a Mongoose model into the class.
import { InjectModel } from '@nestjs/mongoose';

// Mark the UsersRepository class as injectable, allowing it to be injected into other classes.
@Injectable()
export class UsersRepository extends AbstractRepository<User> {
  // Define a logger instance specific to the UsersRepository class.
  // This logger will be used to log messages related to user repository operations.
  protected readonly logger = new Logger(UsersRepository.name);

  // Constructor for the UsersRepository class.
  // The InjectModel decorator is used to inject the User model into the constructor.
  // The userModel parameter is a Mongoose model for UserDocument.
  constructor(@InjectModel(User.name) userModel: Model<User>) {
    // Call the constructor of the parent class (AbstractRepository) with the userModel.
    // This sets up the repository to use the User model for database operations.
    super(userModel);
  }
}
