import { Field, Int, ObjectType } from 'type-graphql';

import { Author } from './author-type';
import { BookEntity } from '../entities/book';

@ObjectType({ description: 'Книга' })
export class Book {
  @Field(type => Int, { description: 'Идентификатор книги' })
  bookId!: number;

  @Field({ description: 'Название' })
  name!: string;

  @Field({ description: 'Толщина' })
  pageCount!: number;

  @Field(type => Int, { description: 'Идентификатор автора' })
  authorId!: number;

  @Field(type => Author, { description: 'Описалово автора' })
  author?: Author;

  static fromEntity(b: BookEntity): Book {
    const { id, name, pageCount, authorId } = b;

    return {
      bookId: b.id,
      name,
      pageCount,
      authorId,
    };
  }
}
