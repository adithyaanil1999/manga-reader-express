// WARNING DID NOT TEST THIS MODULE AS IMAGES ARE 403'ed ANYWAY
const http = require("https");
const axios = require("axios");
// const cheerio = require("cheerio");
const api = require("mangadex-full-api");
const _ = require("underscore");
const apiUrl = "https://mangadex.org/api/v2/"; // for mangadex

class MangaDex {
  getImageList(url) {
    return new Promise((resolve, reject) => {
      var config = {
        method: "get",
        url: url + "?saver=true",
      };

      let parseArr = function (sv, hash, list) {
        for (let i = 0; i < list.length; i++) {
          list[i] = sv + hash + "/" + list[i];
        }
        return list;
      };

      axios(config)
        .then(function (response) {
          resolve({
            imageList: parseArr(
              response.data.data.server,
              response.data.data.hash,
              response.data.data.pages
            ),
          });
        })
        .catch(function (error) {
          console.log(error);
        });
    });
  }

  getMangaList(pageNo) {
    let url = `https://mangadex.org/titles/9/${pageNo}`;

    return new Promise((resolve, reject) => {
      http.get(url, (resp) => {
        let html = "";
        resp.on("data", (chunk) => {
          html += chunk;
        });

        resp.on("end", () => {
          try {
            const $ = cheerio.load(html);
            let mangaArr = [];
            let tempObj = {};
            if (
              $(".container").children(".alert-warning").text().trim() !== ""
            ) {
              res.send({
                LatestManga: "end",
              });
            } else {
              $(".manga-entry").each((i, el) => {
                tempObj = {
                  description: "",
                  title: $(el)
                    .children("div")
                    .eq(1)
                    .children("a")
                    .text()
                    .trim(),
                  link:
                    "https://mangadex.org" +
                    $(el).children("div").eq(1).children("a").attr("href"),
                  thumb:
                    "https://mangadex.org" +
                    $(el)
                      .children("div")
                      .eq(0)
                      .children("a")
                      .children("img")
                      .attr("src"),
                };
                mangaArr.push(tempObj);
              });
              let response = {
                LatestManga: mangaArr,
              };
              resolve(response);
            }
          } catch (error) {
            console.log(error);
          }
        });
      });
    });
  }

  search(maxItem, title, finalArray) {
    return new Promise((resolve, reject) => {});
  }

  getLatestChapter(url) {
    return new Promise((resolve, reject) => {
      let chapterId = url.substring(url.lastIndexOf("title") + 6);
      chapterId = parseInt(chapterId.substring(0, chapterId.lastIndexOf("/")));
      var config = {
        method: "get",
        url: "https://mangadex.org/api/v2/manga/" + chapterId + "/chapters",
        headers: {
          "Content-Type": "application/json",
        },
      };

      axios(config)
        .then(function (response) {
          let data2 = response.data.data;
          for (let i of data2.chapters) {
            if (i.language === "gb") {
              resolve({
                message: "V." + i.volume + " " + "Ch." + i.chapter,
              });
              break;
            }
          }
        })
        .catch((e) => {
          console.log(e);
        });
    });
  }

  getMangaInfo(url) {
    return new Promise((resolve, reject) => {
      let chapterId = url.substring(url.lastIndexOf("title") + 6);
      chapterId = parseInt(chapterId.substring(0, chapterId.lastIndexOf("/")));

      var data = JSON.stringify({ url: apiUrl + "manga/" + chapterId });
      var config = {
        method: "get",
        url: "https://mangadex.org/api/v2/manga/" + chapterId,
        headers: {
          "Content-Type": "application/json",
        },
        data: data,
      };
      axios(config)
        .then(async function (response) {
          let data = response.data.data;
          const retStatus = function (status) {
            if (status == 1) {
              return "Ongoing";
            } else if (status == 2) {
              return "Completed";
            } else if (status == 3) {
              return "Cancelled";
            } else if (status == 4) {
              return "Hiatus";
            }
          };

          function parseChapterList(list) {
            let TimeAgo = (function () {
              var self = {};

              // Public Methods
              self.locales = {
                prefix: "",
                sufix: "ago",

                seconds: "less than a minute",
                minute: "about a minute",
                minutes: "%d minutes",
                hour: "about an hour",
                hours: "about %d hours",
                day: "a day",
                days: "%d days",
                month: "about a month",
                months: "%d months",
                year: "about a year",
                years: "%d years",
              };

              self.inWords = function (timeAgo) {
                var seconds = Math.floor(
                    (new Date() - parseInt(timeAgo)) / 1000
                  ),
                  separator = this.locales.separator || " ",
                  words = this.locales.prefix + separator,
                  interval = 0,
                  intervals = {
                    year: seconds / 31536000,
                    month: seconds / 2592000,
                    day: seconds / 86400,
                    hour: seconds / 3600,
                    minute: seconds / 60,
                  };

                var distance = this.locales.seconds;

                for (var key in intervals) {
                  interval = Math.floor(intervals[key]);

                  if (interval > 1) {
                    distance = this.locales[key + "s"];
                    break;
                  } else if (interval === 1) {
                    distance = this.locales[key];
                    break;
                  }
                }

                distance = distance.replace(/%d/i, interval);
                words += distance + separator + this.locales.sufix;

                return words.trim();
              };

              return self;
            })();

            let retlist = [];
            let listIndex = 0;
            let tempTitlePrev;
            let i;
            for (let index = 0; index < list.length; index++) {
              i = list[index];
              currentTitle =
                "V." +
                (i.volume === "" ? 0 : i.volume) +
                " " +
                "Ch." +
                i.chapter;
              if (i.language !== "gb" || currentTitle === tempTitlePrev) {
                continue;
              } else {
                tempTitlePrev =
                  "V." +
                  (i.volume === "" ? 0 : i.volume) +
                  " " +
                  "Ch." +
                  i.chapter;
                retlist.push({
                  chapterTitle:
                    "V." +
                    (i.volume === "" ? 0 : i.volume) +
                    " " +
                    "Ch." +
                    i.chapter,
                  chapterLink: `https://mangadex.org/api/v2/chapter/${i.id}`,
                  chapDate: TimeAgo.inWords(i.timestamp * 1000),
                });
              }
            }
            return retlist;
          }

          var config = {
            method: "get",
            url:
              "https://mangadex.org/api/v2/manga/" +
              chapterId +
              "/chapters?saver=true",
            headers: {
              "Content-Type": "application/json",
            },
          };

          axios(config)
            .then(function (response) {
              let data2 = response.data.data;
              response = {
                mangaInfo: {
                  thumb: data.mainCover,
                  title: data.title,
                  desc: _.unescape(
                    data.description
                      .substring(
                        0,
                        data.description.lastIndexOf(
                          "Descriptions in Other Languages:"
                        ) - 10
                      )
                      .trim()
                  ),
                  status: retStatus(data.publication.status),
                  author: retStatus(data.author),
                  lastUpdate: "",
                  chapterList: parseChapterList(data2.chapters),
                },
              };
              resolve(response);
            })
            .catch(function (error) {
              console.log(error);
            });
        })
        .catch(function (error) {
          console.log(error);
        });
    });
  }

  getGenre() {
    return new Promise((resolve, reject) => {
      let genreList = [];
      var config = {
        method: "get",
        url: "https://mangadex.org/api/v2/tag/",
        data: "",
      };

      axios(config)
        .then(function (response) {
          let data = Object.values(response.data.data);
          for (let i of data) {
            genreList.push({
              link: `https://mangadex.org/genre/${i.id}`,
              title: i.name,
            });
          }
          resolve({ genreList: genreList });
        })
        .catch(function (error) {
          console.log(error);
        });
    });
  }

  getGenreManga(link, page) {
    return new Promise((resolve, reject) => {
      let url = `https://mangadex.org/genre/2/action/0/${req.body.page}/?s=9#listing`; // NEEDS REWORK LATER
      http.get(url, (resp) => {
        let html = "";

        resp.on("data", (chunk) => {
          html += chunk;
        });

        resp.on("end", () => {
          try {
            const $ = cheerio.load(html);
            let mangaArr = [];
            let tempObj = {};
            if (
              $(".container").children(".alert-warning").text().trim() !== ""
            ) {
              res.send({
                LatestManga: "end",
              });
            } else {
              $(".manga-entry").each((i, el) => {
                tempObj = {
                  description: "",
                  title: $(el)
                    .children("div")
                    .eq(1)
                    .children("a")
                    .text()
                    .trim(),
                  link:
                    "https://mangadex.org" +
                    $(el).children("div").eq(1).children("a").attr("href"),
                  thumb:
                    "https://mangadex.org" +
                    $(el)
                      .children("div")
                      .eq(0)
                      .children("a")
                      .children("img")
                      .attr("src"),
                };
                mangaArr.push(tempObj);
              });
              let response = {
                LatestManga: mangaArr,
              };
              resolve(response);
            }
          } catch (e) {
            console.log(e);
          }
        });
      });
    });
  }
}

module.exports = MangaDex;
