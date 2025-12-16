const { User } = require("../models");

exports.createUser = async (req, res) => {
  console.log("crerateuser");

  try {
    const user = await User.create({
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,
    });

    res.status(201).json({
      message: "User created successfully",
      data: user,
    });
  } catch (error) {
    res.status(400).json({
      error: error.message,
    });
  }
};
