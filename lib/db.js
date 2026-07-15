// lib/db.ts — Sequelize MySQL connection
import { Sequelize } from 'sequelize';
import mysql2 from 'mysql2';

const sequelize = new Sequelize(
  process.env.DB_NAME || 'matrimonial',
  process.env.DB_USER || 'root',
  process.env.DB_PASSWORD || '',
  {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306'),
    dialect: 'mysql',
    dialectModule: mysql2,
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
    define: {
      timestamps: true,
      underscored: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    },
  }
);

export async function connectDB() {
  try {
    await sequelize.authenticate();
    console.log('✅ MySQL connected successfully');
  } catch (error) {
    console.error('❌ Unable to connect to MySQL:', error);
    throw error;
  }
}

export default sequelize;
