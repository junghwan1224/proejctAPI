import Sequelize from "sequelize";
import ClientModel from "./warehouse";
import InventoryModel from "./inventory";
import OrderModel from "./order";
import ProductModel from "./product";
import StaffModel from "./staff";
import WarehouseModel from "./warehouse";

const sequelize = new Sequelize({
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD || null,
  database: process.env.DB_NAME,
  host: process.env.DB_HOST,
  dialect: "mysql",
  operatorsAliases: "0",
  logging: false,
});

const models = {
  client: sequelize.import("client", ClientModel),
  inventory: sequelize.import("inventory", InventoryModel),
  order: sequelize.import("order", OrderModel),
  product: sequelize.import("product", ProductModel),
  staff: sequelize.import("staff", StaffModel),
  warehouse: sequelize.import("warehouse", WarehouseModel),
};

export default models;

// "use strict";

// const fs = require("fs");
// const path = require("path");
// const Sequelize = require("sequelize");
// const basename = path.basename(__filename);
// const db = {};

// const sequelize = new Sequelize({
//   username: process.env.DB_USER,
//   password: process.env.DB_PASSWORD || null,
//   database: process.env.DB_NAME,
//   host: process.env.DB_HOST,
//   dialect: "mysql",
//   operatorsAliases: "0",
//   logging: false,
// });

// fs.readdirSync(__dirname)
//   .filter((file) => {
//     return (
//       file.indexOf(".") !== 0 && file !== basename && file.slice(-3) === ".js"
//     );
//   })
//   .forEach((file) => {
//     const model = sequelize["import"](path.join(__dirname, file));
//     db[model.name] = model;
//   });

// Object.keys(db).forEach((modelName) => {
//   if (db[modelName].associate) {
//     db[modelName].associate(db);
//   }
// });

// db.sequelize = sequelize;
// db.Sequelize = Sequelize;

// module.exports = db;
