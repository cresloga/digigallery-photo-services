var S3 = require('aws-sdk/clients/s3');

const S3_BUCKET = process.env.S3_BUCKET;
const awsS3Config = 
{
	region : process.env.S3_REGION
};

exports.handler = (event, context, callback) => {
  console.log("Event Received : "+ JSON.stringify(event, null, 2));
  console.log("S3 Bucket : "+S3_BUCKET);
  var request = JSON.parse(event.body);
  const s3 = new S3(awsS3Config);
  var fileName = request.fileName;
  var fileType = request.fileType;
  console.log("fileName : "+fileName);
  console.log("fileType : "+fileType);
  const s3Params = {
    Bucket: S3_BUCKET,
    Key: fileName,
    Expires: 60,
    ContentType: fileType,
    ACL: 'public-read'
  };

  console.log("uploading with params: "+JSON.stringify(s3Params, null, 2));

  var responseBody = {};  
	var responseStatus = 200;
	var responseContentType = "application/json";

  s3.getSignedUrl('putObject', s3Params, (err, data) => {
    if(err){
      console.log(err);
      responseBody = err;
			responseStatus = 417;
    }
    else {
    	console.log(data);
    	responseBody = {
        signedRequest: data,
        url: `https://${S3_BUCKET}.s3.amazonaws.com/${fileName}`
      };
    }
    respond(responseStatus, responseContentType, responseBody, callback);
  });
};

function respond(responseStatus, responseContentType, responseBody, callback){
	var response = {
		"statusCode": responseStatus,
		"headers": {
      "Access-Control-Allow-Headers": '*',
      "Access-Control-Allow-Origin": '*',
      "Access-Control-Allow-Methods": '*',
			"Content-Type": responseContentType
		},
		"body": JSON.stringify(responseBody),
		"isBase64Encoded": false
	}
	console.log(response);
	callback(null,response);
}