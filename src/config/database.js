const { Sequelize } = require("sequelize");

const isProduction = process.env.NODE_ENV === "production";

const sequelize = process.env.DATABASE_URL
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
      logging: false,
    })
  : new Sequelize({
      dialect: "sqlite",
      storage: "./database.sqlite",
      logging: console.log,
      // Disable foreign key constraints during table creation
      dialectOptions: {
        // Don't enforce foreign keys during sync
      },
    });

module.exports = sequelize;
