import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Sequelize instance connected to PostgreSQL
 * Uses env vars for host, port, credentials
 */
const dialectOptions = {};
const isProd = process.env.NODE_ENV === 'production' || process.env.RENDER === 'true';
const sslDisabled = process.env.DB_SSL === 'false';

if (isProd && !sslDisabled) {
  dialectOptions.ssl = {
    require: true,
    rejectUnauthorized: false,
  };
} else if (process.env.DB_SSL === 'true' || process.env.DB_SSL === 'require') {
  dialectOptions.ssl = {
    require: true,
    rejectUnauthorized: false,
  };
}

let dbHost = process.env.DB_HOST || 'localhost';
if (dbHost.startsWith('dpg-') && !dbHost.includes('.') && process.env.USE_EXTERNAL_DB === 'true') {
  const region = process.env.DB_REGION || 'singapore';
  dbHost = `${dbHost}.${region}-postgres.render.com`;
}

const sequelize = process.env.DATABASE_URL
  ? new Sequelize(process.env.DATABASE_URL, {
      dialect: 'postgres',
      logging: false,
      dialectOptions,
      pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000,
      },
    })
  : new Sequelize(
      process.env.DB_NAME || 'apimock',
      process.env.DB_USER || 'postgres',
      process.env.DB_PASS || 'postgres',
      {
        host: dbHost,
        port: parseInt(process.env.DB_PORT, 10) || 5432,
        dialect: 'postgres',
        logging: false,
        dialectOptions,
        pool: {
          max: 5,
          min: 0,
          acquire: 30000,
          idle: 10000,
        },
      }
    );

export default sequelize;

