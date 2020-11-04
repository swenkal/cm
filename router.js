const fs = require('fs');
const fsPromises = fs.promises;
const sessions = require('./sessions');

module.exports = {
  rebootHandlers,
  route
}

let apiHandlers = [];

async function rebootHandlers(){
  let newApiHandlers = [];
  let booted = 0;
  const PATH_TO_HANDLERS = './handlers/';
  try {
    let handlersList = await fsPromises.readdir(PATH_TO_HANDLERS);
    let fullPathToHandler;
    let stat;

    handlersList.forEach(handlerName => {
      fullPathToHandler = `${PATH_TO_HANDLERS}${handlerName}`;
      stat = fs.statSync(fullPathToHandler);
      if(stat.isFile()){
        try {
          newApiHandlers.push(require(fullPathToHandler));
          console.log(`Booted handler: ${handlerName}`);
        }
        catch(err){
          console.log(`Can't boot handler: ${handlerName}\n ${err}`);
        }
      }
      if(++booted == handlersList.length){
        apiHandlers = newApiHandlers;
        return true;
      }
    });
  } catch(err){
    throw err;
  }
}

async function route(request, response){
  let requestedUrl = decodeURI(request.url);
  let apiRegExp = new RegExp('^/api', 'g');
  let errorApiResult = {};

  if(!apiRegExp.test(requestedUrl)){
    response.setHeader('Content-Type', 'application/json;');
    response.statusCode = 400;
    errorApiResult.message = 'Bad request. Try type /api in url';
    response.end(JSON.stringify(errorApiResult));
    return true;
  }

  try {
    let postData = await collectPostData(request);
    let sessionContext = await sessions.getSessionContext(request, response);

    for(let handler of apiHandlers){
      if(handler.urlPatern.test(requestedUrl)){
        handler.handler(request, response, postData, sessionContext);
        return true;
      }
    }
    response.setHeader('Content-Type', 'application/json;');
    response.statusCode = 404;
    errorApiResult.message = 'Not found handler for this url.';
    response.end(JSON.stringify(errorApiResult));
  } catch (e) {
    console.log(`Errors in router: ${e}\n`);
  }
}

function collectPostData (request) {
  return new Promise( (resolve, reject) => {
    let postData = '';
    request.on('data', (chunk) => {
      postData += chunk.toString();
    });

    request.on('end', () => {
      let decodedPostData = decodeURIComponent(postData);
      console.log(`Func collectPostData ${decodedPostData}`);
      resolve(parsePostParams(decodedPostData));
    });
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
