const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const port = 4000

var scraperRouter = require("./routes/scraper/scraper");

const app = express();
app.use(bodyParser.json());
app.use(cors());
app.use("/", scraperRouter);

// DEMO DEPLOYED AT: https://manga-reader-express.herokuapp.com/
// buildpack https://github.com/jontewks/puppeteer-heroku-buildpack.git

app.listen(process.env.PORT || 4000,()=>{
    console.log(`app listening on port ${process.env.PORT || port}`)
});
module.exports = app;

