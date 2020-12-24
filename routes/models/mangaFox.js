const http = require("https");
const axios = require("axios");
const cheerio = require("cheerio");

class MangaHere {
  getImageList(url, reliable = false) {
    if (reliable === false) {
      return new Promise((resolve, reject) => {
        http.get(url, (resp) => {
          let html = "";

          resp.on("data", (chunk) => {
            html += chunk;
          });

          resp.on("end", () => {
            try {
              let imagecount = html.substring(html.lastIndexOf("imagecount"));
              imagecount = imagecount.substring(0, imagecount.indexOf(";"));
              imagecount = imagecount.match(/\d+/g).join([]);

              imagecount = parseInt(imagecount);

              let temp = html.substring(html.lastIndexOf("chapterid"));
              let chapterid = temp.substring(0, temp.indexOf(";"));
              chapterid = chapterid.match(/\d+/g).join([]);
              let urlParsed = url;
              urlParsed = urlParsed.substring(0, urlParsed.lastIndexOf("/"));
              urlParsed =
                urlParsed + `/chapterfun.ashx?cid=${chapterid}&page=1&key=`;
              var config = {
                method: "get",
                url: urlParsed,
                headers: {
                  Referer: "https://fanfox.net/",
                },
              };
              axios(config)
                .then(function (response) {
                  let imgList = [];
                  let re = eval(JSON.stringify(response.data));
                  (0, eval)(re);

                  let zeroadd = function (number) {
                    let length = 2;
                    var my_string = "" + number;
                    while (my_string.length < length) {
                      my_string = "0" + my_string;
                    }

                    return my_string;
                  };

                  function findIndexOfRepeat(a, b) {
                    var shorterLength = Math.min(a.length, b.length);
                    for (var i = 0; i < shorterLength; i++) {
                      if (a[i] !== b[i] && isNaN(parseInt(b[i]))) {
                        return i - 1;
                      } else if (a[i] !== b[i]) {
                        if (
                          !isNaN(parseInt(a[i + 1])) &&
                          !isNaN(parseInt(b[i + 1]))
                        ) {
                          return i + 1;
                        }
                        return i;
                      }
                    }
                    if (a.length !== b.length) return shorterLength;

                    return -1;
                  }

                  let indexChange = findIndexOfRepeat(d[0], d[1]);
                  d = d[0];
                  let startIndex = parseInt(
                    d.substring(indexChange - 1, indexChange + 1)
                  );
                  let left = d.substring(0, indexChange - 1);
                  left = "https:" + left;
                  let right = d.substring(indexChange + 1);
                  let t = "";
                  for (let i = 1; i < imagecount; i++) {
                    t = left + zeroadd(startIndex) + right;
                    startIndex++;
                    imgList.push(t);
                    t = "";
                  }
                  resolve({ imageList: imgList });
                })
                .catch(function (error) {
                  console.log(error);
                });
            } catch (e) {
              console.log(e);
            }
          });
          resp.on("error", () => {
            console.log(error);
          });
        });
      });
    } else {
      //trying the long route
      console.log("try reliable");
      return new Promise((resolve, reject) => {
        let baseurl = url.substring(0, url.lastIndexOf("/"));
        baseurl = baseurl + `/${3}.html`;
        http.get(baseurl, (resp) => {
          let html = "";

          resp.on("data", (chunk) => {
            html += chunk;
          });

          resp.on("end", () => {
            try {
              let imagecount = html.substring(html.lastIndexOf("imagecount"));
              imagecount = imagecount.substring(0, imagecount.indexOf(";"));
              imagecount = imagecount.match(/\d+/g).join([]);

              imagecount = parseInt(imagecount);

              let temp = html.substring(html.lastIndexOf("chapterid"));
              let chapterid = temp.substring(0, temp.indexOf(";"));
              chapterid = chapterid.match(/\d+/g).join([]);
              let urlParsed = url;
              urlParsed = urlParsed.substring(0, urlParsed.lastIndexOf("/"));
              urlParsed =
                urlParsed + `/chapterfun.ashx?cid=${chapterid}&page=2&key=`;
              var config = {
                method: "get",
                url: urlParsed,
                headers: {
                  Referer: "https://fanfox.net/",
                },
              };
              axios(config)
                .then(function (response) {
                  let imgList = [];
                  let re = eval(JSON.stringify(response.data));
                  (0, eval)(re);

                  let zeroadd = function (number) {
                    let length = 2;
                    var my_string = "" + number;
                    while (my_string.length < length) {
                      my_string = "0" + my_string;
                    }

                    return my_string;
                  };

                  function findIndexOfRepeat(a, b) {
                    var shorterLength = Math.min(a.length, b.length);
                    for (var i = 0; i < shorterLength; i++) {
                      if (a[i] !== b[i] && isNaN(parseInt(b[i]))) {
                        return i - 1;
                      } else if (a[i] !== b[i]) {
                        if (
                          !isNaN(parseInt(a[i + 1])) &&
                          !isNaN(parseInt(b[i + 1]))
                        ) {
                          return i + 1;
                        }
                        return i;
                      }
                    }
                    if (a.length !== b.length) return shorterLength;

                    return -1;
                  }
                  console.log(d);

                  let indexChange = findIndexOfRepeat(d[0], d[1]);
                  d = d[0];
                  let startIndex = parseInt(
                    d.substring(indexChange - 1, indexChange + 1)
                  );
                  let left = d.substring(0, indexChange - 1);
                  left = "https:" + left;
                  let right = d.substring(indexChange + 1);
                  let t = "";
                  for (let i = 1; i < imagecount; i++) {
                    t = left + zeroadd(startIndex) + right;
                    startIndex++;
                    imgList.push(t);
                    t = "";
                  }
                  resolve({ imageList: imgList });
                })
                .catch(function (error) {
                  console.log(error);
                });
            } catch (e) {
              console.log(e);
            }
          });
          resp.on("error", () => {
            console.log(error);
          });
        });
      });
    }
  }

  getMangaList(pageNo) {
    let url = `https://fanfox.net/directory/${pageNo}.html`;
    return new Promise((resolve, reject) => {
      http.get(url, (resp) => {
        let html = "";

        resp.on("data", (chunk) => {
          html += chunk;
        });

        resp.on("end", () => {
          //   console.log(html);
          try {
            const $ = cheerio.load(html);
            let mangaArr = [];
            let tempObj = {};
            $(".manga-list-1-list")
              .children("li")
              .each((idx, el) => {
                let desc = $(el).children("p").text();
                desc = desc.replace(/\n/g, "");
                desc = desc.replace(/\\/g, "");
                let title = $(el)
                  .children(".manga-list-1-item-title")
                  .children("a")
                  .text();
                let link = $(el).children("a").attr("href");
                link = "https://fanfox.net" + link;
                let imageLink = $(el).children("a").children("img").attr("src");
                tempObj = {
                  description: "",
                  title: title,
                  link: link,
                  thumb: imageLink,
                };
                // console.log('here')
                mangaArr.push(tempObj);
              });
            resolve({
              LatestManga: mangaArr,
            });
          } catch (e) {
            console.log(e);
          }
        });
        resp.on("error", () => {
          console.log(error);
        });
      });
    });
  }

  search(maxItem, title, finalArray) {
    return new Promise((resolve, reject) => {
      let url = "https://fanfox.net/search?title=" + encodeURI(title);
      http.get(url, (resp) => {
        let html = "";
        resp.on("data", (chunk) => {
          html += chunk;
        });
        resp.on("end", () => {
          try {
            const $ = cheerio.load(html);
            for (let i = 0; i < maxItem; i++) {
              if (
                $(".manga-list-4-list")
                  .children("li")
                  .eq(i)
                  .children("a")
                  .attr("title")
              ) {
                finalArray.push({
                  src: "MGFX",
                  thumb: $(".manga-list-4-list")
                    .children("li")
                    .eq(i)
                    .children("a")
                    .children("img")
                    .attr("src"),
                  link:
                    "https://fanfox.net" +
                    $(".manga-list-4-list")
                      .children("li")
                      .eq(i)
                      .children("a")
                      .attr("href"),
                  title: $(".manga-list-4-list")
                    .children("li")
                    .eq(i)
                    .children("a")
                    .attr("title")
                    .trim(),
                });
              } else {
                continue;
              }
            }
            resolve(finalArray);
          } catch (e) {
            console.log(e);
          }
        });
      });
    });
  }

  getLatestChapter(url) {
    return new Promise((resolve, reject) => {
      http.get(url, (resp) => {
        let html = "";

        resp.on("data", (chunk) => {
          html += chunk;
        });

        resp.on("end", () => {
          try {
            const $ = cheerio.load(html);
            resolve({
              message: $(".detail-main-list")
                .children("li")
                .eq(0)
                .children("a")
                .children(".detail-main-list-main")
                .children(".title3")
                .text(),
            });
          } catch (e) {
            console.log(e);
          }
        });
      });
    });
  }

  getMangaInfo(url) {
    return new Promise((resolve, reject) => {
      http.get(url, (resp) => {
        let html = "";

        resp.on("data", (chunk) => {
          html += chunk;
        });

        resp.on("end", () => {
          try {
            const $ = cheerio.load(html);
            let thumb = $(".detail-info-cover-img").attr("src");
            let title = $(".detail-info-right-title-font").text();
            let status = $(".detail-info-right-title-tip").text();
            let author = $(".detail-info-right-say").children("a").text();
            let lastUpdate = $(".detail-main-list-title-right").text();
            let desc = $(".detail-info-right-content").text();

            let chapterList = [];
            $(".detail-main-list")
              .children("li")
              .each((i, el) => {
                chapterList.push({
                  chapterTitle: $(el)
                    .children("a")
                    .children(".detail-main-list-main")
                    .children(".title3")
                    .text(),
                  chapterLink:
                    "https://fanfox.net" + $(el).children("a").attr("href"),
                  chapDate: $(el)
                    .children("a")
                    .children(".detail-main-list-main")
                    .children(".title2")
                    .text(),
                });
              });

            resolve({
              mangaInfo: {
                thumb: thumb,
                title: title,
                desc: desc,
                status: status,
                author: author,
                lastUpdate: lastUpdate,
                chapterList: chapterList,
              },
            });
          } catch (e) {
            console.log(e);
          }
        });
      });
    });
  }

  getGenre() {
    return new Promise((resolve, reject) => {
      let url = "https://fanfox.net/directory/";
      let genreList = [];
      http.get(url, (resp) => {
        let html = "";

        resp.on("data", (chunk) => {
          html += chunk;
        });

        resp.on("end", () => {
          try {
            const $ = cheerio.load(html);
            $(".browse-bar-filter-list")
              .children("div")
              .children("ul")
              .children("li")
              .each((i, el) => {
                genreList.push({
                  link: "https://fanfox.net" + $(el).children("a").attr("href"),
                  title: $(el).children("a").text(),
                });
              });
          } catch (e) {
            console.log(e);
          }
          resolve({ genreList: genreList });
        });
      });
    });
  }

  getGenreManga(link, page) {
    return new Promise((resolve, reject) => {
      let url = link + `${page}.htm`;
      http.get(url, (resp) => {
        let html = "";

        resp.on("data", (chunk) => {
          html += chunk;
        });

        resp.on("end", () => {
          try {
            const $ = cheerio.load(html);
            let mangaArr = [];

            $(".manga-list-1-list")
              .children("li")
              .each((i, el) => {
                let title = $(el)
                  .children(".manga-list-1-item-title")
                  .children("a")
                  .text()
                  .trim();
                let link = $(el)
                  .children(".manga-list-1-item-title")
                  .children("a")
                  .attr("href");
                link = "https://fanfox.net" + link;
                let imageLink = $(el).children("a").children("img").attr("src");
                mangaArr.push({
                  description: "",
                  title: title,
                  link: link,
                  thumb: imageLink,
                });
              });

            resolve({
              LatestManga: mangaArr,
            });
          } catch (e) {
            console.log(e);
          }
        });
      });
    });
  }
}

module.exports = MangaHere;
