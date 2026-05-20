import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';

// Имитация базы данных
const authors = [
  { id: '1', name: 'Лев Толстой', birthYear: 1828 },
  { id: '2', name: 'Фёдор Достоевский', birthYear: 1821 },
  { id: '3', name: 'Джордж Оруэлл', birthYear: 1903 },
];

const books = [
  { id: '1', title: 'Война и мир', year: 1869, authorId: '1' },
  { id: '2', title: 'Анна Каренина', year: 1877, authorId: '1' },
  { id: '3', title: 'Преступление и наказание', year: 1866, authorId: '2' },
  { id: '4', title: 'Братья Карамазовы', year: 1880, authorId: '2' },
  { id: '5', title: '1984', year: 1949, authorId: '3' },
];

// Схема
const typeDefs = `#graphql
  type Author {
    id: ID!
    name: String!
    birthYear: Int
    books: [Book!]!
  }

  type Book {
    id: ID!
    title: String!
    year: Int!
    author: Author!
  }

  type Query {
    books: [Book!]!
    book(id: ID!): Book
    authors: [Author!]!
  }

  type Mutation {
    createBook(title: String!, year: Int!, authorId: ID!): Book!
    createAuthor(name: String!, birthYear: Int): Author!
  }
`;

// Резолверы
const resolvers = {
  Query: {
    books: () => books,
    book: (_, args) => books.find(book => book.id === args.id),
    authors: () => authors,
  },

  Mutation: {
    createBook: (_, args) => {
      const newBook = {
        id: String(books.length + 1),
        title: args.title,
        year: args.year,
        authorId: args.authorId,
      };
      books.push(newBook);
      return newBook;
    },
    createAuthor: (_, args) => {
      const newAuthor = {
        id: String(authors.length + 1),
        name: args.name,
        birthYear: args.birthYear || null,
      };
      authors.push(newAuthor);
      return newAuthor;
    },
  },

  Book: {
    author: (parent) => authors.find(author => author.id === parent.authorId),
  },

  Author: {
    books: (parent) => books.filter(book => book.authorId === parent.id),
  },
};

const server = new ApolloServer({ typeDefs, resolvers });
const { url } = await startStandaloneServer(server, {
  listen: { port: 4000 },
});

console.log(`Server ready at: ${url}`);