import { Book } from './book-type';
import { Field, InputType, Int } from 'type-graphql';
import { Length, IsInt, IsPositive, Max } from 'class-validator';

@InputType({ description: 'Параметры изменяемой книги' })
export class BookUpdateInput implements Partial<Book> {
  @Field(type => Int, { description: 'ID изменяемой книги' })
  id!: number;

  @Field({ description: 'Новое название книги', nullable: true })
  @Length(1, 255)
  name?: string;

  @Field(type => Int, { description: 'Новая толщина книги', nullable: true })
  @IsInt()
  @IsPositive()
  @Max(999999)
  pageCount?: number;

  @Field(type => Int, { description: 'Новый ID автора книги', nullable: true })
  authorId?: number;
}
