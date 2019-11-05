// "Date","Price","Open","High","Low","Vol.","Change %"

const MAX_INDEXES_AMOUNT = 0;
const MAX_STOCK_PRICE = 0;
const MAX_LOSE_YEAR = 0;
const MAX_LOSE_MONTH = 0;

let artists = [
  require("./data/artists/1.json"), require("./data/artists/2.json"), require("./data/artists/3.json")
];

let films = [
  require("./data/films/1.json"), require("./data/films/2.json"), require("./data/films/3.json")
];

console.log(films[0]["director"]);
