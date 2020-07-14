## Задание

### Используя минимум 2 библиотеки (type-graphql и typeorm):

1) Создать мутации на создание книги и автора в базе.

2) Реализовать запрос на получение списка книг с авторами. Важно
ограничиться двумя запросами к базе за один graphql запрос. Для
author использовать fieldResolver.

3) Тесты:
- Создание автора
- Создание книги
- Получение книг без авторов
- Получение книг с авторами
 

Типы graphql схемы:

    type Book {
      bookId: number;
      name: string;
      pageCount: number;
      authorId: number;
      author: Author;
    }
        
    type Author {
      authorId: number;
      name: string;
    }
 
Пример запроса к graphql:

    query {
      books() {
        name
        author {
          name
        }
      }
    }