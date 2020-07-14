import {
  Resolver,
  Query,
  ResolverInterface,
  FieldResolver,
  Root,
  Arg,
  Int,
  Mutation,
} from 'type-graphql';
import { InjectRepository } from 'typeorm-typedi-extensions';
import { Repository } from 'typeorm';

import { BookEntity } from '../entities/book';
import { AuthorEntity } from '../entities/author';

import { Book } from './book-type';
import { Author } from './author-type';
import { BookCreateInput } from './book-create-input';
import { BookUpdateInput } from './book-update-input';

@Resolver(of => Book)
export class BookResolver implements ResolverInterface<Book> {
  constructor(
    @InjectRepository(BookEntity) private readonly bookRepo: Repository<BookEntity>,
    @InjectRepository(AuthorEntity) private readonly authorRepo: Repository<AuthorEntity>,
  ) {}

  @Query(returns => Book, { nullable: true, description: 'Получить книгу по ID' })
  async book(
    @Arg('id', type => Int, { description: 'Идентификатор книжки' }) bookId: number,
  ): Promise<Book | null> {
    const book = await this.bookRepo.findOne({ id: Number(bookId) });
    return book ? Book.fromEntity(book) : null;
  }

  @Query(returns => [Book], { description: 'Получить все книги' })
  async books(): Promise<Book[]> {
    // автор маленький, можно тупо приджойнить

    let res = await this.bookRepo
      .createQueryBuilder('b')
      .leftJoinAndSelect('author', 'a', 'a.id = b.authorId')
      .getRawAndEntities<{ a_id: number; a_name: string }>();

    return res.entities.map(
      (book, index): Book => ({
        ...Book.fromEntity(book),
        author: {
          authorId: book.authorId,
          name: res.raw[index].a_name,
        },
      }),
    );
  }

  @FieldResolver()
  async author(@Root() book: Book): Promise<Author> {
    if (book.author) return book.author;

    const author = await this.authorRepo.findOne({ id: book.authorId }, { cache: 3333 });
    if (!author) throw new Error('Cannot find author (internal error)');

    return { authorId: author.id, name: author.name };
  }

  @Mutation(returns => Book, { description: 'Добавить книгу' })
  async createBook(
    @Arg('input', { description: 'Параметры добавляемой книги' }) input: BookCreateInput,
  ): Promise<Book> {
    const { authorId, name, pageCount } = input;

    const author = await this.authorRepo.findOne({ id: authorId });
    if (!author) {
      throw new Error('Cannot find author');
    }

    const b = new BookEntity();

    b.author = author;
    b.name = name;
    b.pageCount = pageCount;

    await this.bookRepo.save(b);

    return Book.fromEntity(b);
  }

  @Mutation(returns => Book, { description: 'Изменить книгу' })
  async updateBook(
    @Arg('input', { description: 'Параметры изменяемой книги' }) input: BookUpdateInput,
  ): Promise<Book> {
    console.log(`updateBook`, input);
    const { id, name, pageCount, authorId } = input;
    const book = await this.bookRepo.findOne({ id });
    if (!book) throw new Error('Book not found');

    if (name !== undefined) {
      book.name = name;
    }

    if (pageCount !== undefined) {
      book.pageCount = pageCount;
    }

    if (authorId !== undefined && authorId !== book.authorId) {
      const author = await this.authorRepo.findOne({ id: authorId });
      if (!author) throw new Error('Cannot find author');
      book.author = author;
    }

    await this.bookRepo.save(book);

    return Book.fromEntity(book);
  }
}
