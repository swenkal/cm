let fs = require('fs');
const mimeTypes = require('./config/mimeTypes.json');
const PATH_TO_SESSIONS = "./data/sessions/";
const TWO_DAYS_IN_MS = 172800000; //172800000 = 2 day * 24 hour * 60 min * 60 s * 1000 ms
const PATH_TO_PROFILES = "./data/profiles/";

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



const http = require('http');
const port = 3000;
const requestHandler = (request, response) => {

  if(businessLogicHandler(request, response))  return;

  let requestedFile = decodeURI(request.url);
  if (requestedFile.slice(-1) === '/') {
      requestedFile += 'index.html';
    }

  const fileExtension = getFileExtension(requestedFile);

  let contentType = 'application/octet-stream';
  if (typeof mimeTypes[fileExtension] !== 'undefined') {
      contentType = mimeTypes[fileExtension];
    }

  try {
    let fileSizeInBytes = fs.statSync(`./web${requestedFile}`)['size'];
    response.setHeader('Content-Length', `${fileSizeInBytes}`);
    response.setHeader('Content-Type', `${contentType}`);
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

function getFileExtension(fileName){
  let delimeteredFileName = fileName.split('.');
  let fileExtension = delimeteredFileName[delimeteredFileName.length-1];
  return fileExtension;
}

function businessLogicHandler(request, response){
  let requestedUrl = decodeURI(request.url);
  let apiRegExp = new RegExp("^/api", "g");

  if(!apiRegExp.test(requestedUrl)) return false;

  let sessionContext = getSessionContext(request);
  console.log(`sessionContext: ${JSON.stringify(sessionContext)}`);
  collectPostData(request, (requestParams) => {
    let router =
      [
        { urlPatern: /^\/api$/ , handler: indexApiHandler},
        { urlPatern: /^\/api\/auth/ , handler: authorisation},
        { urlPatern: /^\/api\/whoami$/ , handler: getCurrentUser},
        { urlPatern: /^\/api\/account$/ , handler: getUserAccount},
        { urlPatern: /^\/api\/create$/ , handler: createUser},
        { urlPatern: /^\/api\/delete$/ , handler: deleteUser}
      ];
    for(let location of router){
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
  let dirSessionName = getDirNameForUserToken(userCookie['token']);
  try {
    let tokenContent = JSON.parse(fs.readFileSync(`${PATH_TO_SESSIONS}${dirSessionName}${userCookie['token']}.json`));
    if (tokenContent.expiresTime < Date.now()) {
      fs.unlink(`${PATH_TO_SESSIONS}${userCookie['token']}.json`, (err) => {
        if (err) console.error(`Something wrong with deleting sessionFile ${userCookie['token']}: ${err}`);
        console.log(`Old session file ${userCookie['token']} was deleted`);
      });
      return resultContext;
    }

    tokenContent.expiresTime = Date.now() + TWO_DAYS_IN_MS;
    fs.writeFile(`${PATH_TO_SESSIONS}${dirSessionName}${userCookie['token']}.json`, JSON.stringify(tokenContent), (err) => {
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
    let decodedPostData = decodeURIComponent(postData);
    console.log(`Func collectPostData ${decodedPostData}`);
    callback(parsePostParams(decodedPostData);
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


function indexApiHandler(request, response, postData, sessionContext){
  response.setHeader('Content-Type', 'application/json;');
  response.statusCode = 200;
  let indexApiResult = { result: null };
  response.end(JSON.stringify(indexApiResult));
}

function getCurrentUser(request, response, postData, sessionContext){
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
    console.log(request.headers.cookie);
    if(request.headers.cookie !== undefined){
      response.statusCode = 403;
      response.setHeader("Content-Type", "application/json");
      response.end(JSON.stringify(resultCheckUser));
      return;
    }

    fs.readFile(`${PATH_TO_PROFILES}${postData.login}.json`,'utf-8', function(err, data){
      response.setHeader("Content-Type", "application/json");
      if (err) {
        response.statusCode = 401;
      } else {
          let userInfo = JSON.parse(data);
          if(userInfo.account.password == postData.password){
            console.log(parseCookie(request.headers.cookie)); //TODO: Add checkSession for user
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
  let sessionCreateTime = Date.now();
  let sessionЕxpiresTime = sessionCreateTime + TWO_DAYS_IN_MS;
  let cookieLifeTime = new Date(sessionЕxpiresTime).toGMTString();
  let userToken = generateRandomString();
  let dirForUserToken = getDirNameForUserToken(userToken);

  let sessionData = {};
  sessionData.login = postData.login;
  sessionData.createTime = sessionCreateTime;
  sessionData.expiresTime = sessionЕxpiresTime;
  try{
    fs.writeFileSync(`${PATH_TO_SESSIONS}${dirForUserToken}${userToken}.json`, JSON.stringify(sessionData));
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

function getDirNameForUserToken(userToken){
  let dirName = `${userToken.substr(0,2)}/`;
  if(!(fs.existsSync(`${PATH_TO_SESSIONS}${dirName}`))){
    try{
      fs.mkdirSync(`${PATH_TO_SESSIONS}${dirName}`);
      console.log(`Dir ${dirName} was created!`);
    } catch(err){
      console.error(`Error with create dir ${dirName}: ${err}`);
    }
  }
  return dirName;
}

function getUserAccount(request, response, postData, sessionContext){
    resultUserAccount = {};
    response.setHeader("Content-Type", "application/json");
    if(!("username" in sessionContext)){
      response.statusCode = 403;
      resultUserAccount.error = 'You must log in. Follow to /api/auth';
      response.end(JSON.stringify(resultUserAccount));
      return;
    }

    fs.readFile(`${PATH_TO_PROFILES}${sessionContext.username}.json`,'utf-8', function(err, data){
      if(err){
        console.log(`Error read userInfo ${sessionContext}: ${err}`);
        response.statusCode = 500;
        resultUserAccount.error = `Sorry. We can't read user info.`;
      } else {
        let userInfo = JSON.parse(data);
        resultUserAccount = userInfo.account;
        response.statusCode = 200;
      }
      response.end(JSON.stringify(resultUserAccount));
    });
}

function createUser(request, response, postData, sessionContext){
    let resultCreateUser = {};
    response.setHeader("Content-Type", "application/json");

    if(!("username" in sessionContext)){
      response.statusCode = 401;
      resultCreateUser.created = false;
      response.end(JSON.stringify(resultCreateUser));
      return;
    }
    if(isEmptyObject(postData)){
      response.statusCode = 400;
      resultCreateUser.created = false;
      response.end(JSON.stringify(resultCreateUser));
      return;
    }
    let parsedPostData = postData;
    //TODO: functions checkNewLogin() and checkNewPassword()
    if(!("login" in parsedPostData) || !("password" in parsedPostData)){
      response.statusCode = 400;
      resultCreateUser.created = false;
      response.end(JSON.stringify(resultCreateUser));
      return;
    }
    let listCreatedUsers = fs.readdirSync(PATH_TO_PROFILES);
    if(listCreatedUsers.includes(parsedPostData.login)){
      response.statusCode = 400;
      resultCreateUser.created = false;
      response.end(JSON.stringify(resultCreateUser));
      return;
    }
    fs.readFile(`${PATH_TO_PROFILES}${sessionContext.username}.json`,'utf-8', function(err, data){
      if(err){
        response.statusCode = 500;
        console.log(`createUser: Can't read user file: ${err}`);
        resultCreateUser.created = false;
        response.end(JSON.stringify(resultCreateUser));
        return;
      }
      let adminInfo = JSON.parse(data);
      if (adminInfo.account.role !== "admin"){
        response.statusCode = 403;
        resultCreateUser.created = false;
        response.end(JSON.stringify(resultCreateUser));
      } else {
          let newUserInfo = {}; //TODO: rename!!!
          newUserInfo.account = {};
          newUserInfo.account.name = parsedPostData.name;
          newUserInfo.account.lastname = parsedPostData.lastname;
          newUserInfo.account.mail = parsedPostData.mail;
          newUserInfo.account.role = parsedPostData.role;
          newUserInfo.account.password = parsedPostData.password;

          fs.writeFile(`${PATH_TO_PROFILES}${parsedPostData.login}.json`, JSON.stringify(newUserInfo), function(err){
            if(err){
              console.log(`createUser: Write file error ${parsedPostData.login}: ${err} `);
              response.statusCode = 500;
              resultCreateUser.created = false
            } else {
              response.statusCode = 200;
              resultCreateUser.created = true;
            }
            response.end(JSON.stringify(resultCreateUser));
          });
        }
    });
}


function deleteUser(request, response, postData, sessionContext){
  let resultDeleteUser = {};
  resultDeleteUser.deleted = false;
  response.setHeader("Content-Type", "application/json");

  if(!("username" in sessionContext)){
    response.statusCode = 401;
    response.end(JSON.stringify(resultDeleteUser));
    return;
  }

  if(isEmptyObject(postData) || !("login" in postData)){
    response.statusCode = 400;
    response.end(JSON.stringify(resultDeleteUser));
    return;
  }

  if(postData.login == sessionContext.username){
    response.statusCode = 406;
    response.end(JSON.stringify(resultDeleteUser));
    return;
  }

  fs.readFile(`${PATH_TO_PROFILES}${sessionContext.username}.json`, 'utf-8', function(err, data){
    if(err){
      console.log(`Delete user: Read admin property error: ${err}`);
      response.statusCode = 500;
      response.end(JSON.stringify(resultDeleteUser));
      return;
    }
    let adminInfo = JSON.parse(data);
    if(adminInfo.account.role !== "admin"){
      response.statusCode = 403;
      response.end(JSON.stringify(resultDeleteUser));
    } else {
        fs.unlink(`${PATH_TO_PROFILES}${postData.login}.json`, function(err){
          if(err){
            console.log(`Delete user error: ${err}`);
            response.statusCode = 500;
            response.end(JSON.stringify(resultDeleteUser));
            return;
          }
          resultDeleteUser.deleted = true;
          response.end(JSON.stringify(resultDeleteUser));
        });
    }
  });
}


function isEmptyObject(someObj){
  for(let key in someObj){
    return false;
  }
  return true;
}

/*
let idSessionCleaner = startSessionCleaner();
setTimeout(() => {
  stopSessionCleaner(idSessionCleaner);
}, 80000);*/


function startSessionCleaner(){
  let timeCheckOldSessions = 0;
  let idSessionCleaner = setInterval(() => {
    if( timeCheckOldSessions < 0) return;
    timeCheckOldSessions++;
    if( timeCheckOldSessions >= 60) {
     timeCheckOldSessions = -1;
     let sessionDirNames = fs.readdirSync(PATH_TO_SESSIONS);
     console.log(sessionDirNames);
     for (let currentSessionDir of sessionDirNames){
         deleteOldSessionFiles(`${PATH_TO_SESSIONS}${currentSessionDir}/`);
         deleteEmptySessionDir(`${PATH_TO_SESSIONS}${currentSessionDir}/`);
     }
      timeCheckOldSessions = 0;
    }
  }, 1000);
  return idSessionCleaner;
}

function deleteOldSessionFiles(pathToSessionDir) {
  const PATH_TO_SESSION_DIR = pathToSessionDir || PATH_TO_SESSIONS;
  let sesionFileNames = fs.readdirSync(PATH_TO_SESSION_DIR);
  let expiresTimeForFile = Date.now() + TWO_DAYS_IN_MS;

  for (let currentSessionFile of sesionFileNames ){
    let modTimeSessionFile = fs.statSync(`${PATH_TO_SESSION_DIR}${currentSessionFile}`)['mtimeMs'];
    try{
      if(modTimeSessionFile < expiresTimeForFile) {
          fs.unlinkSync(`${PATH_TO_SESSION_DIR}${currentSessionFile}`);
          console.log(`Old session file ${currentSessionFile} deleted `);
      }
    } catch(err){
      console.error(`Error with deleting old session file ${currentSessionFile}: ${err}`);
    }
  }
}

function deleteEmptySessionDir(pathToSessionDir){
  sesionFileNames = fs.readdirSync(pathToSessionDir);
  if (sesionFileNames.length == 0){
    fs.rmdir(pathToSessionDir, (err) => {
      if (err) console.error(`Error with delete folder ${pathToSessionDir}: ${err}`);
      console.log(`Folder ${pathToSessionDir} was deleted`);
    });
  }
}

function stopSessionCleaner(idSessionCleaner){
   clearInterval(idSessionCleaner);
   console.log(`Session cleaner was stoped.`);
}

const server = http.createServer(requestHandler);
server.listen(port, (err) => {
    if (err) {
        return console.log('something bad happened', err);
    }    console.log(`server is listening on ${port}`)
})

/*OLD BULLSHIT
setInterval(() => {
  if( timeCheckOldSessions < 0) return;
   timeCheckOldSessions++;
  if( timeCheckOldSessions >= 60) {
   timeCheckOldSessions = -1;
   let sessionDirNames = fs.readdirSync(PATH_TO_SESSIONS);
   console.log(sessionDirNames);
   for (let currentSessionDir of sessionDirNames){
       deleteOldSessionFiles(`${PATH_TO_SESSIONS}${currentSessionDir}/`);
       deleteEmptySessionDir(`${PATH_TO_SESSIONS}${currentSessionDir}/`);
   }
    timeCheckOldSessions = 0;
  }}, 1000);


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
