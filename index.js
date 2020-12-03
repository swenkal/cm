let fs = require('fs');
const dbConnect = require('./dbConnect.js');
const http = require('http');
const mimeTypes = require('./config/mimeTypes.json');
const router = require('./router.js');

const PATH_TO_SESSIONS = "./data/sessions/";
const PATH_TO_PROFILES = "./data/profiles/";
const TWO_DAYS_IN_MS = 172800000; //172800000 = 2 day * 24 hour * 60 min * 60 s * 1000 ms
const port = 3000;

let server;
(async () => {
  try {
    await dbConnect.initDB();
    await router.rebootHandlers();
    console.log('Router ready...');

    server = http.createServer(router.route);
    server.listen(port);
    console.log(`server is listening on ${port}`)

  } catch (err) {
    console.log(`index Errors: ${err}`);
    process.exit(1);
  }
})();
