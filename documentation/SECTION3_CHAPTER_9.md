## Chatter Backend (NestJS + GraphQL) — Progress and Architecture

### High-level overview

This backend uses NestJS with the Apollo GraphQL driver in a code‑first setup, MongoDB via Mongoose, and a layered domain structure:

- **AppModule** wires global configuration, GraphQL, database connectivity, and the `UsersModule`.
- **GraphQL (code‑first)** generates a schema file (`src/schema.gql`) from TypeScript classes decorated with `@ObjectType`, `@Field`, `@InputType`, and resolver metadata.
- **Database** uses Mongoose. A small database infrastructure in `src/common/database` provides:
  - a base `AbstractEntity` with `_id`
  - a generic `AbstractRepository<T>` with common CRUD helpers
  - a `DatabaseModule` that configures the Mongo connection and exposes a `forFeature` helper for model registration
- **Users domain** follows a typical Nest layering:
  - `UsersResolver` (GraphQL API layer)
  - `UsersService` (business logic layer)
  - `UsersRepository` (data access layer) built on the common repository base
  - `User` entity class that serves both as GraphQL object type and Mongoose schema

### App bootstrap and wiring

- `src/main.ts` bootstraps the Nest app and listens on `PORT` (default 3000).
- `src/app.module.ts` sets up:
  - `ConfigModule.forRoot` with validation for `MONGODB_URI`
  - `GraphQLModule.forRoot({ driver: ApolloDriver, autoSchemaFile: 'src/schema.gql', playground: true })`
  - `DatabaseModule` (Mongo connection)
  - `UsersModule`
- `AppController` exposes a single REST `GET /` returning "Hello World!". This sits alongside GraphQL, which is served via the Apollo endpoint.

## common/database — detailed explanation

The `src/common/database` folder abstracts database concerns and promotes reuse.

### `AbstractEntity`

- Provides a common `_id` field for all Mongo documents.
- Decorated with both:
  - `@Schema()` (Mongoose) so it can be composed into Mongoose models
  - `@ObjectType({ isAbstract: true })` (GraphQL) to enable inheritance for GraphQL object types
- `_id` is typed as `Types.ObjectId` and exposed to GraphQL as an `ID` via `@Field(() => ID)`.

Why this matters:

- All your domain entities can extend `AbstractEntity` to consistently have an `_id` that works with both Mongoose and GraphQL.

### `AbstractRepository<T extends AbstractEntity>`

- A generic base repository wrapping a Mongoose `Model<T>` and providing common operations:
  - `create` — constructs a new document with a generated `ObjectId`, saves, and returns a lean JSON object
  - `findOne` — finds a single document by filter, throws `NotFoundException` if not found
  - `findOneAndUpdate` — updates a document and returns the new version or throws if not found
  - `find` — returns an array of documents matching a filter (lean)
  - `findOneAndDelete` — removes and returns a single matching document
- Uses `this.logger` (required in subclasses) to log not‑found cases before throwing, which centralizes consistent error handling.
- Returns lean objects (`.lean<T>()`) to reduce overhead and avoid Mongoose document instances in upper layers.

Why this matters:

- Domain repositories (e.g., `UsersRepository`) stay concise and consistent, inheriting common behavior and errors.

### `DatabaseModule`

- Configures the Mongo connection with `MongooseModule.forRootAsync`, pulling the `uri` from `ConfigService` (`MONGODB_URI`).
- Exposes a static `forFeature(models: ModelDefinition[])` convenience method that simply delegates to `MongooseModule.forFeature(models)` so feature modules can register their models without importing `MongooseModule` directly.

Why this matters:

- Centralizes database configuration and provides a clean API for feature modules to add models.

## users — detailed explanation

The `src/users` folder implements the GraphQL API, business logic, repository, and entity for users.

### `entities/user.entity.ts`

- `User extends AbstractEntity` so it inherits `_id`.
- Decorators combine both worlds:
  - `@Schema({ versionKey: false })` and `@Prop()` define the Mongoose model fields
  - `@ObjectType()` and `@Field()` mark which fields are exposed to GraphQL
- Fields:
  - `email` is persisted (`@Prop`) and exposed via GraphQL (`@Field()`)
  - `password` is persisted (`@Prop`) but intentionally NOT exposed to GraphQL (no `@Field`) — good practice
- `export const UserSchema = SchemaFactory.createForClass(User)` creates the Mongoose schema used by the repository.

Implications:

- The same class serves as the source of truth for both persistence and GraphQL exposure, with GraphQL exposure controlled by which properties receive `@Field`.

### `users.module.ts`

- Imports the database model definition via `DatabaseModule.forFeature([{ name: User.name, schema: UserSchema }])`.
- Provides `UsersResolver`, `UsersService`, and `UsersRepository`.
- No controllers are defined here (more on this below).

### `users.repository.ts`

- `UsersRepository` extends `AbstractRepository<User>` and injects the Mongoose model for `User` via `@InjectModel(User.name)`.
- Inherits all CRUD helpers; can be extended later for user‑specific queries (e.g., unique email lookups, indexed searches).

### `users.service.ts`

- Injects `UsersRepository` and serves as the business logic layer.
- Current state:
  - `findAll` delegates to `usersRepository.find({})` and returns all users.
  - `create`, `findOne`, `update`, `remove` are placeholders returning strings. These will need proper implementations that:
    - accept well‑designed GraphQL inputs (e.g., `email`, `password`),
    - interact with the repository methods (`create`, `findOne`, `findOneAndUpdate`, `findOneAndDelete`),
    - handle concerns like validation, unique constraints, and password hashing.

### `users.resolver.ts`

- GraphQL API surface:
  - Queries:
    - `users: [User!]!` — lists all users
    - `user(id: Int!): User!` — currently expects an integer id (placeholder)
  - Mutations:
    - `createUser(createUserInput: CreateUserInput!): User!`
    - `updateUser(updateUserInput: UpdateUserInput!): User!`
    - `removeUser(id: Int!): User!`
- Each resolver delegates to `UsersService` methods.

Note on identifiers:

- Your persistence model uses Mongo `_id: ObjectId` (string in GraphQL `ID` terms), but the resolver currently uses `Int` for `id`. As you flesh out the logic, you’ll likely want to switch to `ID` (string) and use `_id` consistently.

### DTOs (`dto/create-user.input.ts`, `dto/update-user.input.ts`)

- Currently placeholders:
  - `CreateUserInput` exposes an `exampleField: Int!`
  - `UpdateUserInput` extends `PartialType(CreateUserInput)` and adds `id: Int!`
- In a real chat app, you’d replace these with relevant fields (e.g., `email` and `password` for create; `id: ID!` and optional fields for update).

## Why there is no UsersController

- In a GraphQL application, **Resolvers** play the role that **Controllers** play in REST. They map incoming GraphQL queries/mutations/subscriptions to service methods.
- Because this module is exposing a GraphQL API (via `UsersResolver`), a `UsersController` is unnecessary unless you also want to provide parallel REST endpoints. Having both GraphQL resolvers and REST controllers in the same module is possible but optional.

## Relationship between schema definition and types

- You are using the **code‑first** approach for GraphQL:
  - Decorated TypeScript classes (`@ObjectType`, `@Field`, `@InputType`) define your GraphQL types.
  - Nest’s `GraphQLModule` reads those and automatically generates the schema file at `src/schema.gql` (`autoSchemaFile`).
- Therefore, `src/schema.gql` is an output artifact of your code, not a hand‑maintained file. Any change to your decorated classes, DTOs, or resolvers will regenerate the schema.
- Dual role of the entity class:
  - Mongoose persistence: `@Schema`, `@Prop`, `SchemaFactory.createForClass`
  - GraphQL exposure: `@ObjectType`, `@Field`
- This allows you to persist more fields than you expose through GraphQL (e.g., `password` is stored but not part of the GraphQL type).

## Current generated schema snapshot (for context)

Today, `src/schema.gql` reflects placeholders and current resolver signatures. For example, `User` exposes `_id` and `email`, while input types still have `exampleField`. This will evolve as you refine DTOs and resolvers.

## Architecture diagram

```text
Client (GraphQL Playground / UI)
            │
            ▼
      Apollo Server (Nest GraphQLModule)
            │
            ▼
       UsersResolver (GraphQL API)
            │
            ▼
        UsersService (Business logic)
            │
            ▼
     UsersRepository (Data access layer)
            │
            ▼
  Mongoose Model <-> MongoDB (Database)

Cross-cutting / infrastructure:

ConfigModule ──▶ DatabaseModule (Mongoose connection via MONGODB_URI)
                    ▲
                    │ forFeature(User)
                    │
                 UsersModule

AppModule orchestrates: ConfigModule + GraphQLModule + DatabaseModule + UsersModule

Additionally: AppController (REST GET /) coexists with GraphQL endpoint.
```

## What’s built so far vs. what remains

- Built
  - GraphQL infrastructure (Apollo driver, code‑first schema generation)
  - Database infrastructure (Mongo connection, abstract entity and repository)
  - Users domain scaffolding (entity, repository, service/resolver wiring)
  - Basic query to list all users via repository (`users`)
- To refine next
  - Replace placeholder DTOs with real fields (e.g., `email`, `password`) and return shapes
  - Implement `create`, `findOne`, `update`, `remove` in `UsersService` using `UsersRepository`
  - Align GraphQL identifiers with Mongo: prefer `ID` (string) and `_id` usage
  - Add validation (e.g., class‑validator), unique constraints (email), and password hashing
  - Consider separating read models from write models if/when needed

## Quick answers to your questions

- **Why no controller in `UsersModule`?** Because you're using GraphQL. Resolvers replace controllers for GraphQL APIs. A controller is only needed if you want REST endpoints too.
- **Relationship between schema and types?** The schema is generated from your decorated TypeScript classes/DTOs (code‑first). You generally do not hand‑edit `schema.gql`; you edit your classes and resolvers instead.
- **Are schema and types created separately for different reasons?** In code‑first, they're unified: types and inputs in code drive the generated schema. Your entity can also double as a GraphQL type, while Mongoose decorators define persistence.

## Repository Pattern Architecture

### **AbstractRepository** (Generic CRUD Layer)

- **Location**: `src/common/database/abstract.repository.ts`
- **Purpose**: Contains all the **actual CRUD operations**
- **Methods**:
  - `create()` - Creates new documents
  - `findOne()` - Finds single document
  - `find()` - Finds multiple documents
  - `findOneAndUpdate()` - Updates documents
  - `findOneAndDelete()` - Deletes documents

### **UsersRepository** (Specific Data Access Layer)

- **Location**: `src/users/users.repository.ts`
- **Purpose**: **Extends** AbstractRepository for User-specific operations
- **What it does**:
  - Injects the User model via `@InjectModel(User.name)`
  - Provides a logger specific to user operations
  - **Inherits all CRUD methods** from AbstractRepository

### **The Flow**

```
UsersService → UsersRepository → AbstractRepository → MongoDB
     ↑              ↑                    ↑
  Business      Data Access        Actual CRUD
   Logic          Layer            Operations
```

### **Benefits of This Pattern**

1. **DRY Principle**: All CRUD logic is written once in AbstractRepository
2. **Type Safety**: Generic `<T>` ensures type consistency
3. **Consistency**: All repositories behave the same way
4. **Easy Testing**: Mock the abstract methods
5. **Maintainability**: Changes to CRUD logic happen in one place

**Key Point**: `UsersRepository` is the data access layer, but the **actual CRUD operations** are implemented in `AbstractRepository`. The UsersRepository just provides the User-specific context (model injection, logging) and inherits all the database operations.
