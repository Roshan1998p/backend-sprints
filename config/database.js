const { Sequelize } = require("sequelize");

// const sequelize = new Sequelize("dbname", "username", "password", {
//   host: "localhost",
//   dialect: "mysql",
// });

const sequelize = new Sequelize({
  dialect: "sqlite",
  storage: "./database.sqlite", // file will be auto-created
  logging: false,
});

module.exports = sequelize;

//db setup
