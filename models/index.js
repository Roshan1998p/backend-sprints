const sequelize = require("../config/database");
const User = require("../models/user.model");
const Product = require("./product.model");

sequelize
  .sync({ alter: true })
  .then(() => {
    console.log("Database Sync");
  })
  .catch((er) => {
    console.log(er);
  });

module.exports = {
  User,
  Product,
};
