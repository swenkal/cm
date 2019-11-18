let fs = require('fs');

const http = require('http')
const port = 3000
const requestHandler = (request, response) => {
    console.log(request.url)
    response.end(fs.readFileSync(`./index.html/`))
}

const server = http.createServer(requestHandler)

server.listen(port, (err) => {
    if (err) {
        return console.log('something bad happened', err)
    }    console.log(`server is listening on ${port}`)
})

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
/*
function saveData(films, artists) {
  fs.writeFile('data.json', JSON.stringify({films, artists}), (e) => {
    if (e) throw err;
    console.log('The file has been saved!');
  });
}*/
// let loadedData = loadData();
// saveData(loadedData.films, loadedData.artists);
