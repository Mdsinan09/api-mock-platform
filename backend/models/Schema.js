import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Schema = sequelize.define(
  'Schema',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [1, 255]
      }
    },
    openapi_json: {
      type: DataTypes.JSONB,
      allowNull: false,
      validate: {
        notNull: true
      }
    }
  },
  {
    tableName: 'schemas',
    timestamps: true,
    underscored: true
  }
);

export default Schema;
