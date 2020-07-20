import Sequelize, { DataTypes } from "sequelize";
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
  client: ClientModel(sequelize, DataTypes),
  inventory: InventoryModel(sequelize, DataTypes),
  order: OrderModel(sequelize, DataTypes),
  product: ProductModel(sequelize, DataTypes),
  staff: StaffModel(sequelize, DataTypes),
  warehouse: WarehouseModel(sequelize, DataTypes),
  sequelize: sequelize,
};

Object.keys(models).forEach(model => {
  if(models[model].associate) {
    models[model].associate(models);
  }
});

export default models;
