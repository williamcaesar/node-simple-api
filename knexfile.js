// Update with your config settings.

module.exports = {
  client: 'pg',
  version: '10.3',
  connection: {
    host : '127.0.0.1',
    port: '5430',
    user : 'marshall',
    password : 'marshall',
    database : 'marshall'
  },
  pool: {
    min: 2,
    max: 10
  },
  migrations: {
    tableName: 'knex_migrations'
  }
};
