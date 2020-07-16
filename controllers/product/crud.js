import models from "../../models";
import Fields from './fields';
import validate from '../common/validate';

const createByAdmin = async (req, res) => {
    try {
        if(! validate(Fields, req.body)) {
            return res.status(400).send({ message: "필수로 입력해야 하는 정보를 입력하지 않으셨습니다." });
        }

        const product = await models.product.create(req.body);

        return res.status(201).send(product);
    }
    catch(err) {
        console.log(err);
        return res.status(400).send();
    }
};

const readByAdmin = async (req, res) => {
    try {
        const { product_id } = req.query;

        const product = await models.product.findOne({
            where: { id: product_id }
        });

        return res.status(200).send(product);
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

        const response = await models.staff.findOne({
            where: {
            id: req.body.staff_id,
            },
        });
        if (!response) {
            return res
                .status(400)
                .send({ message: "해당 ID에 대한 유저 데이터가 존재하지 않습니다." });
        }

        const POSSIBLE_ATTRIBUTES = [
            "name",
            "unit",
            "specification",
            "type",
            "price_a",
            "price_b",
            "price_c",
            "price_d",
            "price_e",
            "essential_stock",
            "memo",
            "image"
        ];
    
        let newData = {};
        POSSIBLE_ATTRIBUTES.map(
            (attribute) => (newData[attribute] = req.body[attribute])
        );

        await models.product.udpate(newData, {
            where: { id: req.body.product_id }
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
        const { product_id } = req.query;

        await models.product.destroy({
            where: { id: product_id }
        });

        return res.status(200).send();
    }
    catch(err) {
        console.log(err);
        return res.status(400).send();
    }
};

export default { readByAdmin, createByAdmin, updateByAdmin, deleteByAdmin };
