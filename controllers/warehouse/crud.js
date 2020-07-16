import models from "../../models";
import Fields from './fields';
import validate from '../common/validate';

const createByAdmin = async (req, res) => {
    try {
        if(! validate(Fields, req.body)) {
            return res.status(400).send({ message: "필수로 입력해야 하는 정보를 입력하지 않으셨습니다." });
        }

        await models.warehouse.create(req.body);

        return res.status(201).send();
    }
    catch(err) {
        console.log(err);
        return res.status(400).send();
    }
};

const readByAdmin = async (req, res) => {
    try {
        const { warehouse_id } = req.query;

        const warehouseInfo = await models.warehouse.findOne({
            where: { id: warehouse_id },
            attributes: {
                exclude: ["createdAt", "updatedAt"]
            }
        });

        return res.status(200).send(warehouseInfo);
    }
    catch(err) {
        console.log(err);
        return res.status(400).send();
    }
};

const updateByAdmin = async (req, res) => {
    try {
        if(! validate(Fields, req.body)) {
            return res.status(400).send({ message: "필수로 입력해야 하는 정보를 입력하지 않으셨습니다." });
        }

        const POSSIBLE_ATTRIBUTES = ["name", "location", "memo"];
        const newData = {};
        POSSIBLE_ATTRIBUTES.map(
            (attribute) => (newData[attribute] = req.body[attribute])
        );

        const { warehouse_id } = req.body;

        await models.warehouse.update(newData, {
            where: { id: warehouse_id }
        });

        return res.status(200).send();
    }
    catch(err) {
        console.log(err);
        return res.status(400).send();
    }
};

const deleteByAdmin = async (req, res) => {
    try {
        const { warehouse_id } = req.query;
        
        await models.warehouse.destroy({
            where: { id: warehouse_id }
        });

        return res.status(200).send();
    }
    catch(err) {
        console.log(err);
        return res.status(400).send();
    }
};

export default { readByAdmin, createByAdmin, updateByAdmin, deleteByAdmin };
