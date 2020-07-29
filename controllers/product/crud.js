import models from "../../models";
import Fields from "./fields";
import ControlWrapper from "../common/wrapper";

const wrapper = new ControlWrapper(models.product, Fields);

const createByAdmin = async (req, res) => {
  const locator = {
    name: req.body.name,
  };
  return wrapper.init(req, res, locator).unique().validate().post().end();
};

const readByAdmin = async (req, res) => {
  const locator = {
    id: req.query.product_id,
  };

  return wrapper.init(req, res, locator).get().end();
};

const updateByAdmin = async (req, res) => {
  const locator = {
    id: req.body.product_id,
  };
  return wrapper.init(req, res, locator).exist().supplement().patch().end();
};

const deleteByAdmin = async (req, res) => {
  const locator = {
    id: req.query.product_id,
  };
  return wrapper.init(req, res, locator).exist().delete().end();
};

export default { readByAdmin, createByAdmin, updateByAdmin, deleteByAdmin };
