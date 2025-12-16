const express = require("express");
require("./models");
const userRoutes = require("./routes/user.routes");

const app = express();
app.use(express.json());
app.use("/api", userRoutes);

app.listen(3000, () => {
  console.log("Server running on port 3000");
});

console.log("App started");
