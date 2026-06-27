const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Site = sequelize.define('Site', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  location: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  latitude: {
    type: DataTypes.DECIMAL(10, 8),
    allowNull: true,
  },
  longitude: {
    type: DataTypes.DECIMAL(11, 8),
    allowNull: true,
  },
  status: {
    type: DataTypes.ENUM('active', 'completed', 'suspended', 'delayed'),
    defaultValue: 'active',
  },
  // Foreign keys will be set up in models/index.js associations
});

module.exports = Site;
