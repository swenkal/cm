let fs = require('fs');

function loadData() {

  let films_names;
  let artists_names;
  let films = [];
  let artists = [];

  try {
    films_names = fs.readdirSync("./data/films");
    artists_names = fs.readdirSync("./data/artists");
    console.log(films_names, artists_names);
  } catch (e) {
    console.log("Проблемки");
  }

  for (let filename of films_names) {
    let film = JSON.parse(fs.readFileSync(`./data/films/${filename}`));
    films.push(film);
  }
  for (filename of artists_names) {
    let artist = JSON.parse(fs.readFileSync(`./data/artists/${filename}`));
    artists.push(artist);
  }
  return {films, artists};
}
const mimeTypes = {
  "png": "image/png",
  "ico": "image/x-icon",
  "jpg": "image/jpeg",
  "jpeg": "image/jpeg",
  "jp2": "image/jp2",
  "gif": "image/gif",
  "cdr": "image/x-coreldraw",
  "svg": "image/svg+xml",
  "webp": "image/webp",
  "tiff": "image/tiff",
  "psd": "image/psd",
  "raw": "image/raw",
  "bmp": "image/bmp",
  "ini": "text/plain",
  "txt": "text/raw",
  "css": "text/css",
  "csv": "text/csv",
  "html": "text/html",
  "js": "text/javascript",
  "flv": "video/x-flv",
  "ts": "video/MP2T",
  "mov": "video/quicktime",
  "wmv": "video/x-ms-wmv",
  "mpeg": "video/mpeg",
  "mp4": "video/mp4",
  "avi": "video/avi",
  "amv": "video/amv",
  "mpg": "video/mpg",
  "3gp": "video/3gp",
  "webm": "video/webm",
  "aac": "audio/x-aac",
  "uva": "audio/vnd.dece.audio",
  "flac": "audio/flac",
  "mp3": "audio/mp3",
  "wav": "audio/vnd.wav",
  "vorbis": "audio/vorbis",
  "aif": "audio/x-aiff",
  "ram": "audio/vnd.rn-realaudio",
  "snd": "audio/basic",
  "au": "audio/basic",
  "rar": "application/x-rar-compressed",
  "tar": "application/x-tar",
  "exe": "application/x-msdownload",
  "bin": "application/octet-stream",
  "bat": "application/bat",
  "cdw": "application/cdw",
  "fb2": "application/x-fictionbook+xml",
  "pkg": "application/x-newton-compatible-pkg",
  "rb": "application/x-rocketbook",
  "epub": "application/epub+zip",
  "jar": "application/java-archive",
  "azw": "application/vnd.amazon.ebook",
  "xml": "application/xml",
  "zip": "application/zip",
  "7z": "application/x-7z-compressed",
  "pdf": "application/pdf",
  "m3u8": "application/x-mpegURL",
  "ogg": "application/ogg",
  "json": "application/json",
  "doc": "application/msword",
  "dot": "application/msword",
  "dox": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "dotx": "application/vnd.openxmlformats-officedocument.wordprocessingml.template",
  "docm": "application/vnd.ms-word.document.macroEnabled.12",
  "dotm": "application/vnd.ms-word.template.macroEnabled.12",
  "xls": "application/vnd.ms-excel",
  "xlt": "application/vnd.ms-excel",
  "xla": "application/vnd.ms-excel",
  "xlsx": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "xltx": "application/vnd.openxmlformats-officedocument.spreadsheetml.template",
  "xlsm": "application/vnd.ms-excel.sheet.macroEnabled.12",
  "xltm": "application/vnd.ms-excel.template.macroEnabled.12",
  "xlam": "application/vnd.ms-excel.addin.macroEnabled.12",
  "xlsb": "application/vnd.ms-excel.sheet.binary.macroEnabled.12",
  "ppt": "application/vnd.ms-powerpoint",
  "pot": "application/vnd.ms-powerpoint",
  "pps": "application/vnd.ms-powerpoint",
  "ppa": "application/vnd.ms-powerpoint",
  "pptx": "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "potx": "application/vnd.openxmlformats-officedocument.presentationml.template",
  "ppsx": "application/vnd.openxmlformats-officedocument.presentationml.slideshow",
  "ppam": "application/vnd.ms-powerpoint.addin.macroEnabled.12",
  "pptm": "application/vnd.ms-powerpoint.presentation.macroEnabled.12",
  "potm": "application/vnd.ms-powerpoint.presentation.macroEnabled.12",
  "ppsm": "application/vnd.ms-powerpoint.slideshow.macroEnabled.12"
};



const http = require('http');
const port = 3000;
const requestHandler = (request, response) => {
    let requestedFile = decodeURI(request.url);
    if (requestedFile.slice(-1) === '/') {
      requestedFile += 'index.html';
    }
    let ext = requestedFile.split('.').pop();
    let contentType;
    if (typeof mimeTypes[ext] == 'undefined') {
      contentType = 'application/octet-stream';
    } else {
      contentType = mimeTypes[ext];
    }
    console.log(ext);
    response.setHeader('Content-Type', `${contentType};`);
    console.log(requestedFile);
    try {
      let fileContent = fs.readFileSync(`./web${requestedFile}`);
      response.statusCode = 200;
      response.end(fileContent);
    } catch (e) {
      response.statusCode = 404;
      response.end('Запрашиваемого файла не существует');
    }
}

/*
function saveData(films, artists) {
  fs.writeFile('data.json', JSON.stringify({films, artists}), (e) => {
    if (e) throw err;
    console.log('The file has been saved!');
  });
}*/
// let loadedData = loadData();
// saveData(loadedData.films, loadedData.artists);

const server = http.createServer(requestHandler);

server.listen(port, (err) => {
    if (err) {
        return console.log('something bad happened', err);
    }    console.log(`server is listening on ${port}`)
})
