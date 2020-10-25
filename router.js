const fs = require('fs');

module.exports = {
  rebootHandlers,
  route
}

let apiHandlers = [];

function rebootHandlers(callback){
  let newApiHandlers = [];
  let booted = 0;
  const PATH_TO_HANDLERS = './handlers/';
  fs.readdir(PATH_TO_HANDLERS, (err, handlersList) => {
    if(err) callback(err);
    let fullPathToHandler;
    let stat;
    handlersList.forEach(handlerName => {
      fullPathToHandler = `${PATH_TO_HANDLERS}${handlerName}`;
      stat = fs.statSync(fullPathToHandler);
      if(stat.isFile()){
        try{
          newApiHandlers.push(require(fullPathToHandler));
          console.log(`Booted handler: ${handlerName}\n`);
        }
        catch(err){
          console.log(`Can't boot handler: ${handlerName}\n ${err}`);
        }
      }
      if(++booted == handlersList.length){
        apiHandlers = newApiHandlers;
        callback(null);
      }
    });
  });
}

function route(request, response){
  let requestedUrl = decodeURI(request.url);
  let apiRegExp = new RegExp('^/api', 'g');
  let errorApiResult = {};

  if(!apiRegExp.test(requestedUrl)){
    response.setHeader('Content-Type', 'application/json;');
    response.statusCode = 400;
    errorApiResult.message = 'Bad request. Try type "/api" in url';
    response.end(JSON.stringify(errorApiResult));
  }

  collectPostData(request, (postData) => {
    let sessionContext = {};
    for(let handler of apiHandlers){
      if(handler.urlPatern.test(requestedUrl)){
        handler.handler(request, response, postData, sessionContext);
        return;
      }
    }
    response.setHeader('Content-Type', 'application/json;');
    response.statusCode = 404;
    errorApiResult.message = 'Not found handler for this url.';
    response.end(JSON.stringify(errorApiResult));
  });
}

function collectPostData (request, callback) {
  let postData = '';
  request.on('data', (chunk) => {
    postData += chunk.toString();
  });

  request.on('end', () => {
    let decodedPostData = decodeURIComponent(postData);
    console.log(`Func collectPostData ${decodedPostData}`);
    callback(parsePostParams(decodedPostData));
    return
  });
}

function parsePostParams(postData){
  let requestParams = {};
  let decodedPostData = decodeURI(postData);
  if (postData)
    for (let keyValue of decodedPostData.split("&")) {
      let [key, value] = keyValue.split("=");
      requestParams[key] = value;
  }
  return requestParams;
}
