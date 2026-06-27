const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Material = sequelize.define('Material', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  unit: {
    type: DataTypes.STRING,
    allowNull: false, // e.g. Bags, Tons, Cum, Litres
  },
  received: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0.00,
  },
  used: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0.00,
  },
  balance: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0.00,
  },
});

module.exports = Material;
