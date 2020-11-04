
module.exports = {
  urlPatern : /^\/api\/whoami$/,
  handler : function(request, response, postData, sessionContext) {
    let resultCheckSession = {};
    response.setHeader('Content-Type', 'application/json');

    if('username' in sessionContext) {
      response.statusCode = 200;
      resultCheckSession.username = sessionContext.username;
    } else {
      response.statusCode = 403;
      resultCheckSession.message = 'You must log in. Follow to /api/auth';
    }
    response.end(JSON.stringify(resultCheckSession));
  }
}
