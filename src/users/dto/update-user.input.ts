//UpdateUserInput: Input type for updating existing users
import { CreateUserInput } from './create-user.input';
import { InputType, PartialType } from '@nestjs/graphql';

@InputType()
export class UpdateUserInput extends PartialType(CreateUserInput) {}
