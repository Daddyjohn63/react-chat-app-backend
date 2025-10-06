//define the shape of our data. in our case it is the user schema.

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
//export the schema so that it can be used in the repository and service layer with mongoose model factory
export const UserSchema = SchemaFactory.createForClass(User);
