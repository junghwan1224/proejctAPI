import models from "../../models";
import Fields from './fields';
import validate from '../common/validate';

const createByAdmin = async (req, res) => {
    try {
        if(validate(Fields, req.body)) {
            return res.status(400).send({ message: "필수로 입력해야 하는 정보를 입력하지 않으셨습니다." });
        }

        await models.order.create(req.body);

        return res.status(201).send();
    }
    catch(err) {
        console.log(err);
        return res.status(400).send();
    }
};

const readByAdmin = async (req, res) => {
    try {
        const { order_id } = req.query;

        const order = await models.order.findOne({
            where: { id: order_id },
            include: [
                {
                    model: models.staff,
                    attributes: [
                        "id",
                        "email",
                        "name",
                        "phone"
                    ],
                    required: true
                }
            ]
        });

        const { client_id } = order.dataValues;

        const data = {};
        data.order = order;

        if(client_id) {
            const client = await models.client.findOne({
                where: { id: client_id }
            });
            data.client = client;
        }

        return res.status(200).send(data);
    }
    catch(err) {
        console.log(err);
        return res.status(400).send();
    }
};

const updateByAdmin = async (req, res) => {
    try {
        if(validate(Fields, req.body)) {
            return res.status(400).send({ message: "필수로 입력해야 하는 정보를 입력하지 않으셨습니다." });
        }

        const { order_id } = req.body;

        const order = await models.order.findOne({
            where: { id: order_id }
        });

        if(!order) {
            return res
                .status(400)
                .send({ message: "해당 주문이 존재하지 않습니다." });
        }

        const POSSIBLE_ATTRIBUTES = [
            "date",
            "items",
            "vat",
            "paid_amount",
            "client_id",
            "staff_id",
            "foreign_info",
            "memo",
            "classification",
            "type",
            "attachments",
            "reference"
        ];
    
        let newData = {};
        POSSIBLE_ATTRIBUTES.map(
            (attribute) => (newData[attribute] = req.body[attribute])
        );

        await order.update(newData);

        return res.status(200).send();
    }
    catch(err) {
        console.log(err);
        return res.status(400).send();
    }
};

const deleteByAdmin = async (req, res) => {
    try {
        const { order_id } = req.query;

        await models.order.destroy({
            where: { id: order_id }
        });

        return res.status(200).send();
    }
    catch(err) {
        console.log(err);
        return res.status(400).send();
    }
};

export default { readByAdmin, createByAdmin, updateByAdmin, deleteByAdmin };
