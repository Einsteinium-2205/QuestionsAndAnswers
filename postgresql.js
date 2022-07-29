import postgresql from 'pg';
import os from 'os';


const { Pool } = postgresql;

export default (callback = null) => {

  //make a connection pool
  const pool = new Pool({
    user: 'Juan',
    // user: process.env.NODE_ENV === 'development' && (os.userInfo() || {}).username || '',
    database: 'questions',
    host: 'localhost',
    port: 5432,
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
