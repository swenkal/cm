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

function saveData(loadData) {
  let loadedData = loadData();
  fs.writeFile('data.json', JSON.stringify(loadedData), (e) => {
    if (e) throw err;
    console.log('The file has been saved!');
  });
}

saveData(loadData);
