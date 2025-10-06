//The DatabaseModule is responsible for setting up the database connection using Mongoose. It provides a static forFeature method that allows other modules to register Mongoose models with the module.

// Import the Module decorator from NestJS, which is used to define a module.
import { Module } from '@nestjs/common';

// Import the ConfigService from NestJS, which provides access to environment variables and configuration settings.
import { ConfigService } from '@nestjs/config';

// Import ModelDefinition and MongooseModule from the NestJS Mongoose package.
// ModelDefinition is used to define Mongoose models, and MongooseModule provides integration with Mongoose.
import { ModelDefinition, MongooseModule } from '@nestjs/mongoose';
import { DbMigrationService } from './db-migration.service';

// Define a NestJS module using the @Module decorator.
// This module is responsible for setting up the database connection using Mongoose.
@Module({
  imports: [
    // Use MongooseModule.forRootAsync to configure the database connection asynchronously.
    // This allows the use of dynamic configuration, such as environment variables.
    MongooseModule.forRootAsync({
      // useFactory is a function that returns the configuration object for the database connection.
      // It receives the ConfigService as an argument, which is used to access configuration settings.
      useFactory: (configService: ConfigService) => ({
        // Get the MongoDB URI from the configuration service.
        // This URI is used to connect to the MongoDB database.
        uri: configService.get('MONGODB_URI'),
      }),
      // Inject the ConfigService into the useFactory function.
      // This allows the function to access configuration settings.
      inject: [ConfigService],
    }),
  ],
  providers: [DbMigrationService],
})
export class DatabaseModule {
  // Define a static method forFeature that takes an array of ModelDefinition objects.
  // This method is used to register Mongoose models with the module.
  static forFeature(models: ModelDefinition[]) {
    // Return the result of MongooseModule.forFeature, which registers the models with Mongoose.
    return MongooseModule.forFeature(models);
  }
}
