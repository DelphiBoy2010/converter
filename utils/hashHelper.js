const { Buffer } = require("buffer");
const CryptoJS = require("crypto-js");
require("dotenv").config();

const HOOK_SECRET_KEY = process.env.HOOK_SECRET_KEY;
const codeData = (data) => {
  if (process.env.HASH_DATA === "true") {
    let hashData = JSON.stringify(data);
    hashData = CryptoJS.AES.encrypt(hashData, HOOK_SECRET_KEY).toString();
    hashData = Buffer.from(hashData).toString("hex");
    return hashData;
  } else {
    return data;
  }
};
const decodeData = (data, path) => {
  try {
    if (process.env.HASH_DATA === "true") {
      let tmpData = Buffer.from(data, "hex").toString();
      tmpData = CryptoJS.AES.decrypt(tmpData, HOOK_SECRET_KEY).toString(
        CryptoJS.enc.Utf8
      );
      return JSON.parse(tmpData);
    } else {
      return data;
    }
  } catch (error) {
    console.error("decode data", path, error);
  }
  return "";
};
module.exports = { codeData, decodeData };
