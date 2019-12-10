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
  let router = {
    "\^/api$" : () => indexApiHandler(response),
    "\^/api/auth" : () => authorisation(request, response)
  };
  for(key in router) {
    let apiRegExp = new RegExp(key, "g");
    if(apiRegExp.test(requestedUrl)) return router[key]();
  }
    return false;
}

function indexApiHandler(response){
  response.setHeader('Content-Type', 'application/json;');
  response.statusCode = 200;
  let indexApiResult = { result: null };
  response.end(JSON.stringify(indexApiResult));
  return true;
}

function authorisation(request, response) {
  let requestedUrl = decodeURI(request.url);
    const PATH_TO_PROFILES = "./data/profiles/";
    let requestParams = getRequestParams(requestedUrl);
    let resultCheckUser = {
        authed: false
    };
    fs.readFile(`${PATH_TO_PROFILES}${requestParams.login}.json`,'utf-8', function(err, data){
      response.setHeader("Content-Type", "application/json");
      if (err) {
        response.statusCode = 401;
      } else {
          let userDataObject = JSON.parse(data);
          if(userDataObject.account.password == requestParams.password){
            response.statusCode = 200;
            resultCheckUser.authed = true;
          } else {
            response.statusCode = 401;
          }
      }
      response.end(JSON.stringify(resultCheckUser));
    });
    return true;
}

function getRequestParams(url) {
  let resultParams = {}
  let [adress, stringParams] = url.split("?");
  if (stringParams)
    for (let keyValue of stringParams.split("&")) {
      let [key, value] = keyValue.split("=");
      resultParams[key] = value;
  }
  return resultParams;
}
/*
function saveData(films, artists) {
  fs.writeFile('data.json', JSON.stringify({films, artists}), (e) => {
    if (e) throw err;
    console.log('The file has been saved!');
  });
}
 let loadedData = loadData();
  saveData(loadedData.filmInstances, loadedData.artistInstances);*/

const server = http.createServer(requestHandler);
server.listen(port, (err) => {
    if (err) {
        return console.log('something bad happened', err);
    }    console.log(`server is listening on ${port}`)
})
