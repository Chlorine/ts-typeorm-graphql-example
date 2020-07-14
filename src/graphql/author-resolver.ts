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
import { AuthorCreateInput } from './author-create-input';
import { AuthorUpdateInput } from './author-update-input';

@Resolver(of => Author)
export class AuthorResolver implements ResolverInterface<Author> {
  constructor(
    @InjectRepository(BookEntity) private readonly bookRepo: Repository<BookEntity>,
    @InjectRepository(AuthorEntity) private readonly authorRepo: Repository<AuthorEntity>,
  ) {}

  @Query(returns => [Author], { description: 'Получить всех авторов' })
  async authors(): Promise<Author[]> {
    const data = await this.authorRepo
      .createQueryBuilder('a')
      .leftJoin('book', 'b', 'b.authorId = a.id')
      .addSelect('count(b.id) bookCount')
      .addGroupBy('a.id')
      .getRawMany<{ a_id: number; a_name: string; bookCount: number }>();

    return data.map(row => ({ authorId: row.a_id, name: row.a_name, bookCount: row.bookCount }));
  }

  @Query(returns => Author, { nullable: true, description: 'Получить автора по ID' })
  async author(
    @Arg('id', type => Int, { description: 'Идентификатор автора' }) authorId: number,
  ): Promise<Author | null> {
    const a = await this.authorRepo.findOne({ id: Number(authorId) });
    return a ? Author.fromEntity(a) : null;
  }

  @Mutation(returns => Author, { description: 'Добавить автора' })
  async createAuthor(
    @Arg('input', { description: 'Параметры добавляемого автора' }) input: AuthorCreateInput,
  ): Promise<Author> {
    const a = new AuthorEntity();
    a.name = input.name;
    await this.authorRepo.save(a);
    return Author.fromEntity(a);
  }

  @FieldResolver()
  async bookCount(@Root() author: Author): Promise<number> {
    if (author.bookCount !== undefined) return author.bookCount;
    return this.bookRepo.count({ authorId: author.authorId });
  }

  @Mutation(returns => Author, { description: 'Изменить автора' })
  async updateAuthor(
    @Arg('input', { description: 'Параметры изменяемого автора' }) input: AuthorUpdateInput,
  ): Promise<Author> {
    const a = await this.authorRepo.findOne({ id: input.id });
    if (!a) throw new Error('Author not found');

    a.name = input.name;
    await this.authorRepo.save(a);

    return Author.fromEntity(a);
  }
}
