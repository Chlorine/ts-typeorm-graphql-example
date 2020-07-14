import { Author } from './author-type';
import { Field, InputType } from 'type-graphql';
import { Length, MaxLength, MinLength, IsNotEmpty, IsString } from 'class-validator';
// todo: cv.registerDecorator(isNotBlank)

@InputType({ description: 'Параметры добавляемого автора' })
export class AuthorCreateInput implements Partial<Author> {
  @Field({ description: 'Имя добавляемого автора' })
  @Length(1, 255)
  name!: string;
}
