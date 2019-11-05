// "Date","Price","Open","High","Low","Vol.","Change %"

const MAX_INDEXES_AMOUNT = 0;
const MAX_STOCK_PRICE = 0;
const MAX_LOSE_YEAR = 0;
const MAX_LOSE_MONTH = 0;

let arr = [];
let arr2 = [];
arr[0] = require("./data/films/1.json");
arr[1] = require("./data/films/2.json");
arr[2] = require("./data/films/3.json");
arr2[0] = require("./data/artists/1.json");
arr2[1] = require("./data/artists/2.json");
arr2[2] = require("./data/artists/3.json");

console.log(`Movie:`, arr[2]["title"], `- one of the main actors:`, arr2[0]["name"]);
