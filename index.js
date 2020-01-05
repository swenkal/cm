let fs = require('fs');

function loadData() {
  const PATH_TO_FILMS = "./data/films/";
  const PATH_TO_ARTISTS = "./data/artists/";
  let filmNames;
  let artistNames;
  try {
    filmNames = fs.readdirSync(PATH_TO_FILMS);
    artistNames = fs.readdirSync(PATH_TO_ARTISTS);
    console.log(filmNames, artistNames);
  } catch (e) {
    console.log("Проблемки");
  }
  let filmInstances = getInstances(filmNames, PATH_TO_FILMS);
  let artistInstances = getInstances(artistNames, PATH_TO_ARTISTS);
  return {filmInstances, artistInstances};
}
function getInstances(arrayNames, pathToDir) {
  let arrayInstances = [];
  for (let instanceName of arrayNames) {
    let instanceContent = JSON.parse(fs.readFileSync(pathToDir + `${instanceName}`));
    arrayInstances.push(instanceContent);
  }
  return arrayInstances;
}

const mimeTypes = require('./config/mimeTypes.json');

const http = require('http');
const port = 3000;
const requestHandler = (request, response) => {

  let requestedFile = decodeURI(request.url);
  if (requestedFile.slice(-1) === '/') {
      requestedFile += 'index.html';
    }

    const delimeteredFileName = requestedFile.split('.');
    const fileExtension = delimeteredFileName[delimeteredFileName.length-1];

    let contentType = 'application/octet-stream';
    if (typeof mimeTypes[fileExtension] !== 'undefined') {
      contentType = mimeTypes[fileExtension];
    }
    console.log(fileExtension);
    console.log(requestedFile);
    if(businessLogicHandler(request, response))  return;

    try {
      let fileSizeInBytes = fs.statSync(`./web${requestedFile}`)['size'];
      response.setHeader('Content-Length', `${fileSizeInBytes}`);
      response.setHeader('Content-Type', `${contentType}`);
    //  let fileContent = fs.readFileSync(`./web${requestedFile}`);
      let contentRequestedFile = new fs.ReadStream(`./web${requestedFile}`);
      contentRequestedFile.pipe(response);
      contentRequestedFile.on('error', (err) => {
        response.setHeader('Content-Type', 'text/html; charset=utf-8;');
        response.statusCode = 500;
        response.end("Server Error");
        console.error(err);
      });
      response.on('close', () => {
        contentRequestedFile.destroy();
      });
      response.statusCode = 200;
    } catch (e) {
      console.log(e.message);
      response.setHeader('Content-Type', 'text/html; charset=utf-8;');
      response.statusCode = 404;
      response.end('Запрашиваемого файла не существует');
    }
}

function businessLogicHandler(request, response){
  let requestedUrl = decodeURI(request.url);
  let apiRegExp = new RegExp("^/api", "g");

  if(!apiRegExp.test(requestedUrl)) return false;

  let sessionContext = getSessionContext(request);

  collectPostData(request, (requestParams) => {
    let router =
      [
        { urlPatern: /^\/api$/ , handler: indexApiHandler},
        { urlPatern: /^\/api\/auth/ , handler: authorisation},
        { urlPatern: /^\/api\/whoami$/ , handler: checkUserSession}
      ];
    for(location of router){
      console.log(`${location.urlPatern} vs ${requestedUrl}  ${location.urlPatern.test(requestedUrl)}`);
      if(location.urlPatern.test(requestedUrl)) {
        location.handler(request, response, requestParams, sessionContext);
          return true;
        }
      }
      response.setHeader('Content-Type', 'application/json;');
      response.statusCode = 404;
      let errorApiResult = { error: 'Not Found' };
      response.end(JSON.stringify(errorApiResult));
    });
 return true;
}

function getSessionContext(request){
  let userCookie = parseCookie(request.headers.cookie);
  let resultContext = {};
  if(userCookie['token'] == 'undefined' || typeof userCookie['token'] !== 'string') return resultContext;

  const PATH_TO_SESSIONS = "./data/sessions/";
  const TWO_DAYS_IN_MS = 172800000; // 2 day * 24 hour * 60 min * 60 s * 1000 ms

  try {
    let tokenContent = JSON.parse(fs.readFileSync(`${PATH_TO_SESSIONS}${userCookie['token']}.json`));
    if (tokenContent.expiresTime < Date.now()) {
      fs.unlink(`${PATH_TO_SESSIONS}${userCookie['token']}.json`, (err) => {
        if (err) console.error(`Something wrong with deleting sessionFile ${userCookie['token']}: ${err}`);
        console.log('Old session file was deleted');
      });
      return resultContext;
    }

    tokenContent.expiresTime = Date.now() + TWO_DAYS_IN_MS;
    fs.writeFile(`${PATH_TO_SESSIONS}${userCookie['token']}.json`, JSON.stringify(tokenContent), (err) => {
      if (err) console.error(`Can't update session file ${userCookie['token']}: ${err}`);
      console.log(`Session file ${userCookie['token']} updated`);
    });
    resultContext.username = tokenContent.login;
    return resultContext;
  }
  catch(err){
    if(err.code == 'ENOENT'){
      console.error(`Session file not found: ${err}`);
    } else {
      console.error(`Unknown error when read session file: ${err}`);
    }
    return resultContext;
  }
}

function collectPostData (request, callback) {
  let postData = '';
  request.on('data', (chunk) => {
    postData += chunk.toString();
  });

  request.on('end', () => {
    callback(parsePostParams(postData));
    return
  });
}

function parsePostParams(postData){
  let requestParams = {};
  if (postData)
    for (let keyValue of postData.split("&")) {
      let [key, value] = keyValue.split("=");
      requestParams[key] = value;
  }
  return requestParams;
}


function indexApiHandler(request, response, postData, sessionContext){
  response.setHeader('Content-Type', 'application/json;');
  response.statusCode = 200;
  let indexApiResult = { result: null };
  response.end(JSON.stringify(indexApiResult));
}

function checkUserSession(request, response, postData, sessionContext){
    let resultCheckSession = {};
    response.setHeader('Content-Type', 'application/json');
    if('username' in sessionContext) {
      response.statusCode = 200;
      resultCheckSession.username = sessionContext.username;
    } else {
      response.statusCode = 403;
      resultCheckSession.error = 'You must log in. Follow to /api/auth';
    }
   response.end(JSON.stringify(resultCheckSession));
}

function authorisation(request, response, postData, sessionContext) {
    const PATH_TO_PROFILES = "./data/profiles/";
    let resultCheckUser = {
        authed: false
    };

    if ('username' in sessionContext){
      resultCheckUser.authed = true;
      response.statusCode = 200;
      response.setHeader("Content-Type", "application/json");
      response.end(JSON.stringify(resultCheckUser));
      return;
    }

    fs.readFile(`${PATH_TO_PROFILES}${postData.login}.json`,'utf-8', function(err, data){
      response.setHeader("Content-Type", "application/json");
      if (err) {
        response.statusCode = 401;
      } else {
          let userDataObject = JSON.parse(data);
          if(userDataObject.account.password == postData.password){
            console.log(parseCookie(request.headers.cookie));
            resultCheckUser.authed = generateSession(response, postData);
          } else {
            response.statusCode = 401;
          }
      }
      response.end(JSON.stringify(resultCheckUser));
    });
}
function parseCookie(cookieString){
  let resultCookie = {}
  if (!cookieString || typeof cookieString !== 'string' ) return resultCookie;
  for(cookies of cookieString.split(';')) {
      let [key, value] = cookies.trim().split('=');
      resultCookie[key] = value;
  }
  return resultCookie;
}

function generateSession(response, postData){
  const PATH_TO_SESSIONS = "./data/sessions/";
  const TWO_DAYS_IN_MS = 172800000; // 2 day * 24 hour * 60 min * 60 s * 1000 ms
  let sessionCreateTime = Date.now();
  let sessionЕxpiresTime = sessionCreateTime + TWO_DAYS_IN_MS;
  let cookieLifeTime = new Date(sessionЕxpiresTime).toGMTString();
  let userToken = generateRandomString();

  let sessionData = {};
  sessionData.login = postData.login;
  sessionData.createTime = sessionCreateTime;
  sessionData.expiresTime = sessionЕxpiresTime;
  try{
    fs.writeFileSync(`${PATH_TO_SESSIONS}${userToken}.json`, JSON.stringify(sessionData));
    response.statusCode = 200;
    response.setHeader("Set-Cookie", `token=${userToken}; expires=${cookieLifeTime}`);
    return true;
  } catch(err) {
    console.log(`Error write session file: ${err}`);
    response.statusCode = 500;
    return false;
  }
}

function generateRandomString(length){
   let lengthString = length || 16;
   let resultString = '';
   let randNum;
   while( lengthString-- ){
     randNum = Math.floor(Math.random() * 62);
     resultString += String.fromCharCode(randNum + (randNum < 10 ? 48 : randNum < 36 ? 55 : 61))
   }
   return resultString;
}


const server = http.createServer(requestHandler);
server.listen(port, (err) => {
    if (err) {
        return console.log('something bad happened', err);
    }    console.log(`server is listening on ${port}`)
})

/*OLD BULLSHIT
function getRequestParams(url) {
  let resultParams = {}
  let [adress, stringParams] = url.split("?");
  if (stringParams)
    for (let keyValue of stringParams.split("&")) {
      let [key, value] = keyValue.split("=");
      resultParams[key] = value;
  }
  return resultParams;
}*/

/*
function saveData(films, artists) {
  fs.writeFile('data.json', JSON.stringify({films, artists}), (e) => {
    if (e) throw err;
    console.log('The file has been saved!');
  });
}
 let loadedData = loadData();
  saveData(loadedData.filmInstances, loadedData.artistInstances);*/
