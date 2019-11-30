var S3 = require('aws-sdk/clients/s3');

const S3_BUCKET = process.env.S3_BUCKET;

const awsS3Config = 
{
	region :process.env.S3_REGION
};

exports.handler = (event, context, callback) => {
	console.log("Invoked Lambda function to deletePhoto");			
	var fileName = event.queryStringParameters.fileName;
	console.log("Received file name :"+fileName);
	const s3 = new S3(awsS3Config);	
	var urlParams = {Bucket: S3_BUCKET, Key: fileName};
	var responseBody = {};  
	var responseStatus = 200;
	var responseContentType = "application/json";
    s3.deleteObject(urlParams, function(err, data){
    	if(err){
			responseBody = err;
			responseStatus = 417;
		}
		else{					
	        responseBody = {			        	
      			fileName: fileName,
      			status: "Picture Deleted Successfully"
			};
		}
		respond(responseStatus, responseContentType, responseBody, callback);
    });  
};

function respond(responseStatus, responseContentType, responseBody, callback){
	var response = {
		"statusCode": responseStatus,
		"headers": {
			"Content-Type": responseContentType
		},
		"body": JSON.stringify(responseBody),
		"isBase64Encoded": false
	}
	console.log(response);
	callback(null,response);
}