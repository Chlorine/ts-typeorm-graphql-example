import { Book } from './book-type';
import { Field, InputType, Int } from 'type-graphql';
import { Length, IsInt, IsPositive, Max } from 'class-validator';

@InputType({ description: 'Параметры добавляемой книги' })
export class BookCreateInput implements Partial<Book> {
  @Field({ description: 'Название книги' })
  @Length(1, 255)
  name!: string;

  @Field(type => Int, { description: 'Толщина книги' })
  @IsInt()
  @IsPositive()
  @Max(999999)
  pageCount!: number;

  @Field(type => Int, { description: 'ID автора книги' })
  authorId!: number;
}
