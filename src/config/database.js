const { Sequelize } = require("sequelize");

const isProduction = process.env.NODE_ENV === "production";
const isRailway = Boolean(process.env.RAILWAY_ENVIRONMENT || process.env.RAILWAY_PROJECT_ID);
const enableSqlLogging = process.env.DEBUG_SQL === "1";
const hasDatabaseUrl = Boolean(process.env.DATABASE_URL);

if ((isProduction || isRailway) && !hasDatabaseUrl) {
  throw new Error(
    "DATABASE_URL is required for Railway/production. Configure Railway Postgres and set DATABASE_URL."
  );
}

const sequelize = hasDatabaseUrl
  ? new Sequelize(process.env.DATABASE_URL, {
      dialect: "postgres",
      dialectOptions: isProduction
        ? {
            ssl: {
              require: true,
              rejectUnauthorized: false,
            },
          }
        : {},
      logging: enableSqlLogging ? console.log : false,
    })
  : new Sequelize({
      dialect: "sqlite",
      storage: process.env.SQLITE_STORAGE || "./database.sqlite",
      logging: enableSqlLogging ? console.log : false,
    });

module.exports = sequelize;
