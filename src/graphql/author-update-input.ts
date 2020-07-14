import { Author } from './author-type';
import { Field, InputType, Int } from 'type-graphql';
import { Length } from 'class-validator';

@InputType({ description: 'Параметры изменяемого автора' })
export class AuthorUpdateInput implements Partial<Author> {
  @Field(type => Int, { description: 'ID автора' })
  id!: number;

  @Field({ description: 'Новое имя автора' })
  @Length(1, 255)
  name!: string;
}
