const { Pool } = require("pg");

const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "backend_practice",
  password: "139819",
  port: 5432,
});

module.exports = pool;
