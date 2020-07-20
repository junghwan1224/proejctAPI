import models from "../../models";
import S3 from "../common/s3";

const upload = async (req, res) => {
    try {
        const { file } = req.files;
        const { product_id } = req.body;
        const path = `product/${product_id}`;

        // 이미 제품을 등록한 경우
        const files = await S3.getFileList(path);
        if(files.length) {
            const deleteProductImage = files.map(file => S3.deleteFile(file.Key));
            await Promise.all(deleteProductImage);
        }

        await S3.uploadFile(file.data, file.mimetype, `${path}/${file.name}`);

        await models.product.update({ "image": `${path}/${file.name}` }, {
            where: { id: product_id }
        });

        return res.status(200).send();
    }
    catch(err) {
        console.log(err);
        return res.status(400).send();
    }
};

export default upload;