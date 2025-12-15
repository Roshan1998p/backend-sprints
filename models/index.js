const sequelize = require("../config/database");
const User = require("../models/user.model");

sequelize
  .sync({ alter: true })
  .then(() => {
    console.log("Database Sync");
  })
  .catch((er) => {
    console.log(er);
  });

module.export = {
  User,
};
