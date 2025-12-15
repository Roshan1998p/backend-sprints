const { Sequelize } = require("sequelize");

const sequelize = new Sequelize("dbname", "username", "password", {
  host: "localhost",
  dialect: "mysql",
});
module.exports = sequelize;

//db setup
