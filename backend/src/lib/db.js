import sql from 'mssql';
import { config } from '../config.js';

let poolPromise;

export const getPool = async () => {
  if (!poolPromise) {
    poolPromise = sql.connect(config.db);
  }
  return poolPromise;
};

export { sql };
