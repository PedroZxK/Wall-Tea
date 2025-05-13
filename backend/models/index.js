const { Sequelize, DataTypes } = require('sequelize');

const sequelize = new Sequelize('walltea', 'root', '', {
  host: 'localhost',
  dialect: 'mysql',
});

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

// Importa o model
db.Usuario = require('./usuario')(sequelize, DataTypes);

module.exports = db;
