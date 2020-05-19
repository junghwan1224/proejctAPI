"use strict";

const S3 = require("./s3");

const Account = require("../../models").account;

// 업로드된 파일 승인(or 삭제) 시, 유저가 업로드한 파일 삭제
const deleteUploadedFiles = async (account_id, action) => {
    const account = await Account.findOne({
        where: { id: account_id },
        attributes: ["crn_document"],
      });
  
    const path = `crn-document/${account_id}`;
    const fileList = await S3.getFileList(path);
    let files = null;
    if(action === "approve") {
        files = fileList.filter(
            (file) => file.Key !== account.dataValues.crn_document
        );
    }
    else { // action === "delete"
        files = fileList;
    }
    // const leftFiles = fileList.filter(
    // (file) => file.Key !== account.dataValues.crn_document
    // );
    // const deleteFile = leftFiles.map((file) => S3.deleteFile(file.Key));
    const deleteFile = files.map(file => S3.deleteFile(file.Key));
    await Promise.all(deleteFile);
};

module.exports = deleteUploadedFiles;