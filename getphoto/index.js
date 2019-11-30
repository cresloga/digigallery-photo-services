var S3 = require('aws-sdk/clients/s3');
const S3_BUCKET = process.env.S3_BUCKET;

const awsS3Config = 
{
	region :process.env.S3_REGION
};

exports.handler = function(event, context,callback) {
	var picIndex = event.queryStringParameters.picIndex;
	console.log("picIndex Received: "+picIndex);
	const s3 = new S3(awsS3Config);
	var params = {Bucket: S3_BUCKET};

	var responseBody = {};  
	var responseStatus = 200;
	var responseContentType = "application/json";

	s3.listObjects(params, function(err, data){
		if(err){
			console.log("Error listing objects: "+err);
			responseBody = err;
			responseStatus = 417;
			respond(responseStatus, responseContentType, responseBody, callback);
		}
		else{
			console.log("List of Objects: "+data);
			var bucketContents = data.Contents;
			if(picIndex<0) picIndex = bucketContents.length-1;
			else if (picIndex>=bucketContents.length) picIndex = 0;		
			console.log("picIndex to be used: "+picIndex);
			console.log("bucket size: "+bucketContents.length);
			if(picIndex<bucketContents.length){
				var urlParams = {Bucket: S3_BUCKET, Key: bucketContents[picIndex].Key};
				s3.getSignedUrl('getObject',urlParams, function(err, url){
					if(err){
						console.log("Error getting signedUrl : "+err);
						responseBody = err;
						responseStatus = 417;
					}
					else{
						console.log("URL : "+url);
						responseBody = {
							url: url,
							picIndex: picIndex,
							fileName: bucketContents[picIndex].Key      		
						};								        
					}
					respond(responseStatus, responseContentType, responseBody, callback);
				});
			}	    
		}				
	});
}

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