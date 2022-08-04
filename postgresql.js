import dotenv from 'dotenv';
import postgresql from 'pg';
import os from 'os';

dotenv.config();

const { Pool } = postgresql;

export default (callback = null) => {

  //make a connection pool
  const pool = new Pool({
    user: process.env.PGUSER,
    database: process.env.PGDATABASE,
    host: process.env.PGHOST,
    port: process.env.PGPORT,
  });

  //make the connection accessible for our app
  const connection = {
    pool,
    query: (...args) => {
      return pool.connect().then((client) => {
        return client.query(...args).then((res) => {
          client.release();
          return res.rows;
        })
      })
    }
  };

  process.postgresql = connection;

  if (callback) {
    callback(connection);
  }

  return connection;
}
