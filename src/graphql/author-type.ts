import { Field, Int, ObjectType } from 'type-graphql';
import { AuthorEntity } from '../entities/author';

@ObjectType({ description: 'Автор книг' })
export class Author {
  @Field(type => Int, { description: 'Идентификатор автора' })
  authorId!: number;

  @Field({ description: 'Имя автора' })
  name!: string;

  @Field(type => Int, { description: 'Кол-во книг автора в нашей БД' })
  bookCount?: number;

  static fromEntity(a: AuthorEntity): Author {
    return {
      authorId: a.id,
      name: a.name,
    };
  }
}
