"use strict";

const axios = require("axios");

const Delivery = require("../models").delivery;

exports.readByUser = async (req, res) => {
    try {
        const { order_id, courier, invoice } = req.query;

        let data = {
            "status": {
               "id": null,
               "text": null
            },
            "time": null,
            "location": {
               "name": null
            },
            "description": null
         };

        if(courier === "순회차") {
            const info = await Delivery.findOne({
                where: { order_id }
            });

            data.status.text = info.status;
            data.location.name = info.location;
        }
        else { // 운송장번호로 조회
            const carrier = carriers.filter(c => c.name === courier);
            const tracker = await axios({
                url: `https://apis.tracker.delivery/carriers/${carrier[0].id}/tracks/${invoice}`,
                method: 'get',
            });

            const { progresses } = tracker.data;
            data = JSON.parse(JSON.stringify(progresses[progresses.length-1]));
            data.time = `${data.time.split("T")[0]} ${data.time.split("T")[1].split("+")[0]}`;
        }

        return res.status(200).send(data);
    }
    catch(err) {
        console.log(err);
        return res.status(400).send();
    }
};

const carriers = [
    {
       "id": "de.dhl",
       "name": "DHL",
       "tel": "+8215880001"
    },
    {
       "id": "jp.sagawa",
       "name": "Sagawa",
       "tel": "+810120189595"
    },
    {
       "id": "jp.yamato",
       "name": "Kuroneko Yamato",
       "tel": "+810120189595"
    },
    {
       "id": "jp.yuubin",
       "name": "Japan Post",
       "tel": "+810570046111"
    },
    {
       "id": "kr.chunilps",
       "name": "천일택배",
       "tel": "+8218776606"
    },
    {
       "id": "kr.cjlogistics",
       "name": "CJ대한통운",
       "tel": "+8215881255"
    },
    {
       "id": "kr.cupost",
       "name": "CU 편의점택배",
       "tel": "+8215771287"
    },
    {
       "id": "kr.cvsnet",
       "name": "GS Postbox 택배",
       "tel": "+8215771287"
    },
    {
       "id": "kr.cway",
       "name": "CWAY (Woori Express)",
       "tel": "+8215884899"
    },
    {
       "id": "kr.daesin",
       "name": "대신택배",
       "tel": "+82314620100"
    },
    {
       "id": "kr.epost",
       "name": "우체국 택배",
       "tel": "+8215881300"
    },
    {
       "id": "kr.hanips",
       "name": "한의사랑택배",
       "tel": "+8216001055"
    },
    {
       "id": "kr.hanjin",
       "name": "한진택배",
       "tel": "+8215880011"
    },
    {
       "id": "kr.hdexp",
       "name": "합동택배",
       "tel": "+8218993392"
    },
    {
       "id": "kr.homepick",
       "name": "홈픽",
       "tel": "+8218000987"
    },
    {
       "id": "kr.honamlogis",
       "name": "한서호남택배",
       "tel": "+8218770572"
    },
    {
       "id": "kr.ilyanglogis",
       "name": "일양로지스",
       "tel": "+8215880002"
    },
    {
       "id": "kr.kdexp",
       "name": "경동택배",
       "tel": "+8218995368"
    },
    {
       "id": "kr.kunyoung",
       "name": "건영택배",
       "tel": "+82533543001"
    },
    {
       "id": "kr.logen",
       "name": "로젠택배",
       "tel": "+8215889988"
    },
    {
       "id": "kr.lotte",
       "name": "롯데택배",
       "tel": "+8215882121"
    },
    {
       "id": "kr.slx",
       "name": "SLX",
       "tel": "+82316375400"
    },
    {
       "id": "kr.swgexp",
       "name": "성원글로벌카고",
       "tel": "+82327469984"
    },
    {
       "id": "nl.tnt",
       "name": "TNT"
    },
    {
       "id": "un.upu.ems",
       "name": "EMS"
    },
    {
       "id": "us.fedex",
       "name": "Fedex"
    },
    {
       "id": "us.ups",
       "name": "UPS"
    },
    {
       "id": "us.usps",
       "name": "USPS"
    }
 ];