import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Sequelize instance connected to PostgreSQL
 * Uses env vars for host, port, credentials
 */
const dialectOptions = {};
if (process.env.DB_SSL === 'true' || process.env.DB_SSL === 'require') {
  dialectOptions.ssl = {
    require: true,
    rejectUnauthorized: false,
  };
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
        host: process.env.DB_HOST || 'localhost',
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

