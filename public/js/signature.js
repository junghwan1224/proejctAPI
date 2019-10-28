const CryptoJS = require("crypto-js");

const SENS_API_V2_URL = "/sms/v2/services/ncp:sms:kr:257098754703:hermes_test/messages";
const SENS_ACCESS_KEY = "e3ufC3LRgOjDtrguluqL";
const SENS_SECRET_KEY = "l52wL5U03beMErP90tsSwxFMu2Zoyh0ypM65tcfp";

function makeSignature(times) {
	var space = " ";				// one space
	var newLine = "\n";				// new line
	var method = "POST";				// method
	var url = SENS_API_V2_URL;	// url (include query string)
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