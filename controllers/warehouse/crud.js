import models from "../../models";

const createByAdmin = async (req, res) => {
    try {
        const { name, location, memo } = req.body;

        if(!name || !location)
            return res.status(400).send({ message: "필수 정보를 기입해주세요." });

        const data = { name, location };
        if(memo) data.memo = memo;

        await models.warehouse.create(data);

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
