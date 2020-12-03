const dbMethods = require('../dbMethods.js');
const sessions = require('../sessions.js');

module.exports = {
  urlPatern: /^\/api\/auth$/,
  handler : async function(request, response, postData, sessionContext){
    let resultCheckUser = {
      authed: false
    };

    if('username' in sessionContext){
      resultCheckUser.authed = true;
      resultCheckUser.message = `You will already authed like ${sessionContext.username}`;
      return sendResponseObj(200, resultCheckUser, response);
    }

    if(request.method !== 'POST'){
      resultCheckUser.message = 'Not supported method . Try other HTTP method.';
      return sendResponseObj(400, resultCheckUser, response);
    }

    if( !('login' in postData) ){
      resultCheckUser.message = 'Not login in post data';
      return sendResponseObj(400, resultCheckUser, response);
    }

    if(request.headers.cookie !== undefined){
      return sendResponseObj(403, resultCheckUser, response);
    }

    let statusCode;
    try {
      let userInfo = await dbMethods.getUserInfo(postData.login);

      if(userInfo.password !== postData.password) {
        statusCode = 400;
      } else {
        await sessions.generateSession(response, postData)
        resultCheckUser.authed = true;
        statusCode = 200;
      }

      return sendResponseObj(statusCode, resultCheckUser, response);

    } catch(err) {
      console.log(`Error: ${err}\n`);
      resultCheckUser.message = 'Server error. Try again later...'
      return sendResponseObj(500, resultCheckUser, response);
    }
  }
}

function sendResponseObj(statusCode, resultObj, response){
  response.setHeader('Content-Type', 'application/json');
  response.statusCode = statusCode;
  response.end(JSON.stringify(resultObj));
  return true;
}
