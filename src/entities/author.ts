import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';

import { BookEntity } from './book';

// не станем совмещать typeORM entity и graphQL type в одном объекте, помучаемся

@Entity({ name: 'author' })
export class AuthorEntity {
  @PrimaryGeneratedColumn({ type: 'int' })
  id!: number;

  @Column()
  name!: string;

  @OneToMany(
    type => BookEntity,
    book => book.author,
  )
  books!: BookEntity[];
}
