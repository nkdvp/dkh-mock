import mysql2 from 'mysql2';
import Logger from './logger';

const logger = Logger.create('mysql');
const dbServer = {
  host: process.env.DB_HOST || 'localhost',
  port: <number><unknown>process.env.DB_PORT || 3306,
  user: process.env.DB_USERNAME || '',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_DATABASE || '',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
};

const mySqlConnection = new Promise((resolve, reject) => {
  try {
    resolve(
      mysql2.createPool(dbServer).promise()
        .on('enqueue', () => { logger.info('mysql enqueue'); }),
    );
  } catch (e) {
    reject(e);
  }
});
export default mySqlConnection;
