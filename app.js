const express = require("express");
require("./models");
const userRoutes = require("./routes/user.routes");
const productRoutes = require("./routes/product.routes");
const pool = require("./db");
const prisma = require("./prisma/prisma");

const app = express();
app.use(express.json());
app.use("/api", userRoutes);
app.use("/api", productRoutes);

async function testDB() {
  const users = await prisma.user.findMany();
  console.log(users);
}

testDB();

app.listen(3000, () => {
  console.log("Server running on port 3000");
});

console.log("App started");
