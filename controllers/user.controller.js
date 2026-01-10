const prisma = require("../prisma/prisma"); // adjust path if needed

exports.createUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    console.log(req.body, "req.body");

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password, // ⚠️ hash later
      },
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
