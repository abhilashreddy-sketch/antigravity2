const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const LabourAttendance = sequelize.define('LabourAttendance', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  trade: {
    type: DataTypes.STRING,
    allowNull: false, // e.g. Masons, Carpenters, Electricians, Helpers, Welders
  },
  headcount: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
  hoursWorked: {
    type: DataTypes.DECIMAL(6, 2),
    allowNull: false,
    defaultValue: 0.00,
  },
});

module.exports = LabourAttendance;
