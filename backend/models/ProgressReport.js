const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const ProgressReport = sequelize.define('ProgressReport', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  reportDate: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  completionPercentage: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 0,
      max: 100,
    },
  },
  workDone: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  remarks: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  flaggedDelay: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
});

module.exports = ProgressReport;
