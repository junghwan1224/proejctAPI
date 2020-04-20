const CryptoJS = require("crypto-js");
require("dotenv").config();

const SENS_API_V2_URI = process.env.SENS_API_V2_URI;
const SENS_ACCESS_KEY = process.env.SENS_ACCESS_KEY;
const SENS_SECRET_KEY = process.env.SENS_SECRET_KEY;

function makeSignature(times) {
	var space = " ";				// one space
	var newLine = "\n";				// new line
	var method = "POST";				// method
	var url = SENS_API_V2_URI;	// url (include query string)
	var timestamp = times;			// current timestamp (epoch)
	var accessKey = SENS_ACCESS_KEY;			// access key id (from portal or Sub Account)
	var secretKey = SENS_SECRET_KEY;			// secret key (from portal or Sub Account)

    var hmac = CryptoJS.algo.HMAC.create(CryptoJS.algo.SHA256, secretKey);
	hmac.update(method);
	hmac.update(space);
	hmac.update(url);
	hmac.update(newLine);
	hmac.update(timestamp);
	hmac.update(newLine);
	hmac.update(accessKey);

    var hash = hmac.finalize();
    
	return hash.toString(CryptoJS.enc.Base64);
}

module.exports = makeSignature;