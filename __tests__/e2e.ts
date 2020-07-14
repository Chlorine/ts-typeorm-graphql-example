// с тестами у нас довольно грустно (трудное детство, платные игрушки)
// запустимся на той же базе (.env)

import { HttpLink } from 'apollo-link-http';
import fetch from 'node-fetch';
import { execute, toPromise } from 'apollo-link';
import gql from 'graphql-tag';

import { Core } from '../src/core';
import { GenericObject } from '../src/common';

const BOOKS_QUERY = gql`
  {
    books {
      bookId
    }
  }
`;

const BOOKS_WITH_AUTHORS = gql`
  {
    books {
      name
      author {
        authorId
      }
    }
  }
`;

const CREATE_AUTHOR_MUTATION = gql`
  mutation CreateAuthor($name: String!) {
    createAuthor(input: { name: $name }) {
      authorId
    }
  }
`;

const CREATE_BOOK_MUTATION = gql`
  mutation CreateBook($name: String!, $pageCount: Int!, $authorId: Int!) {
    createBook(input: { name: $name, pageCount: $pageCount, authorId: $authorId }) {
      bookId
    }
  }
`;

describe('Ultra GraphQL Server', () => {
  const randomPort = 8383;
  let core: Core;

  const link = new HttpLink({
    uri: `http://localhost:${randomPort}/graphql`,
    fetch: fetch as any, // ох
  });

  const newAuthor = {
    id: -1,
    name: 'Корней Чуковский ' + new Date().getTime(),
  };

  const newBook = {
    id: -1,
    name: 'Тараканище ' + new Date().getTime(),
    pageCount: 100,
    authorId: -1,
  };

  const gqlExec = (query: typeof BOOKS_QUERY, variables: GenericObject = {}) =>
    execute(link, { query, variables });

  beforeAll(async () => {
    // наверное нужны некоторые действия по очистке тестовой БД...
    await new Promise(resolve => setTimeout(resolve, 123));

    core = new Core();
    await core.init(randomPort);
  });

  it(`creates new author (${newAuthor.name})`, async () => {
    const resp = await toPromise(gqlExec(CREATE_AUTHOR_MUTATION, { name: newAuthor.name }));
    expect(resp).toHaveProperty('data');
    expect(resp.data).toHaveProperty('createAuthor');
    expect(resp.data!.createAuthor).toHaveProperty('authorId');

    newAuthor.id = resp.data!.createAuthor.authorId;
    newBook.authorId = newAuthor.id;
  });

  it(`creates new book (${newBook.name})`, async () => {
    const resp = await toPromise(
      gqlExec(CREATE_BOOK_MUTATION, {
        name: newBook.name,
        pageCount: newBook.pageCount,
        authorId: newBook.authorId,
      }),
    );
    expect(resp).toHaveProperty('data');
    expect(resp.data).toHaveProperty('createBook');
    expect(resp.data!.createBook).toHaveProperty('bookId');

    newBook.id = resp.data!.createBook.bookId;
  });

  it('returns books without authors (with our new book!)', async () => {
    const resp = await toPromise(gqlExec(BOOKS_QUERY, {}));
    expect(resp).toHaveProperty('data');
    expect(resp.data).toHaveProperty('books');
    expect(Array.isArray(resp.data!.books)).toBe(true);

    const books = resp.data!.books as Array<{ bookId: number }>;
    const ourNewBook = books.find(b => b.bookId === newBook.id);
    expect(ourNewBook).toBeDefined();
  });

  it('returns books with authors (with our new author!)', async () => {
    const resp = await toPromise(gqlExec(BOOKS_WITH_AUTHORS, {}));
    expect(resp).toHaveProperty('data');
    expect(resp.data).toHaveProperty('books');
    expect(Array.isArray(resp.data!.books)).toBe(true);

    const books = resp.data!.books as Array<{ bookId: number; author: { authorId: number } }>;
    const ourNewBook = books.find(b => b.author.authorId === newAuthor.id);
    expect(ourNewBook).toBeDefined();
  });

  afterAll(async () => {
    await core.dbConn.close();
    await new Promise(resolve => core.httpServer?.close(resolve));
  });
});
