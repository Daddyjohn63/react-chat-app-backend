//the abstract entity is a base class for all entities in the database
import { Field, ID, ObjectType } from '@nestjs/graphql';
import { Prop, Schema } from '@nestjs/mongoose';
import { SchemaTypes, Types } from 'mongoose';

//the abstract entity is a base class for all entities in the database
//it contains the _id field which is the id of the entity
//it is used to identify the entity in the database
//it is also used to identify the entity in the API
//it is also used to identify the entity in the UI

//All domain entities can extend AbstractEntity to consistently have an _id that works with both Mongoose and GraphQL.

@Schema()
@ObjectType({ isAbstract: true })
export class AbstractEntity {
  @Prop({ type: SchemaTypes.ObjectId })
  @Field(() => ID)
  _id: Types.ObjectId;
}
