module.exports = {
  urlPatern: /^\/api$/,
  handler(request, response, postData, sessionContext){
    response.setHeader('Content-Type', 'application/json;');
    response.statusCode = 200;
    let indexApiResult = { hello: 'Welcome to the account REST-ful api server!' };
    response.end(JSON.stringify(indexApiResult));
  }
}
