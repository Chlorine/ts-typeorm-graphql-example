import { createConnection, Connection, useContainer } from 'typeorm';
import * as express from 'express';
import { Server as HttpServer } from 'http';
import { Request, Response, NextFunction } from 'express';
import * as bodyParser from 'body-parser';
import { ApolloServer } from 'apollo-server-express';
import { Container } from 'typedi';
import { buildSchema } from 'type-graphql';

import CONFIG from '../config';
import { GenericObject } from './common';

import { AuthorEntity } from './entities/author';
import { BookEntity } from './entities/book';

import { BookResolver } from './graphql/book-resolver';
import { AuthorResolver } from './graphql/author-resolver';

export class Core {
  private _conn: Connection | null = null;
  httpServer: HttpServer | undefined;

  async init(httpPort?: number) {
    // typeORM

    useContainer(Container);

    this._conn = await createConnection({
      logging: process.env.NODE_ENV === 'test' ? undefined : 'all',
      type: 'mysql',
      ...CONFIG.mySql,
      entities: [__dirname + '/entities/*.js'],
      synchronize: true,
    });

    // express + apollo

    const app = express();

    const apolloServer = new ApolloServer({
      schema: await buildSchema({
        container: Container,
        resolvers: [BookResolver, AuthorResolver],
      }),
      playground: {
        settings: {
          'editor.theme': 'light',
        },
      },
    });

    apolloServer.applyMiddleware({ app });

    app
      .use(bodyParser.json({ limit: '1mb' }))
      .get('/', (req: Request, res: Response, next: NextFunction) => {
        res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.write('Привет!');
        res.end();
      })
      .post('/execute', (req: Request, res: Response, next: NextFunction) => {
        this.executeAction(req.body)
          .then(results => res.status(200).send(results))
          .catch(err => res.status(500).send({ success: false, errorMsg: err.message }));
      });

    const port = httpPort || CONFIG.common.httpPort;
    this.httpServer = app.listen(port, () =>
      console.log(`Http server is listening at port ${port}`),
    );
  }

  get dbConn() {
    if (!this._conn) {
      throw new Error(`DB connection is not ready`);
    }
    return this._conn;
  }

  get authorRepo() {
    return this.dbConn.getRepository(AuthorEntity);
  }

  get bookRepo() {
    return this.dbConn.getRepository(BookEntity);
  }

  private async executeAction(params: GenericObject): Promise<GenericObject> {
    const results: GenericObject = {};
    const { action } = params;

    switch (action) {
      case 'doSomething':
        break;
      case 'getAuthors':
        results.authors = await this.authorRepo.find();
        break;
      case 'getBooks':
        results.books = await this.bookRepo.find();
        break;
      case 'createAuthor':
        {
          const author = new AuthorEntity();
          author.name = params.name;
          await this.authorRepo.save(author);
          results.author = author;
        }
        break;
      case 'createBook':
        {
          const { authorId, name, pageCount } = params;

          const bookAuthor = await this.authorRepo.findOne({ id: authorId || 0 });
          if (!bookAuthor) {
            throw new Error(`Author not found`);
          }
          const book = new BookEntity();

          book.author = bookAuthor;
          book.name = name || 'Книга с оторванной обложкой';
          book.pageCount = pageCount || 999;

          await this.bookRepo.save(book);
          results.book = book;
        }
        break;

      default:
        throw new Error(`Required parameter 'action' is missing or invalid`);
    }

    results.success = true;

    return results;
  }
}
