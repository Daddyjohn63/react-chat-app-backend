# Chatter Backend - Comprehensive Architecture Documentation

## Table of Contents

1. [Overview](#overview)
2. [Technology Stack](#technology-stack)
3. [Folder and File Architecture](#folder-and-file-architecture)
4. [Architecture Diagram](#architecture-diagram)
5. [Data Flow Explanation](#data-flow-explanation)
6. [GraphQL Schema and Types](#graphql-schema-and-types)
7. [Class Structure and Design Patterns](#class-structure-and-design-patterns)
8. [Core Components Deep Dive](#core-components-deep-dive)
9. [Security Features](#security-features)
10. [Database and Migrations](#database-and-migrations)

---

## Overview

The **Chatter Backend** is a real-time chat application backend built with **NestJS**, **GraphQL**, and **MongoDB**. At this stage, the application has implemented a foundational user management system with the following capabilities:

### What Has Been Built So Far:

- ✅ **User Management System**: Complete CRUD operations for users
- ✅ **GraphQL API**: Code-first approach with auto-generated schema
- ✅ **MongoDB Integration**: Using Mongoose ODM with MongoDB
- ✅ **Repository Pattern**: Abstracted database operations
- ✅ **Password Security**: Bcrypt hashing for passwords
- ✅ **Validation**: Class-validator for input validation
- ✅ **Logging**: Structured logging with Pino
- ✅ **CORS Configuration**: Apollo Studio and localhost support
- ✅ **Database Migrations**: Automated migration system with unique email index
- ✅ **Environment Configuration**: Type-safe configuration with validation

---

## Technology Stack

### Core Technologies

| Technology        | Version | Purpose                                              |
| ----------------- | ------- | ---------------------------------------------------- |
| **NestJS**        | 11.0.1  | Backend framework providing structure and modularity |
| **GraphQL**       | 16.11.0 | API query language for flexible data fetching        |
| **Apollo Server** | 5.0.0   | GraphQL server implementation                        |
| **MongoDB**       | 6.20.0  | NoSQL database for data persistence                  |
| **Mongoose**      | 8.18.3  | MongoDB ODM (Object Data Modeling)                   |
| **TypeScript**    | 5.7.3   | Type-safe JavaScript superset                        |

### Supporting Libraries

- **bcrypt**: Password hashing and security
- **class-validator**: Input validation decorators
- **class-transformer**: Object transformation
- **joi**: Configuration schema validation
- **nestjs-pino**: Structured logging
- **migrate-mongo**: Database migration tool

---

## Folder and File Architecture

### Directory Structure Overview

```
chatter-backend/
│
├── src/                          # Source code directory
│   ├── main.ts                   # Application entry point
│   ├── app.module.ts            # Root module
│   ├── app.controller.ts        # Root controller (basic health check)
│   ├── app.service.ts           # Root service
│   ├── schema.gql               # Auto-generated GraphQL schema
│   │
│   ├── common/                   # Shared/reusable code
│   │   └── database/            # Database infrastructure
│   │       ├── database.module.ts         # Database connection module
│   │       ├── abstract.entity.ts         # Base entity class
│   │       ├── abstract.repository.ts     # Base repository class
│   │       └── db-migration.service.ts    # Migration runner service
│   │
│   ├── users/                    # User feature module
│   │   ├── users.module.ts              # User module definition
│   │   ├── users.service.ts             # Business logic layer
│   │   ├── users.resolver.ts            # GraphQL API layer
│   │   ├── users.repository.ts          # Data access layer
│   │   │
│   │   ├── entities/                    # Database models
│   │   │   └── user.entity.ts           # User entity/schema
│   │   │
│   │   └── dto/                         # Data Transfer Objects
│   │       ├── create-user.input.ts     # User creation input
│   │       └── update-user.input.ts     # User update input
│   │
│   └── migrations/               # Database migrations
│       └── user-email-index.ts   # Creates unique email index
│
├── dist/                         # Compiled JavaScript output
├── test/                         # E2E tests
├── documentation/                # Project documentation
├── package.json                  # Dependencies and scripts
├── tsconfig.json                # TypeScript configuration
└── nest-cli.json                # NestJS CLI configuration
```

### File Responsibilities

#### **Entry Point Layer**

- **`main.ts`**: Bootstrap the application, configure CORS, validation pipes, logging, and start the server

#### **Core Module Layer**

- **`app.module.ts`**: Root module that imports and configures all features (GraphQL, Database, Users, Config, Logger)
- **`app.controller.ts`**: Basic HTTP controller (serves "Hello World" at root)
- **`app.service.ts`**: Basic service for the root controller

#### **Common/Infrastructure Layer**

- **`database.module.ts`**: Sets up MongoDB connection via Mongoose
- **`abstract.entity.ts`**: Base class for all database entities (provides `_id` field)
- **`abstract.repository.ts`**: Generic repository with CRUD operations (create, find, update, delete)
- **`db-migration.service.ts`**: Runs database migrations on application startup

#### **Feature Layer (Users)**

- **`users.module.ts`**: Registers User entity, service, resolver, and repository
- **`users.resolver.ts`**: GraphQL API endpoints (queries and mutations)
- **`users.service.ts`**: Business logic (password hashing, user operations)
- **`users.repository.ts`**: Database operations (extends AbstractRepository)
- **`user.entity.ts`**: Defines User schema for MongoDB and GraphQL
- **DTOs**: Input validation for creating and updating users

#### **Migration Layer**

- **`user-email-index.ts`**: Creates unique index on email field in users collection

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                              │
│                  (React UI / Apollo Studio)                      │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             │ GraphQL Queries/Mutations
                             │
┌────────────────────────────▼────────────────────────────────────┐
│                     API GATEWAY LAYER                            │
│                                                                   │
│  ┌─────────────┐       ┌──────────────────────────────────┐    │
│  │   main.ts   │──────▶│      Apollo GraphQL Server        │    │
│  │  (Bootstrap)│       │   (Schema Auto-generation)        │    │
│  └─────────────┘       └──────────────────────────────────┘    │
│                                                                   │
│  Middleware:                                                     │
│  • CORS Configuration                                            │
│  • Global Validation Pipe (class-validator)                     │
│  • Pino Logger                                                   │
│  • Environment Config Validation (Joi)                          │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             │
┌────────────────────────────▼────────────────────────────────────┐
│                      RESOLVER LAYER                              │
│                   (GraphQL API Handlers)                         │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │              UsersResolver                                │  │
│  │  ┌─────────────────────────────────────────────────┐     │  │
│  │  │  Queries:                                        │     │  │
│  │  │  • users() → [User!]!                          │     │  │
│  │  │  • user(_id) → User!                           │     │  │
│  │  │                                                  │     │  │
│  │  │  Mutations:                                      │     │  │
│  │  │  • createUser(CreateUserInput) → User!         │     │  │
│  │  │  • updateUser(UpdateUserInput) → User!         │     │  │
│  │  │  • removeUser(_id) → User!                     │     │  │
│  │  └─────────────────────────────────────────────────┘     │  │
│  └──────────────────────────────────────────────────────────┘  │
│                             │                                    │
│                             │ Delegates to                       │
└─────────────────────────────┼────────────────────────────────────┘
                              │
┌─────────────────────────────▼────────────────────────────────────┐
│                      SERVICE LAYER                                │
│                    (Business Logic)                               │
│                                                                    │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │              UsersService                                 │   │
│  │  ┌─────────────────────────────────────────────────┐     │   │
│  │  │  Business Logic:                                 │     │   │
│  │  │  • create() - Hash password with bcrypt (10)   │     │   │
│  │  │  • findAll() - Retrieve all users              │     │   │
│  │  │  • findOne() - Get user by ID                  │     │   │
│  │  │  • update() - Hash password if changed         │     │   │
│  │  │  • remove() - Delete user                      │     │   │
│  │  └─────────────────────────────────────────────────┘     │   │
│  └──────────────────────────────────────────────────────────┘   │
│                             │                                     │
│                             │ Delegates to                        │
└─────────────────────────────┼─────────────────────────────────────┘
                              │
┌─────────────────────────────▼─────────────────────────────────────┐
│                    REPOSITORY LAYER                                │
│                  (Data Access Layer)                               │
│                                                                     │
│  ┌──────────────────────────────────────────────────────────┐    │
│  │         UsersRepository extends AbstractRepository       │    │
│  │  ┌─────────────────────────────────────────────────┐     │    │
│  │  │  Inherited CRUD Operations:                      │     │    │
│  │  │  • create(document) → Creates with _id          │     │    │
│  │  │  • findOne(filter) → Find single document       │     │    │
│  │  │  • find(filter) → Find multiple documents       │     │    │
│  │  │  • findOneAndUpdate(filter, update)             │     │    │
│  │  │  • findOneAndDelete(filter)                     │     │    │
│  │  │                                                   │     │    │
│  │  │  • Built-in logging and error handling          │     │    │
│  │  └─────────────────────────────────────────────────┘     │    │
│  └──────────────────────────────────────────────────────────┘    │
│                             │                                      │
│                             │ Uses Mongoose Model                  │
└─────────────────────────────┼──────────────────────────────────────┘
                              │
┌─────────────────────────────▼──────────────────────────────────────┐
│                      ENTITY/SCHEMA LAYER                            │
│                   (Data Models & Schemas)                           │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────┐     │
│  │  User Entity (extends AbstractEntity)                    │     │
│  │  ┌────────────────────────────────────────────────┐      │     │
│  │  │  Fields:                                        │      │     │
│  │  │  • _id: ObjectId (from AbstractEntity)        │      │     │
│  │  │  • email: string (indexed, unique)            │      │     │
│  │  │  • password: string (hashed, not in GQL)      │      │     │
│  │  │                                                 │      │     │
│  │  │  Decorators:                                    │      │     │
│  │  │  • @Schema() - Mongoose schema                 │      │     │
│  │  │  • @ObjectType() - GraphQL type                │      │     │
│  │  │  • @Prop() - Mongoose property                 │      │     │
│  │  │  • @Field() - GraphQL field                    │      │     │
│  │  └────────────────────────────────────────────────┘      │     │
│  │                                                            │     │
│  │  UserSchema = SchemaFactory.createForClass(User)         │     │
│  └──────────────────────────────────────────────────────────┘     │
└─────────────────────────────┬──────────────────────────────────────┘
                              │
┌─────────────────────────────▼──────────────────────────────────────┐
│                      DATABASE LAYER                                 │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────┐     │
│  │                   MongoDB Atlas/Local                     │     │
│  │  ┌────────────────────────────────────────────────┐      │     │
│  │  │  Collections:                                   │      │     │
│  │  │  • users (email has unique index)              │      │     │
│  │  │  • changelog (migration history)               │      │     │
│  │  │                                                  │      │     │
│  │  │  Connection: MongooseModule.forRootAsync()     │      │     │
│  │  │  URI from environment: MONGODB_URI             │      │     │
│  │  └────────────────────────────────────────────────┘      │     │
│  └──────────────────────────────────────────────────────────┘     │
└────────────────────────────────────────────────────────────────────┘

                    ┌─────────────────────────┐
                    │   MIGRATION SYSTEM      │
                    │                         │
                    │  DbMigrationService     │
                    │  • Runs on startup      │
                    │  • Creates indexes      │
                    │  • Tracks in changelog  │
                    └─────────────────────────┘
```

---

## Data Flow Explanation

### Request Flow (Creating a User Example)

```
1. CLIENT INITIATES REQUEST
   ↓
   GraphQL Mutation:
   mutation {
     createUser(createUserInput: {
       email: "user@example.com"
       password: "StrongP@ss123"
     }) {
       _id
       email
     }
   }

2. API GATEWAY LAYER (main.ts)
   ↓
   • Request hits Apollo GraphQL Server
   • CORS validation passes (Apollo Studio/localhost allowed)
   • Global ValidationPipe validates input
   • Pino logger logs the request

3. RESOLVER LAYER (users.resolver.ts)
   ↓
   @Mutation(() => User)
   createUser(@Args('createUserInput') createUserInput: CreateUserInput)

   • Resolver receives validated CreateUserInput
   • Input validation decorators check:
     - @IsEmail() ensures valid email format
     - @IsStrongPassword() ensures password strength
   • Delegates to UsersService

4. SERVICE LAYER (users.service.ts)
   ↓
   async create(createUserInput: CreateUserInput)

   • Business logic executes:
     a. Hashes password using bcrypt.hash(password, 10)
     b. Creates new user object with hashed password
   • Delegates to UsersRepository

5. REPOSITORY LAYER (users.repository.ts)
   ↓
   async create(document: Omit<User, '_id'>)

   • Generates new ObjectId for _id
   • Creates Mongoose document
   • Saves to database
   • Returns saved document as JSON

6. DATABASE LAYER (MongoDB)
   ↓
   • Validates unique email constraint (index)
   • Stores document in 'users' collection
   • Returns saved document

7. RESPONSE FLOWS BACK UP
   ↓
   Repository → Service → Resolver → GraphQL → Client

   Response:
   {
     "data": {
       "createUser": {
         "_id": "507f1f77bcf86cd799439011",
         "email": "user@example.com"
       }
     }
   }
```

### Query Flow (Fetching Users)

```
1. GraphQL Query Request
   ↓
   query {
     users {
       _id
       email
     }
   }

2. UsersResolver.findAll()
   ↓
   • No input validation needed
   • Calls usersService.findAll()

3. UsersService.findAll()
   ↓
   • Calls usersRepository.find({})
   • Empty filter = all documents

4. UsersRepository.find({})
   ↓
   • Executes model.find({}).lean<T[]>()
   • .lean() returns plain JavaScript objects (faster)

5. MongoDB returns all user documents
   ↓
   • Documents flow back through layers
   • GraphQL automatically excludes 'password' field
     (not marked with @Field decorator)

6. Client receives array of users
```

---

## GraphQL Schema and Types

### Auto-Generated Schema (`schema.gql`)

The application uses **code-first** approach where TypeScript classes generate the GraphQL schema automatically:

```graphql
# INPUT TYPES - For client to send data

input CreateUserInput {
  email: String! # Required, validated with @IsEmail()
  password: String! # Required, validated with @IsStrongPassword()
}

input UpdateUserInput {
  _id: String! # Required, identifies user to update
  email: String # Optional, can update email
  password: String # Optional, can update password
}

# OBJECT TYPES - For server responses

type User {
  _id: ID! # MongoDB ObjectId as GraphQL ID
  email: String! # User's email address
  # Note: password is NOT exposed (no @Field decorator)
}

# QUERIES - Read operations

type Query {
  users: [User!]! # Returns array of all users
  user(_id: String!): User! # Returns single user by ID
}

# MUTATIONS - Write operations

type Mutation {
  createUser(createUserInput: CreateUserInput!): User!
  updateUser(updateUserInput: UpdateUserInput!): User!
  removeUser(_id: String!): User!
}
```

### How Schema Generation Works

1. **Decorators Drive Schema**:
   - `@ObjectType()` → Creates GraphQL `type`
   - `@InputType()` → Creates GraphQL `input`
   - `@Field()` → Exposes property in schema
   - `@Query()` → Creates query operation
   - `@Mutation()` → Creates mutation operation

2. **Type Safety**:

   ```typescript
   // TypeScript class
   @ObjectType()
   export class User extends AbstractEntity {
     @Field() // ← Exposed in GraphQL
     email: string;

     @Prop() // ← Only in MongoDB, not in GraphQL
     password: string;
   }
   ```

3. **Input Validation Integration**:

   ```typescript
   @InputType()
   export class CreateUserInput {
     @Field()
     @IsEmail() // ← Validates email format
     email: string;

     @Field()
     @IsStrongPassword() // ← Validates password strength
     password: string;
   }
   ```

### Schema Features

| Feature             | Implementation                      | Purpose                                     |
| ------------------- | ----------------------------------- | ------------------------------------------- |
| **Nullable Fields** | `email: String!` vs `email: String` | `!` = required, no `!` = optional           |
| **Array Types**     | `[User!]!`                          | Array cannot be null, items cannot be null  |
| **ID Type**         | `_id: ID!`                          | Special scalar for unique identifiers       |
| **Partial Types**   | `PartialType(CreateUserInput)`      | Makes all fields optional (UpdateUserInput) |
| **Auto-sorting**    | `sortSchema: true` in config        | Alphabetically sorted schema output         |

---

## Class Structure and Design Patterns

### 1. **Abstract Base Classes Pattern**

#### AbstractEntity (Base for all entities)

```typescript
@Schema()
@ObjectType({ isAbstract: true })
export class AbstractEntity {
  @Prop({ type: SchemaTypes.ObjectId })
  @Field(() => ID)
  _id: Types.ObjectId;
}
```

**Purpose**:

- Provides consistent `_id` field for all entities
- Works with both Mongoose (database) and GraphQL (API)
- `isAbstract: true` means it won't appear in GraphQL schema directly

**How it works**:

- Every entity (like User) extends this class
- Inherits the `_id` field automatically
- Mongoose decorator `@Prop()` stores it in MongoDB
- GraphQL decorator `@Field()` exposes it in API

#### AbstractRepository (Base for all repositories)

```typescript
export abstract class AbstractRepository<T extends AbstractEntity> {
  protected abstract readonly logger: Logger;

  constructor(protected readonly model: Model<T>) {}

  async create(document: Omit<T, '_id'>): Promise<T> {
    const createdDocument = new this.model({
      ...document,
      _id: new Types.ObjectId(), // Auto-generate MongoDB ObjectId
    });
    return (await createdDocument.save()).toJSON() as unknown as T;
  }

  async findOne(filterQuery: FilterQuery<T>): Promise<T | null> {
    const document = await this.model.findOne(filterQuery).lean<T>();
    if (!document) {
      this.logger.warn('Document not found with filterQuery', filterQuery);
      throw new NotFoundException('Document not found');
    }
    return document;
  }

  // ... other CRUD methods
}
```

**Purpose**:

- Generic repository providing CRUD operations for any entity
- Eliminates code duplication across repositories
- Enforces consistent error handling and logging

**Generic Type `<T>`**:

- `T extends AbstractEntity` ensures all entities have `_id`
- Allows type-safe operations for any entity type
- Example: `AbstractRepository<User>` knows about User properties

**Key Methods**:

- `create()`: Generates ObjectId, saves to DB
- `findOne()`: Finds single document, throws if not found
- `findOneAndUpdate()`: Updates and returns updated document
- `find()`: Returns array of documents
- `findOneAndDelete()`: Deletes and returns deleted document

### 2. **Dependency Injection Pattern**

NestJS uses dependency injection throughout:

```typescript
// UsersResolver depends on UsersService
@Resolver(() => User)
export class UsersResolver {
  constructor(private readonly usersService: UsersService) {}
  // Constructor injection
}

// UsersService depends on UsersRepository
@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UsersRepository) {}
}

// UsersRepository depends on Mongoose Model
@Injectable()
export class UsersRepository extends AbstractRepository<User> {
  constructor(@InjectModel(User.name) userModel: Model<User>) {
    super(userModel);
  }
}
```

**Benefits**:

- Loose coupling between layers
- Easy to test (can mock dependencies)
- Automatic instantiation by NestJS IoC container

### 3. **Module Pattern**

Each feature is organized as a self-contained module:

```typescript
@Module({
  imports: [
    // Register User model with Mongoose
    DatabaseModule.forFeature([
      {
        name: User.name,
        schema: UserSchema,
      },
    ]),
  ],
  providers: [
    UsersResolver, // GraphQL API
    UsersService, // Business logic
    UsersRepository, // Data access
  ],
})
export class UsersModule {}
```

**Module Hierarchy**:

```
AppModule (Root)
  ├── ConfigModule (Global)
  ├── GraphQLModule (Global)
  ├── DatabaseModule (Global)
  ├── LoggerModule (Global)
  └── UsersModule (Feature)
      ├── UsersResolver
      ├── UsersService
      └── UsersRepository
```

### 4. **DTO (Data Transfer Object) Pattern**

DTOs define the shape of data crossing boundaries:

```typescript
// Input DTO for creating users
@InputType()
export class CreateUserInput {
  @Field()
  @IsEmail()
  email: string;

  @Field()
  @IsStrongPassword()
  password: string;
}

// Input DTO for updating users
@InputType()
export class UpdateUserInput extends PartialType(CreateUserInput) {
  @Field()
  _id: string;
}
```

**Why DTOs**:

- **Validation**: Decorators validate incoming data
- **Type Safety**: TypeScript ensures correct types
- **GraphQL Integration**: Auto-generates input types in schema
- **Security**: Controls what data clients can send

**PartialType Utility**:

- Makes all fields from CreateUserInput optional
- Adds `_id` field for identifying user to update
- Reduces code duplication

### 5. **Layered Architecture Pattern**

The app follows strict separation of concerns:

```
┌─────────────────────────────────────────┐
│  RESOLVER LAYER (API)                   │
│  • Handles GraphQL requests             │
│  • Validates input with DTOs            │
│  • Returns GraphQL responses            │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│  SERVICE LAYER (Business Logic)         │
│  • Password hashing                     │
│  • Business rules                       │
│  • Orchestrates operations              │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│  REPOSITORY LAYER (Data Access)         │
│  • CRUD operations                      │
│  • Database queries                     │
│  • Error handling                       │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│  DATABASE LAYER (MongoDB)               │
│  • Data persistence                     │
│  • Indexes and constraints              │
└─────────────────────────────────────────┘
```

**Responsibilities**:

- **Resolver**: Request/response, validation
- **Service**: Business logic, transformations
- **Repository**: Database operations only
- **Database**: Storage and constraints

---

## Core Components Deep Dive

### 1. Application Bootstrap (`main.ts`)

```typescript
async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });

  // CORS Configuration
  app.enableCors({
    origin: ['https://studio.apollographql.com', /^(http|https):\/\/localhost:\d+$/],
    credentials: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: 'Content-Type,Authorization,...',
  });

  // Global Validation
  app.useGlobalPipes(new ValidationPipe());

  // Logging
  app.useLogger(app.get(Logger));

  // Start Server
  const configService = app.get(ConfigService);
  await app.listen(configService.getOrThrow<number>('PORT'));
}
```

**Key Features**:

- **Buffer Logs**: Delays logging until logger is ready
- **CORS**: Allows Apollo Studio and localhost (any port)
- **Validation Pipe**: Automatically validates all DTOs
- **Pino Logger**: Structured JSON logging (pretty in dev, JSON in prod)
- **Config Service**: Type-safe environment variable access

### 2. Root Module Configuration (`app.module.ts`)

```typescript
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        MONGODB_URI: Joi.string().required(),
      }),
    }),
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
      sortSchema: true,
      introspection: true,
      playground: false,
    }),
    DatabaseModule,
    UsersModule,
    LoggerModule.forRootAsync({...}),
  ],
})
```

**Module Breakdown**:

| Module             | Configuration                      | Purpose                             |
| ------------------ | ---------------------------------- | ----------------------------------- |
| **ConfigModule**   | `isGlobal: true`                   | Makes config available everywhere   |
|                    | `validationSchema: Joi.object()`   | Validates env vars on startup       |
| **GraphQLModule**  | `autoSchemaFile: 'src/schema.gql'` | Generates schema file automatically |
|                    | `sortSchema: true`                 | Alphabetically sorted schema        |
|                    | `playground: false`                | Disabled (Apollo Studio used)       |
| **DatabaseModule** | Custom `forFeature()` method       | Registers Mongoose models           |
| **LoggerModule**   | Environment-based config           | Pretty logs in dev, JSON in prod    |

### 3. Database Module (`database.module.ts`)

```typescript
@Module({
  imports: [
    MongooseModule.forRootAsync({
      useFactory: (configService: ConfigService) => ({
        uri: configService.get('MONGODB_URI'),
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [DbMigrationService],
})
export class DatabaseModule {
  static forFeature(models: ModelDefinition[]) {
    return MongooseModule.forFeature(models);
  }
}
```

**How It Works**:

1. **Connection**: `forRootAsync()` connects to MongoDB using URI from env
2. **Migration Service**: Runs migrations on module init
3. **Model Registration**: `forFeature()` registers entity schemas

**Usage in Feature Modules**:

```typescript
@Module({
  imports: [DatabaseModule.forFeature([{ name: User.name, schema: UserSchema }])],
})
export class UsersModule {}
```

### 4. User Entity (`user.entity.ts`)

```typescript
@Schema({ versionKey: false }) // Mongoose schema
@ObjectType() // GraphQL type
export class User extends AbstractEntity {
  @Prop() // MongoDB property
  @Field() // GraphQL field
  email: string;

  @Prop() // Only in MongoDB
  password: string; // NOT in GraphQL (security)
}

export const UserSchema = SchemaFactory.createForClass(User);
```

**Dual Purpose**:

- **Mongoose Schema**: Defines MongoDB document structure
- **GraphQL Type**: Defines API response shape

**Decorator Combinations**:
| Decorators | Result |
|------------|--------|
| `@Prop()` + `@Field()` | In DB and API (email) |
| `@Prop()` only | Only in DB (password) |
| `@Schema()` | Creates Mongoose schema |
| `@ObjectType()` | Creates GraphQL type |

### 5. Users Service (Business Logic)

```typescript
@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UsersRepository) {}

  async create(createUserInput: CreateUserInput) {
    return this.usersRepository.create({
      ...createUserInput,
      password: await this.hashPassword(createUserInput.password),
    });
  }

  private hashPassword(password: string) {
    return bcrypt.hash(password, 10); // 10 rounds of hashing
  }

  async update(_id: string, updateUserInput: UpdateUserInput) {
    if (updateUserInput.password) {
      updateUserInput.password = await this.hashPassword(updateUserInput.password);
    }
    return this.usersRepository.findOneAndUpdate({ _id }, { $set: { ...updateUserInput } });
  }
}
```

**Business Logic**:

- **Password Security**: Always hash before saving
- **Conditional Hashing**: Only hash password if being updated
- **Bcrypt**: 10 salt rounds (good balance of security/performance)

### 6. Users Resolver (GraphQL API)

```typescript
@Resolver(() => User)
export class UsersResolver {
  constructor(private readonly usersService: UsersService) {}

  @Mutation(() => User)
  createUser(@Args('createUserInput') createUserInput: CreateUserInput) {
    return this.usersService.create(createUserInput);
  }

  @Query(() => [User], { name: 'users' })
  findAll() {
    return this.usersService.findAll();
  }

  @Query(() => User, { name: 'user' })
  findOne(@Args('_id') _id: string) {
    return this.usersService.findOne(_id);
  }
}
```

**GraphQL Decorators**:

- `@Resolver(() => User)`: Declares this resolver handles User type
- `@Query()`: Read operation
- `@Mutation()`: Write operation
- `@Args()`: Extracts argument from GraphQL request

**Return Types**:

- `User`: Single user object
- `[User]`: Array of users
- Return type decorator must match method return

---

## Security Features

### 1. Password Security

```typescript
// Hashing
private hashPassword(password: string) {
  return bcrypt.hash(password, 10);
}

// Process:
// Input: "MyPassword123!"
// ↓ bcrypt.hash with 10 rounds
// Output: "$2b$10$xK9..."  (60 char hash)
```

**Security Measures**:

- ✅ **Bcrypt**: Industry-standard hashing algorithm
- ✅ **Salt Rounds**: 10 rounds (2^10 = 1024 iterations)
- ✅ **No Plain Text**: Passwords never stored unhashed
- ✅ **GraphQL Privacy**: Password field not exposed in API

### 2. Input Validation

```typescript
@InputType()
export class CreateUserInput {
  @Field()
  @IsEmail() // Must be valid email format
  email: string;

  @Field()
  @IsStrongPassword() // Must meet strength criteria
  password: string;
}
```

**Validation Rules**:

- **@IsEmail()**: Validates proper email format
- **@IsStrongPassword()**: Requires:
  - Minimum length
  - Uppercase letters
  - Lowercase letters
  - Numbers
  - Special characters

**When Validation Runs**:

1. Request arrives with GraphQL input
2. Global ValidationPipe intercepts
3. Decorators check each field
4. If invalid: Returns error to client
5. If valid: Proceeds to resolver

### 3. Environment Configuration

```typescript
ConfigModule.forRoot({
  isGlobal: true,
  validationSchema: Joi.object({
    MONGODB_URI: Joi.string().required(),
  }),
});
```

**Security Benefits**:

- ✅ **No Hardcoded Secrets**: DB URI from environment
- ✅ **Validation on Startup**: App won't start without required vars
- ✅ **Type Safety**: ConfigService provides type-safe access

### 4. CORS Configuration

```typescript
app.enableCors({
  origin: ['https://studio.apollographql.com', /^(http|https):\/\/localhost:\d+$/],
  credentials: true,
});
```

**Protection**:

- ✅ **Whitelist Origins**: Only Apollo Studio and localhost allowed
- ✅ **Regex for Localhost**: Allows any localhost port (dev flexibility)
- ✅ **Credentials**: Allows cookies/auth headers

---

## Database and Migrations

### 1. Migration System

```typescript
@Injectable()
export class DbMigrationService implements OnModuleInit {
  async onModuleInit() {
    config.set(this.dbMigrationConfig);
    const { db, client } = await database.connect();
    await up(db, client); // Runs pending migrations
  }
}
```

**How It Works**:

1. **On Startup**: `OnModuleInit` hook triggers
2. **Connect**: Establishes MongoDB connection
3. **Run Migrations**: Executes all pending migrations in order
4. **Track**: Stores executed migrations in `changelog` collection

### 2. User Email Index Migration

```typescript
// migrations/user-email-index.ts
module.exports = {
  async up(db: Db) {
    await db.collection('users').createIndex(
      { email: 1 }, // Index on email field
      { unique: true }, // Enforce uniqueness
    );
  },
};
```

**Purpose**:

- ✅ **Uniqueness**: Prevents duplicate email addresses
- ✅ **Performance**: Fast lookups by email
- ✅ **Database Constraint**: Enforced at DB level

**Migration Tracking**:

```
changelog collection:
{
  fileName: "user-email-index.js",
  appliedAt: ISODate("2024-01-15T10:30:00Z")
}
```

### 3. Database Connection

```typescript
MongooseModule.forRootAsync({
  useFactory: (configService: ConfigService) => ({
    uri: configService.get('MONGODB_URI'),
  }),
  inject: [ConfigService],
});
```

**Connection Features**:

- **Async**: Waits for ConfigService before connecting
- **Factory Pattern**: Dynamic configuration
- **Environment-Based**: Different URIs for dev/prod
- **Connection Pooling**: Mongoose handles connection reuse

---

## Summary

### Current System Capabilities

✅ **User Management**:

- Create users with email/password
- Read all users or single user by ID
- Update user email/password
- Delete users

✅ **Security**:

- Password hashing with bcrypt
- Input validation (email format, password strength)
- Unique email constraint at database level
- CORS protection

✅ **Architecture**:

- Modular NestJS structure
- GraphQL API with code-first approach
- Repository pattern for data access
- Abstract base classes for reusability
- Dependency injection throughout

✅ **Infrastructure**:

- MongoDB with Mongoose ODM
- Database migrations with tracking
- Environment-based configuration
- Structured logging with Pino
- TypeScript for type safety

### Next Steps (What's Missing for Chat App)

The foundation is solid, but for a complete chat application, you'll likely add:

🔲 **Authentication & Authorization**:

- JWT token generation
- Auth guards for protected routes
- Session management

🔲 **Chat Features**:

- Chat rooms/channels entity
- Messages entity
- Real-time subscriptions (WebSockets)
- User presence (online/offline status)

🔲 **Relationships**:

- User ↔ Chat Rooms (many-to-many)
- Chat Rooms ↔ Messages (one-to-many)
- Users ↔ Messages (one-to-many)

🔲 **Additional Features**:

- File uploads (images, documents)
- Message reactions
- Typing indicators
- Read receipts
- User profiles with avatars

---

## Step-by-Step Recreation Guide

This section provides a logical sequence to rebuild this application from scratch, with test points at each stage to verify progress.

### Prerequisites

- Node.js (v18+)
- MongoDB (local or Atlas)
- NestJS CLI: `npm i -g @nestjs/cli`

---

### Step 1: Initialize NestJS Project

```bash
# Create new NestJS project
nest new chatter-backend

# Navigate to project
cd chatter-backend

# Install core dependencies
npm install @nestjs/mongoose mongoose @nestjs/config joi
npm install @nestjs/graphql @nestjs/apollo @apollo/server graphql
npm install bcrypt class-validator class-transformer
npm install nestjs-pino pino-http pino-pretty

# Install dev dependencies
npm install -D @types/bcrypt
```

**🧪 Test Point 1**: Run `npm run start:dev` - app should start on port 3000, visit `http://localhost:3000` and see "Hello World!"

---

### Step 2: Environment Configuration

**Create `.env` file in root**:

```env
MONGODB_URI=mongodb://localhost:27017/chatter
# or for Atlas: mongodb+srv://username:password@cluster.mongodb.net/chatter
PORT=3000
DB_NAME=chatter
NODE_ENV=development
```

**Update `app.module.ts`** - Add ConfigModule:

```typescript
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import * as Joi from 'joi';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        MONGODB_URI: Joi.string().required(),
        PORT: Joi.number().default(3000),
      }),
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
```

**Update `main.ts`** - Use ConfigService for port:

```typescript
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  await app.listen(configService.getOrThrow<number>('PORT'));
}
bootstrap();
```

**🧪 Test Point 2**: Run `npm run start:dev` - verify it uses PORT from `.env`. Try changing PORT to 4000 and verify it starts on 4000.

---

### Step 3: Database Module Setup

**Create `src/common/database/database.module.ts`**:

```typescript
import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ModelDefinition, MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [
    MongooseModule.forRootAsync({
      useFactory: (configService: ConfigService) => ({
        uri: configService.get('MONGODB_URI'),
      }),
      inject: [ConfigService],
    }),
  ],
})
export class DatabaseModule {
  static forFeature(models: ModelDefinition[]) {
    return MongooseModule.forFeature(models);
  }
}
```

**Update `app.module.ts`** - Import DatabaseModule:

```typescript
import { DatabaseModule } from './common/database/database.module';

@Module({
  imports: [
    ConfigModule.forRoot({...}),
    DatabaseModule,  // Add this
  ],
  // ...
})
```

**🧪 Test Point 3**: Run app and check logs - you should see MongoDB connection established (no errors about connection).

---

### Step 4: Abstract Base Classes

**Create `src/common/database/abstract.entity.ts`**:

```typescript
import { Field, ID, ObjectType } from '@nestjs/graphql';
import { Prop, Schema } from '@nestjs/mongoose';
import { SchemaTypes, Types } from 'mongoose';

@Schema()
@ObjectType({ isAbstract: true })
export class AbstractEntity {
  @Prop({ type: SchemaTypes.ObjectId })
  @Field(() => ID)
  _id: Types.ObjectId;
}
```

**Create `src/common/database/abstract.repository.ts`**:

```typescript
import { Logger, NotFoundException } from '@nestjs/common';
import { AbstractEntity } from './abstract.entity';
import { FilterQuery, Model, Types, UpdateQuery } from 'mongoose';

export abstract class AbstractRepository<T extends AbstractEntity> {
  protected abstract readonly logger: Logger;

  constructor(protected readonly model: Model<T>) {}

  async create(document: Omit<T, '_id'>): Promise<T> {
    const createdDocument = new this.model({
      ...document,
      _id: new Types.ObjectId(),
    });
    return (await createdDocument.save()).toJSON() as unknown as T;
  }

  async findOne(filterQuery: FilterQuery<T>): Promise<T | null> {
    const document = await this.model.findOne(filterQuery).lean<T>();
    if (!document) {
      this.logger.warn('Document not found with filterQuery', filterQuery);
      throw new NotFoundException('Document not found');
    }
    return document;
  }

  async findOneAndUpdate(filterQuery: FilterQuery<T>, update: UpdateQuery<T>): Promise<T> {
    const document = await this.model
      .findOneAndUpdate(filterQuery, update, { new: true })
      .lean<T>();
    if (!document) {
      this.logger.warn('Document not found with filterQuery', filterQuery);
      throw new NotFoundException('Document not found');
    }
    return document;
  }

  async find(filterQuery: FilterQuery<T>): Promise<T[]> {
    return this.model.find(filterQuery).lean<T[]>();
  }

  async findOneAndDelete(filterQuery: FilterQuery<T>): Promise<T | null> {
    return this.model.findOneAndDelete(filterQuery).lean<T>();
  }
}
```

**🧪 Test Point 4**: Run `npm run build` - TypeScript should compile successfully with no errors.

---

### Step 5: Users Module Structure

**Generate users module**:

```bash
nest g module users
nest g service users
nest g resolver users
```

**Create `src/users/entities/user.entity.ts`**:

```typescript
import { Field, ObjectType } from '@nestjs/graphql';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { AbstractEntity } from 'src/common/database/abstract.entity';

@Schema({ versionKey: false })
@ObjectType()
export class User extends AbstractEntity {
  @Prop()
  @Field()
  email: string;

  @Prop()
  password: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
```

**🧪 Test Point 5**: Run `npm run build` - verify no TypeScript errors.

---

### Step 6: User DTOs

**Create `src/users/dto/create-user.input.ts`**:

```typescript
import { InputType, Field } from '@nestjs/graphql';
import { IsEmail, IsStrongPassword } from 'class-validator';

@InputType()
export class CreateUserInput {
  @Field()
  @IsEmail()
  email: string;

  @Field()
  @IsStrongPassword()
  password: string;
}
```

**Create `src/users/dto/update-user.input.ts`**:

```typescript
import { CreateUserInput } from './create-user.input';
import { InputType, Field, PartialType } from '@nestjs/graphql';

@InputType()
export class UpdateUserInput extends PartialType(CreateUserInput) {
  @Field()
  _id: string;
}
```

**🧪 Test Point 6**: Run `npm run build` - verify no TypeScript errors.

---

### Step 7: Users Repository

**Create `src/users/users.repository.ts`**:

```typescript
import { AbstractRepository } from 'src/common/database/abstract.repository';
import { User } from './entities/user.entity';
import { Injectable, Logger } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class UsersRepository extends AbstractRepository<User> {
  protected readonly logger = new Logger(UsersRepository.name);

  constructor(@InjectModel(User.name) userModel: Model<User>) {
    super(userModel);
  }
}
```

**Update `src/users/users.module.ts`**:

```typescript
import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersResolver } from './users.resolver';
import { UsersRepository } from './users.repository';
import { DatabaseModule } from 'src/common/database/database.module';
import { User, UserSchema } from './entities/user.entity';

@Module({
  imports: [DatabaseModule.forFeature([{ name: User.name, schema: UserSchema }])],
  providers: [UsersResolver, UsersService, UsersRepository],
})
export class UsersModule {}
```

**🧪 Test Point 7**: Run `npm run start:dev` - app should start without errors. Repository is now connected to MongoDB.

---

### Step 8: Users Service (Business Logic)

**Update `src/users/users.service.ts`**:

```typescript
import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { CreateUserInput } from './dto/create-user.input';
import { UpdateUserInput } from './dto/update-user.input';
import { UsersRepository } from './users.repository';

@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UsersRepository) {}

  async create(createUserInput: CreateUserInput) {
    return this.usersRepository.create({
      ...createUserInput,
      password: await this.hashPassword(createUserInput.password),
    });
  }

  private hashPassword(password: string) {
    return bcrypt.hash(password, 10);
  }

  async findAll() {
    return await this.usersRepository.find({});
  }

  async findOne(_id: string) {
    return this.usersRepository.findOne({ _id });
  }

  async update(_id: string, updateUserInput: UpdateUserInput) {
    if (updateUserInput.password) {
      updateUserInput.password = await this.hashPassword(updateUserInput.password);
    }
    return this.usersRepository.findOneAndUpdate({ _id }, { $set: { ...updateUserInput } });
  }

  async remove(_id: string) {
    return this.usersRepository.findOneAndDelete({ _id });
  }
}
```

**🧪 Test Point 8**: Run `npm run start:dev` - no errors. Service layer is ready.

---

### Step 9: GraphQL Configuration

**Update `app.module.ts`** - Add GraphQL:

```typescript
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { join } from 'path';

@Module({
  imports: [
    ConfigModule.forRoot({...}),
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
      sortSchema: true,
      introspection: true,
      playground: false,
    }),
    DatabaseModule,
    UsersModule,
  ],
  // ...
})
```

**🧪 Test Point 9**: Run `npm run start:dev` - GraphQL endpoint should be available but schema will be empty (no resolvers yet). Check `src/schema.gql` is created.

---

### Step 10: Users Resolver (GraphQL API)

**Update `src/users/users.resolver.ts`**:

```typescript
import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';
import { CreateUserInput } from './dto/create-user.input';
import { UpdateUserInput } from './dto/update-user.input';

@Resolver(() => User)
export class UsersResolver {
  constructor(private readonly usersService: UsersService) {}

  @Mutation(() => User)
  createUser(@Args('createUserInput') createUserInput: CreateUserInput) {
    return this.usersService.create(createUserInput);
  }

  @Query(() => [User], { name: 'users' })
  findAll() {
    return this.usersService.findAll();
  }

  @Query(() => User, { name: 'user' })
  findOne(@Args('_id') _id: string) {
    return this.usersService.findOne(_id);
  }

  @Mutation(() => User)
  updateUser(@Args('updateUserInput') updateUserInput: UpdateUserInput) {
    return this.usersService.update(updateUserInput._id, updateUserInput);
  }

  @Mutation(() => User)
  removeUser(@Args('_id') _id: string) {
    return this.usersService.remove(_id);
  }
}
```

**🧪 Test Point 10**:

1. Run `npm run start:dev`
2. Check `src/schema.gql` - should now have User type, queries, and mutations
3. Visit `http://localhost:3000/graphql` in browser - should see GraphQL error (playground disabled)

---

### Step 11: Validation Pipe

**Update `main.ts`** - Add global validation:

```typescript
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe());
  const configService = app.get(ConfigService);
  await app.listen(configService.getOrThrow<number>('PORT'));
}
bootstrap();
```

**🧪 Test Point 11**: Test with Apollo Studio (`https://studio.apollographql.com/sandbox`):

- Connect to: `http://localhost:3000/graphql`
- Try creating user with invalid email - should get validation error
- Try with weak password - should get validation error

---

### Step 12: CORS Configuration

**Update `main.ts`**:

```typescript
async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: ['https://studio.apollographql.com', /^(http|https):\/\/localhost:\d+$/],
    credentials: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders:
      'Content-Type,Authorization,apollographql-client-name,apollographql-client-version,x-apollo-operation-name,x-apollo-cache-control',
  });

  app.useGlobalPipes(new ValidationPipe());
  const configService = app.get(ConfigService);
  await app.listen(configService.getOrThrow<number>('PORT'));
}
```

**🧪 Test Point 12**: Apollo Studio should now connect without CORS errors.

---

### Step 13: Logging with Pino

**Update `app.module.ts`** - Add LoggerModule:

```typescript
import { LoggerModule } from 'nestjs-pino';

@Module({
  imports: [
    ConfigModule.forRoot({...}),
    GraphQLModule.forRoot({...}),
    DatabaseModule,
    UsersModule,
    LoggerModule.forRootAsync({
      useFactory: (configService: ConfigService) => {
        const isProduction = configService.get('NODE_ENV') === 'production';
        return {
          pinoHttp: {
            transport: isProduction
              ? undefined
              : {
                  target: 'pino-pretty',
                  options: { singleLine: true },
                },
            level: isProduction ? 'info' : 'debug',
          },
        };
      },
      inject: [ConfigService],
    }),
  ],
  // ...
})
```

**Update `main.ts`**:

```typescript
import { Logger } from 'nestjs-pino';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  app.enableCors({...});
  app.useGlobalPipes(new ValidationPipe());
  app.useLogger(app.get(Logger));
  const configService = app.get(ConfigService);
  await app.listen(configService.getOrThrow<number>('PORT'));
}
```

**🧪 Test Point 13**: Run app - logs should be formatted nicely with colors (pino-pretty). Try making GraphQL requests and see them logged.

---

### Step 14: Database Migration Setup

**Install migration package**:

```bash
npm install migrate-mongo
npm install -D @types/migrate-mongo
```

**Create `src/common/database/db-migration.service.ts`**:

```typescript
import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { config, database, up } from 'migrate-mongo';

@Injectable()
export class DbMigrationService implements OnModuleInit {
  private readonly dbMigrationConfig: Partial<config.Config>;

  constructor(private readonly configService: ConfigService) {
    this.dbMigrationConfig = {
      mongodb: {
        databaseName: this.configService.getOrThrow('DB_NAME'),
        url: this.configService.getOrThrow('MONGODB_URI'),
      },
      migrationsDir: `${__dirname}/../../migrations`,
      changelogCollectionName: 'changelog',
      migrationFileExtension: '.js',
    };
  }

  async onModuleInit() {
    config.set(this.dbMigrationConfig);
    const { db, client } = await database.connect();
    await up(db, client);
  }
}
```

**Update `src/common/database/database.module.ts`**:

```typescript
import { DbMigrationService } from './db-migration.service';

@Module({
  imports: [...],
  providers: [DbMigrationService],  // Add this
})
export class DatabaseModule {...}
```

**🧪 Test Point 14**: Run app - should start without errors. Migration service is registered.

---

### Step 15: Create Email Index Migration

**Create `src/migrations/user-email-index.ts`**:

```typescript
import { Db } from 'mongodb';

module.exports = {
  async up(db: Db) {
    await db.collection('users').createIndex({ email: 1 }, { unique: true });
  },
};
```

**🧪 Test Point 15**:

1. Run `npm run start:dev`
2. Check MongoDB - `users` collection should have unique index on `email`
3. Try creating two users with same email - second should fail

---

### Step 16: Full End-to-End Testing

**Open Apollo Studio** (`https://studio.apollographql.com/sandbox`):

**Test 1 - Create User**:

```graphql
mutation {
  createUser(createUserInput: { email: "test@example.com", password: "StrongPassword123!" }) {
    _id
    email
  }
}
```

✅ Should return user with `_id` and `email` (password not exposed)

**Test 2 - Get All Users**:

```graphql
query {
  users {
    _id
    email
  }
}
```

✅ Should return array with your created user

**Test 3 - Get Single User**:

```graphql
query {
  user(_id: "YOUR_USER_ID_HERE") {
    _id
    email
  }
}
```

✅ Should return specific user

**Test 4 - Update User**:

```graphql
mutation {
  updateUser(updateUserInput: { _id: "YOUR_USER_ID_HERE", email: "updated@example.com" }) {
    _id
    email
  }
}
```

✅ Should return user with updated email

**Test 5 - Delete User**:

```graphql
mutation {
  removeUser(_id: "YOUR_USER_ID_HERE") {
    _id
    email
  }
}
```

✅ Should return deleted user

**Test 6 - Validation Errors**:

```graphql
mutation {
  createUser(createUserInput: { email: "invalid-email", password: "weak" }) {
    _id
    email
  }
}
```

✅ Should return validation errors

**Test 7 - Unique Email Constraint**:

```graphql
# Create first user
mutation {
  createUser(createUserInput: { email: "duplicate@test.com", password: "Strong123!" }) {
    _id
  }
}

# Try creating second user with same email
mutation {
  createUser(createUserInput: { email: "duplicate@test.com", password: "Strong456!" }) {
    _id
  }
}
```

✅ Second mutation should fail with duplicate key error

---

### Step 17: Verify Files Structure

Your final structure should match:

```
chatter-backend/
├── src/
│   ├── common/
│   │   └── database/
│   │       ├── abstract.entity.ts
│   │       ├── abstract.repository.ts
│   │       ├── database.module.ts
│   │       └── db-migration.service.ts
│   ├── migrations/
│   │   └── user-email-index.ts
│   ├── users/
│   │   ├── dto/
│   │   │   ├── create-user.input.ts
│   │   │   └── update-user.input.ts
│   │   ├── entities/
│   │   │   └── user.entity.ts
│   │   ├── users.module.ts
│   │   ├── users.repository.ts
│   │   ├── users.resolver.ts
│   │   └── users.service.ts
│   ├── app.controller.ts
│   ├── app.module.ts
│   ├── app.service.ts
│   ├── main.ts
│   └── schema.gql (auto-generated)
├── .env
├── package.json
└── tsconfig.json
```

---

### Common Issues & Solutions

**Issue 1**: MongoDB connection error

- **Solution**: Verify MONGODB_URI in `.env`, ensure MongoDB is running

**Issue 2**: GraphQL schema not generating

- **Solution**: Ensure all decorators are correct, restart dev server

**Issue 3**: Validation not working

- **Solution**: Ensure `ValidationPipe` is added globally in `main.ts`

**Issue 4**: CORS errors in Apollo Studio

- **Solution**: Check CORS config includes `https://studio.apollographql.com`

**Issue 5**: Password visible in GraphQL response

- **Solution**: Ensure `password` field in User entity has `@Prop()` but NOT `@Field()`

**Issue 6**: Duplicate email not throwing error

- **Solution**: Verify migration ran, check MongoDB for index on email field

---

### Key Takeaways

1. **Build incrementally** - Each step adds one feature and has a test point
2. **Test early, test often** - Verify each layer before moving to the next
3. **Follow NestJS conventions** - Module → Service → Repository pattern
4. **Security first** - Hash passwords, validate inputs, use environment variables
5. **GraphQL code-first** - Decorators drive schema generation
6. **Database migrations** - Always use migrations for schema changes

---

**End of Documentation**
