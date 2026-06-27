const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const SitePhoto = sequelize.define('SitePhoto', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  photoUrl: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

module.exports = SitePhoto;
