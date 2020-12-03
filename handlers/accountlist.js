const dbMethods = require('../dbMethods.js');
module.exports = {
  urlPatern : /^\/api\/accounts$/,
  handler : async function(request, response, postData, sessionContext){
    let handlerResult = {};

    if(request.method !== 'GET'){
       handlerResult.message = 'Not supported method. Try other.';
       return sendResponseObj(400, handlerResult, response);
    }

    if( !('username' in sessionContext) ){
      handlerResult.message = 'You must log in. Follow to /api/auth';
      return sendResponseObj(401, handlerResult, response);
    }
    try {
      const userInfo = await dbMethods.getUserInfo(sessionContext.username);
      if( userInfo.role !== 'admin'){
        handlerResult.message = 'You are not admin!';
        return sendResponseObj(401, handlerResult, response);
      }
      handlerResult = await dbMethods.getAccountsList();
      return sendResponseObj(200, handlerResult, response);
    } catch(e) {
      console.log(`Error in accountlist handler: ${e}\n`);
      handlerResult.message = 'Server error. Try again later...';
      sendResponseObj(500, handlerResult, response);
    }
  }
}

function sendResponseObj(statusCode, resultObj, response){
  response.setHeader('Content-Type', 'application/json');
  response.statusCode = statusCode;
  response.end(JSON.stringify(resultObj));
  return true;
}
