import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';

import { AuthorEntity } from './author';

@Entity({ name: 'book' })
export class BookEntity {
  @PrimaryGeneratedColumn({ type: 'int' })
  id!: number;

  @Column()
  name!: string;

  @Column()
  pageCount!: number;

  @ManyToOne(
    type => AuthorEntity,
    author => author.books,
    { nullable: false },
  )
  author!: AuthorEntity;

  @Column({ nullable: false })
  authorId!: number;
}
