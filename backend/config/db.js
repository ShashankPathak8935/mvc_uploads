// backend/config/db.js
const { Sequelize } = require('sequelize');

// Replace these with your actual database credentials
const sequelize = new Sequelize('postgres', 'postgres', 'SHASHAnk8935@00', {
  host: 'localhost',
  dialect: 'postgres',
});

module.exports = sequelize;
