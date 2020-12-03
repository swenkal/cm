const sessions = require('../sessions.js');
module.exports = {
  urlPatern : /^\/api\/exit$/,
  handler : async function (request, response, postData, sessionContext){
    let exitResult = { exit : false };

    if(!('username' in sessionContext)){
      exitResult.message = 'You must log in. Follow to /api/auth';
      return sendResponseObj(401, exitResult, response);
    }
    try {
      exitResult.exit = await sessions.deleteUserSession(request, response);;
      sendResponseObj(200, exitResult, response);
    } catch(e) {
      console.log(`Error in exit.js handler: ${e}\n`);
      exitResult.message = 'Server error. Please, try again later...';
      sendResponseObj(500, exitResult, response);
    }
  }
}

function sendResponseObj(statusCode, resultObj, response){
  response.setHeader('Content-Type', 'application/json');
  response.statusCode = statusCode;
  response.end(JSON.stringify(resultObj));
  return true;
}
