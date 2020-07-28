import models from "../../models";
import Fields from './fields';
import validate from '../common/validate';

const createByAdmin = async (req, res) => {
    try {
        if(! validate(Fields, req.body)) {
            return res.status(400).send({ message: "필수로 입력해야 하는 정보를 입력하지 않으셨습니다." });
        }

        await models.inventory.create(req.body);

        return res.status(201).send();
    }
    catch(err) {
        console.log(err);
        return res.status(400).send();
    }
};

const readByAdmin = async (req, res) => {
    try {
        const { inventory_id } = req.query;

        const inventory = await models.inventory.findOne({
            where: { id: inventory_id },
            include: [
                {
                    model: models.product,
                    required: true
                },
                {
                    model: models.warehouse,
                    required: true
                }
            ]
        });

        return res.status(200).send(inventory);
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

        const POSSIBLE_ATTRIBUTES = [
            "sector",
            "quantity",
            "ea_per_unit",
        ];

        let newData = {};
        POSSIBLE_ATTRIBUTES.map(
            (attribute) => (newData[attribute] = req.body[attribute])
        );

        await models.inventory.update(newData, {
            where: { id: req.body.inventory_id }
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
        const { inventory_id } = req.query;

        await models.inventory.destroy({
            where: { id: inventory_id }
        });

        return res.status(200).send();
    }
    catch(err) {
        console.log(err);
        return res.status(400).send();
    }
};

export default { readByAdmin, createByAdmin, updateByAdmin, deleteByAdmin };
