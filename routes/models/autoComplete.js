const http = require("https");
const axios = require("axios");
const cheerio = require("cheerio");

class AutoComplete {
  autoCompleteManga(title) {
    return new Promise((resolve, reject) => {
      try {
        http.get(
          `https://myanimelist.net/search/prefix.json?type=manga&keyword=${title}&v=11`,
          function (response) {
            var chunks = [];
            response.on("data", function (chunk) {
              chunks.push(chunk);
            });
            response.on("end", function (chunk) {
              let body = Buffer.concat(chunks);
              resolve({ message: JSON.parse(body).categories[0].items });
            });
          }
        );
      } catch (e) {
        console.log(e);
      }
    });
  }

  autoCompleteComic(title) {
    return new Promise((resolve, reject) => {
      try {
        var qs = require("querystring");
        var data = qs.stringify({
          type: "Comic",
          keyword: title,
        });
        var config = {
          method: "post",
          url: "https://readcomiconline.to/Search/SearchSuggest",
          headers: {
            Origin: "https://readcomiconline.to",
            dnt: "1",
            "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
          },
          data: data,
        };

        axios(config)
          .then(function (response) {
            let html = JSON.stringify(response.data);
            const $ = cheerio.load(html);
            let comicArr = [];
            $("a").each((i, el) => {
              if (i < 10) {
                comicArr.push($(el).text().trim());
              } else {
                resolve({ comicSuggest: comicArr });
                throw "autocomplete reached end";
              }
            });
          })
          .catch(function (error) {
            if (error !== "autocomplete reached end") {
              console.log(error);
            }
          });
      } catch (e) {
        console.log(e);
      }
    });
  }
}

module.exports = AutoComplete;
