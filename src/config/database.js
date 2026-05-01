const { Sequelize } = require("sequelize");

const isProduction = process.env.NODE_ENV === "production";
const isRailway = Boolean(process.env.RAILWAY_ENVIRONMENT || process.env.RAILWAY_PROJECT_ID);
const enableSqlLogging = process.env.DEBUG_SQL === "1";
const databaseUrl =
  process.env.DATABASE_URL ||
  process.env.DATABASE_PRIVATE_URL ||
  process.env.POSTGRES_URL ||
  process.env.POSTGRESQL_URL ||
  "";
const hasDatabaseUrl = Boolean(databaseUrl);
const hasPgParts = Boolean(process.env.PGHOST && process.env.PGUSER && process.env.PGDATABASE);

if ((isProduction || isRailway) && !hasDatabaseUrl && !hasPgParts) {
  throw new Error(
    "Postgres config is required for Railway/production. Set DATABASE_URL (or DATABASE_PRIVATE_URL/POSTGRES_URL) or PGHOST/PGPORT/PGUSER/PGPASSWORD/PGDATABASE."
  );
}

const basePostgresOptions = {
  dialect: "postgres",
  dialectOptions: isProduction || isRailway
    ? {
        ssl: {
          require: true,
          rejectUnauthorized: false,
        },
      }
    : {},
  logging: enableSqlLogging ? console.log : false,
};

const sequelize = hasDatabaseUrl
  ? new Sequelize(databaseUrl, {
      ...basePostgresOptions,
    })
  : hasPgParts
  ? new Sequelize(
      process.env.PGDATABASE,
      process.env.PGUSER,
      process.env.PGPASSWORD || "",
      {
        ...basePostgresOptions,
        host: process.env.PGHOST,
        port: Number(process.env.PGPORT) || 5432,
      }
    )
  : new Sequelize({
      dialect: "sqlite",
      storage: process.env.SQLITE_STORAGE || "./database.sqlite",
      logging: enableSqlLogging ? console.log : false,
    });

module.exports = sequelize;
