const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");

var scraperRouter = require("./routes/scraper/scraper");

const app = express();
app.use(bodyParser.json());
app.use(cors());
app.use("/", scraperRouter);

// MANGAKAKALOT AND MANGAFOX(can be redone) dont work
// DEMO DEPLOYED AT: https://manga-reader-express.herokuapp.com/
// buildpack https://github.com/jontewks/puppeteer-heroku-buildpack.git
//node app.js > app.log 2>&1

app.listen(process.env.PORT || 4000);
module.exports = app;
