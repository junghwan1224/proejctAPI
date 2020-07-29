import models from "../../models";
import Fields from "./fields";
import Controller from "../common/wrapper";

const createByAdmin = async (req, res) => {
  const locator = {
    name: req.body.name,
  };
  const controller = new Controller();

  controller
    .init(models.product, Fields, req, res, locator)
    .then(() => controller.unique())
    .then(() => controller.validate())
    .then(() => controller.post())
    .then(() => controller.send());
};

const readByAdmin = async (req, res) => {
  const locator = {
    id: req.query.product_id,
  };
  const controller = new Controller();

  controller
    .init(models.product, Fields, req, res, locator)
    .then(() => controller.exist())
    .then(() => controller.get())
    .then(() => controller.send());
};

const updateByAdmin = async (req, res) => {
  const locator = {
    id: req.body.product_id,
  };
  const controller = new Controller();

  controller
    .init(models.product, Fields, req, res, locator)
    .then(() => controller.exist())
    .then(() => controller.supplement())
    .then(() => controller.patch())
    .then(() => controller.send());
};

const deleteByAdmin = async (req, res) => {
  const locator = {
    id: req.query.product_id,
  };
  const controller = new Controller();

  controller
    .init(models.product, Fields, req, res, locator)
    .then(() => controller.exist())
    .then(() => controller.delete())
    .then(() => controller.send());
};

export default { readByAdmin, createByAdmin, updateByAdmin, deleteByAdmin };
