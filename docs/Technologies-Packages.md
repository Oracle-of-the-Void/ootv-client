## Technologies and Packages

#### Front End - Browser

* HTML - definitely have some HTML5 elements in use
* CSS - I attempt to do stuff with CSS when possible: menu dropdowns, etc.
* jQuery - Eventually this should probably get phased out by more native HTML5 things, but this is what I'm familiar with from Oracle 1.0 https://jquery.com/
* JSON - data is recieved from API calls in JSON format
* JsRender - JsRender formats tables of JSON data into viewable form.  https://www.jsviews.com/
  * With the ability to use the same JSON data on several different forms, we can switch quickly between different viewing types without latency/overhead of more API calls
  * E.G.  visual spoiler, detailed listing, simple listing, download as text, etc.
* amazon-cognito-auth - Handles much of the Cognito Auth work.  https://github.com/aws/amazon-cognito-auth-js
* PDFKit - Building pdfs for proxies/spoiler printing, etc.  https://pdfkit.org/
* blob-stream - used in PDF workflow.  https://github.com/devongovett/blob-stream
* Balloon.css - pure CSS tooltips  https://kazzkiq.github.io/balloon.css/
* feathericons - simple iconography in sprite form  https://feathericons.com/

#### Back End - AWS Native

* S3 - storage for static content
* Cloudfront - CDN acceleration for S3
* DynamoDB - Storage for the card databases
  * oracle-all-users - Storage of individual user info (No authentication tokens, those are all in Cognito)  Use email as primary field
    * Indexed by uid and email
  * oracle-all-emails - email -> uid mapping to support alternate emails (can be used to merge accounts, especially social logins with differing emails)
  * oracle-all-lists - Storage of card and decklists for users
  * oracle-xxx - Database for game xxx
* Elasticsearch Service - a Lambda function is set up to trigger on DynamoDB stream updates on the oracle-xxx databases and funnel it to Elasticsearch
  * Each database has it's own index in elastic:  oracle-xxx-versioninfo
  * versioninfo is so a new index can be created and populated while keeping the system live
  * an alias oracle-xxx points to the current index.  This is used by the API lambdas, and also the lambda for dynamodb stream
* Cognito User Pools - Handles all authentication.   API Lambdas that need auth just verify the JWT the browser gets from Cognito.   email is stored from Cognito to match the user stored in DynamoDB
* API Gateway - API gateway receives API calls and directs them to the appropriate lambda for the call.  It does some sanity checking before Lambda is called as well (auth info is there before passing it, etc.. although Lambda still validates auth)
* Lambda - mostly running node.js to general reduce number of languages Oracle is coded in.  Handles all of the backend work of user/list/card/database management and search
  * oracle-verify-jwt (lambda) - Used to verify JWT from Cognito https://github.com/awslabs/aws-support-tools/tree/master/Cognito/decode-verify-jwt
  * aws-dynamodb-to-elasticsearch (python) - Glue between dynamodb and elastic.  https://github.com/vladhoncharenko/aws-dynamodb-to-elasticsearch
  * Most of the rest use AWS SDK   (Note: I probably need to look at these closer and make sure i have all the node.js packages included documented)

