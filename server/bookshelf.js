import Bookshelf from 'bookshelf';
import Knex from 'knex';

import plaidConfig from 'plaid.config';

const dbSettings = plaidConfig.db.mysql;
const knexInstance = Knex({
  client: 'mysql',
  connection: {
    host: dbSettings.host,
    port: dbSettings.port,
    database: dbSettings.database,
    user: dbSettings.user,
    password: dbSettings.password,
  },
  pool: {
    min: 10,
    max: dbSettings.connectionLimit,
  },
  debug: plaidConfig.server.isDevMode,
});
const bookshelfInstance = Bookshelf(knexInstance);
bookshelfInstance.plugin('registry');

export default bookshelfInstance;
export const knex = bookshelfInstance.knex;
