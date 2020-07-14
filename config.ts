import { Env } from './src/utils/env';

const config = {
  common: {
    httpPort: Env.getInt('PORT', 3000),
  },
  mySql: {
    host: Env.getStr('MYSQL_HOST', '127.0.0.1'),
    port: Env.getInt('MYSQL_PORT', 3306),
    username: Env.getStr('MYSQL_USER', 'invalid_user'),
    password: Env.getStr('MYSQL_PASSWORD', 'invalid_password'),
    database: Env.getStr('MYSQL_DATABASE', 'invalid_database'),
  },
};

export default config;
