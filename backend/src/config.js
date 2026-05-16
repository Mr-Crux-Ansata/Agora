import dotenv from 'dotenv';

dotenv.config();

const toBool = (value, fallback = false) => {
  if (value == null) return fallback;
  return String(value).toLowerCase() === 'true';
};

const toInt = (value, fallback) => {
  const parsed = Number.parseInt(value, 10);
  return Number.isNaN(parsed) ? fallback : parsed;
};

export const config = {
  port: toInt(process.env.PORT, 4000),
  db: {
    server: process.env.DB_SERVER || 'localhost',
    port: toInt(process.env.DB_PORT, 1433),
    user: process.env.DB_USER || 'sa',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'agora',
    options: {
      encrypt: toBool(process.env.DB_ENCRYPT, false),
      trustServerCertificate: toBool(process.env.DB_TRUST_SERVER_CERTIFICATE, true)
    }
  }
};
