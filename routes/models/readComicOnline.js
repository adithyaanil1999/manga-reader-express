const http = require("https");
const axios = require("axios");
const cheerio = require("cheerio");

class ReadComicOnline {
  getImageList(url) {
    return new Promise((resolve, reject) => {
      var data = url;
      var config = {
        method: "get",
        url: url,
        headers: {
          "Content-Type": "application/json",
        },
        data: data,
      };

      axios(config)
        .then(function (response) {
          let html = JSON.stringify(response.data);
          let re = html.substring(html.indexOf("lstImages"));
          re = re.replace(/\\r\\n/gm, " ");
          re = re.replace(/\\/gm, " ");
          re = re.substring(0, re.indexOf("var currImage") - 1);

          re = "var lstImages = [];" + re;
          (0, eval)(re);
          for (let i = 0; i < lstImages.length; i++) {
            lstImages[i] = lstImages[i].replace(/\s/g, "");
          }
          resolve({
            imageList: lstImages,
          });
        })
        .catch(function (error) {
          console.log(error);
        });
    });
  }

  getMangaList(pageNo) {
    let url = `https://readcomiconline.to/ComicList/MostPopular?page=${pageNo}`;
    return new Promise((resolve, reject) => {
      var data = url;
      var config = {
        method: "get",
        url: url,
        headers: {
          "Content-Type": "application/json",
        },
        data: data,
      };

      axios(config)
        .then(function (response) {
          let html = response.data;
          try {
            const $ = cheerio.load(html);
            let comicArr = [];
            $(".item-list")
              .children("div")
              .each((i, el) => {
                comicArr.push({
                  title: $(el)
                    .children("div")
                    .eq(1)
                    .children("p")
                    .eq(0)
                    .children("a")
                    .text()
                    .trim(),
                  link:
                    "https://readcomiconline.to" +
                    $(el).children("div").eq(0).children("a").attr("href"),
                  thumb:
                    $(el)
                      .children("div")
                      .eq(0)
                      .children("a")
                      .children("img")
                      .attr("src")
                      .indexOf("http") !== -1
                      ? $(el)
                          .children("div")
                          .eq(0)
                          .children("a")
                          .children("img")
                          .attr("src")
                      : "https://readcomiconline.to" +
                        $(el)
                          .children("div")
                          .eq(0)
                          .children("a")
                          .children("img")
                          .attr("src"),
                });
              });
            resolve({
              LatestManga: comicArr,
            });
          } catch (e) {
            console.log(e);
          }
        })
        .catch(function (error) {
          console.log(error);
        });
    });
  }

  search(maxItem, title, finalArray) {
    return new Promise((resolve, reject) => {
      var FormData = require("form-data");
      var data = new FormData();
      data.append("keyword", title);
      var config = {
        method: "post",
        url: "https://readcomiconline.to/Search/Comic",
        headers: {
          ...data.getHeaders(),
        },
        data: data,
      };
      axios(config)
        .then(function (response) {
          let html = response.data;
          try {
            const $ = cheerio.load(html);
            $(".item-list")
              .children("div")
              .each((i, el) => {
                if (i < maxItem) {
                  finalArray.push({
                    src: "RCO",
                    thumb:
                      $(el)
                        .children(".cover")
                        .children("a")
                        .children("img")
                        .attr("src")
                        .indexOf("http") !== -1
                        ? $(el)
                            .children(".cover")
                            .children("a")
                            .children("img")
                            .attr("src")
                        : "https://readcomiconline.to" +
                          $(el)
                            .children(".cover")
                            .children("a")
                            .children("img")
                            .attr("src"),
                    link:
                      "https://readcomiconline.to" +
                      $(el).children(".cover").children("a").attr("href"),
                    title: $(el)
                      .children(".cover")
                      .children("a")
                      .children("img")
                      .attr("title"),
                  });
                } else {
                  throw "searchEND";
                }
              });
          } catch (e) {
            if (e !== "searchEND") {
              console.log(e);
            }
          } finally {
            resolve(finalArray);
          }
        })
        .catch(function (error) {
          console.log(error);
        });
    });
  }

  getLatestChapter(url) {
    return new Promise((resolve, reject) => {
      var config = {
        method: "get",
        url: url,
        headers: {
          Referer: "https://readcomiconline.to/Comic/The-Walking-Dead",
          Accept:
            "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
          "User-Agent":
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 11_0_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.88 Safari/537.36",
          "Content-Type": "application/json",
          Cookie: "__cfduid=dba93911b14dc78b1e5ce63fb03c3cab01608623551",
        },
        data: url,
      };

      axios(config)
        .then(function (response) {
          let html = response.data;
          try {
            const $ = cheerio.load(html);
            resolve({
              message: $(".listing")
                .children("tbody")
                .children("tr")
                .eq(2)
                .children("td")
                .eq(0)
                .children("a")
                .text()
                .trim(),
            });
          } catch (e) {
            console.log(e);
          }
        })
        .catch((e) => console.log(e));
    });
  }

  getMangaInfo(url) {
    return new Promise((resolve, reject) => {
      var config = {
        method: "get",
        url: url,
        headers: {
          Referer: "https://readcomiconline.to/Comic/The-Walking-Dead",
          Accept:
            "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
          "User-Agent":
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 11_0_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.88 Safari/537.36",
          "Content-Type": "application/json",
          Cookie: "__cfduid=dba93911b14dc78b1e5ce63fb03c3cab01608623551",
        },
        data: url,
      };

      axios(config)
        .then(function (response) {
          let html = response.data;
          try {
            const $ = cheerio.load(html);
            function fetchChapterList() {
              let comicArr = [];
              $(".listing")
                .children("tbody")
                .children("tr")
                .each((i, el) => {
                  if (i > 1) {
                    comicArr.push({
                      chapterTitle: $(el)
                        .children("td")
                        .eq(0)
                        .children("a")
                        .text()
                        .trim(),
                      chapterLink:
                        "https://readcomiconline.to" +
                        $(el).children("td").eq(0).children("a").attr("href"),
                      chapDate: $(el).children("td").eq(1).text().trim(),
                    });
                  }
                });

              return comicArr;
            }

            let comicObj = {
              title: $(".barContent")
                .eq(0)
                .children("div")
                .children("a")
                .text()
                .trim(),
              author: $(".barContent")
                .eq(0)
                .children("div")
                .children("p")
                .eq(2)
                .text()
                .trim()
                .substring(
                  $(".barContent")
                    .eq(0)
                    .children("div")
                    .children("p")
                    .eq(2)
                    .text()
                    .trim()
                    .indexOf(":") + 1,
                  $(".barContent")
                    .eq(0)
                    .children("div")
                    .children("p")
                    .eq(2)
                    .text()
                    .trim().length
                )
                .trim(),
              status: $(".barContent")
                .eq(0)
                .children("div")
                .children("p")
                .eq(5)
                .text()
                .trim()
                .substring(
                  $(".barContent")
                    .eq(0)
                    .children("div")
                    .children("p")
                    .eq(5)
                    .text()
                    .trim()
                    .indexOf(":") + 1,
                  $(".barContent")
                    .eq(0)
                    .children("div")
                    .children("p")
                    .eq(5)
                    .text()
                    .trim()
                    .indexOf(" ")
                )
                .trim(),
              desc: $(".barContent")
                .eq(0)
                .children("div")
                .children("p")
                .eq(7)
                .text()
                .trim(),
              thumb:
                $(".barContent")
                  .eq(3)
                  .children("div")
                  .children("img")
                  .attr("src")
                  .indexOf("http") !== -1
                  ? $(".barContent")
                      .eq(3)
                      .children("div")
                      .children("img")
                      .attr("src")
                  : "https://readcomiconline.to" +
                    $(".barContent")
                      .eq(3)
                      .children("div")
                      .children("img")
                      .attr("src"),
              chapterList: fetchChapterList(),
            };

            resolve({
              mangaInfo: comicObj,
            });
          } catch (e) {
            console.log(e);
          }
        })
        .catch(function (error) {
          console.log(error);
        });
    });
  }

  getGenre() {
    return new Promise((resolve, reject) => {
      let url = `https://readcomiconline.to/ComicList`;
      var data = url;
      // console.log(url);
      // console.log('chapViewer?link='+encodeURI(url))
      var config = {
        method: "get",
        url: url,
        headers: {
          "Content-Type": "application/json",
          Referer: "https://readcomiconline.to/Comic/",
          Cookie: "__cfduid=dba93911b14dc78b1e5ce63fb03c3cab01608623551",
          Accept:
            "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
          "User-Agent":
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 11_0_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.88 Safari/537.36",
        },
        data: data,
      };

      axios(config)
        .then(function (response) {
          let html = response.data;
          // res.send(html)
          try {
            const $ = cheerio.load(html);
            let genreList = [];
            $(".barContent")
              .eq(1)
              .children("div")
              .children("a")
              .each((i, el) => {
                genreList.push({
                  link: "https://readcomiconline.to" + $(el).attr("href"),
                  title: $(el).text().trim(),
                });
              });
            resolve({ genreList: genreList });
          } catch (e) {
            console.log(e);
          }
        })
        .catch(function (error) {
          console.log(error);
        });
    });
  }

  getGenreManga(link, page) {
    return new Promise((resolve, reject) => {
      let url = link + `?page=${page}`;
      var data = url;
      var config = {
        method: "get",
        url: url,
        headers: {
          "Content-Type": "application/json",
        },
        data: data,
      };

      axios(config)
        .then(function (response) {
          let html = response.data;
          try {
            const $ = cheerio.load(html);
            let comicArr = [];
            $(".item-list")
              .children("div")
              .each((i, el) => {
                comicArr.push({
                  title: $(el)
                    .children("div")
                    .eq(1)
                    .children("p")
                    .eq(0)
                    .children("a")
                    .text()
                    .trim(),
                  link:
                    "https://readcomiconline.to" +
                    $(el).children("div").eq(0).children("a").attr("href"),
                  thumb:
                    "https://readcomiconline.to" +
                    $(el)
                      .children("div")
                      .eq(0)
                      .children("a")
                      .children("img")
                      .attr("src"),
                });
              });
            resolve({
              LatestManga: comicArr,
            });
          } catch (e) {
            console.log(e);
          }
        })
        .catch(function (error) {
          console.log(error);
        });
    });
  }
}

module.exports = ReadComicOnline;
