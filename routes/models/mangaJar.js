const http = require("https");
const cheerio = require("cheerio");

class MangaJar{
  getImageList(url) {
    return new Promise((resolve, reject) => {
      http.get(url, (resp) => {
        let html = "";

        resp.on("data", (chunk) => {
          html += chunk;
        });

        resp.on("end", () => {
          try {
            const $ = cheerio.load(html);
            let img = [];

            $(".carousel-inner")
              .children("div")
              .each((i,e)=>{
                let text = $(e).text();
                if(text.indexOf("Last chapter") == -1){
                  let src = $(e).children("img").attr("data-src");
                  if(src === undefined){
                    src = $(e).children("img").attr("src");
                  }
                  img.push(src);
                }
              })
            
            resolve({ imageList: img });
          } catch (error) {
            console.log(error);
          }
        });

        resp.on("error", () => {
          console.log(error);
        });
      });
    });
  }

  getMangaList(pageNo) {
    let url = `https://mangajar.com/manga?sortBy=popular&translated%5B0%5D=0&translated%5B1%5D=1&years%5B0%5D=2020&years%5B1%5D=2019&years%5B2%5D=2018&years%5B3%5D=2017&years%5B4%5D=2016&years%5B5%5D=2015&years%5B6%5D=2014&years%5B7%5D=2013&years%5B8%5D=2012&years%5B9%5D=2011&years%5B10%5D=2010&years%5B11%5D=2009&years%5B12%5D=2008&years%5B13%5D=2007&years%5B14%5D=2006&years%5B15%5D=2005&years%5B16%5D=2004&years%5B17%5D=2003&years%5B18%5D=2002&years%5B19%5D=2001&years%5B20%5D=2000&years%5B21%5D=1999&years%5B22%5D=1998&years%5B23%5D=1997&years%5B24%5D=1996&years%5B25%5D=1995&years%5B26%5D=1994&years%5B27%5D=1993&years%5B28%5D=1992&years%5B29%5D=1991&years%5B30%5D=1990&years%5B31%5D=1989&years%5B32%5D=1988&years%5B33%5D=1987&years%5B34%5D=1986&years%5B35%5D=1985&years%5B36%5D=1984&years%5B37%5D=1983&years%5B38%5D=1982&years%5B39%5D=1981&years%5B40%5D=1980&years%5B41%5D=1979&years%5B42%5D=1976&years%5B43%5D=1972&years%5B44%5D=1969&years%5B45%5D=1968&years%5B46%5D=1967&years%5B47%5D=0&genres%5B0%5D=1&genres%5B1%5D=2&genres%5B2%5D=3&genres%5B3%5D=4&genres%5B4%5D=5&genres%5B5%5D=6&genres%5B6%5D=7&genres%5B7%5D=14&genres%5B8%5D=15&genres%5B9%5D=16&genres%5B10%5D=20&genres%5B11%5D=21&genres%5B12%5D=22&genres%5B13%5D=29&genres%5B14%5D=35&genres%5B15%5D=50&genres%5B16%5D=51&genres%5B17%5D=52&genres%5B18%5D=61&genres%5B19%5D=67&genres%5B20%5D=70&genres%5B21%5D=79&genres%5B22%5D=164&genres%5B23%5D=212&genres%5B24%5D=248&genres%5B25%5D=249&genres%5B26%5D=295&genres%5B27%5D=344&genres%5B28%5D=394&genres%5B29%5D=481&genres%5B30%5D=545&genres%5B31%5D=572&genres%5B32%5D=711&genres%5B33%5D=731&genres%5B34%5D=743&genres%5B35%5D=836&genres%5B36%5D=1067&genres%5B37%5D=1068&genres%5B38%5D=1388&genres%5B39%5D=1409&genres%5B40%5D=1627&genres%5B41%5D=1681&genres%5B42%5D=1717&genres%5B43%5D=1819&genres%5B44%5D=2142&genres%5B45%5D=3898&genres%5B46%5D=4242&genres%5B47%5D=4992&genres%5B48%5D=4993&genres%5B49%5D=5007&genres%5B50%5D=5019&genres%5B51%5D=5020&genres%5B52%5D=5055&genres%5B53%5D=5133&genres%5B54%5D=5142&genres%5B55%5D=5296&genres%5B56%5D=5372&genres%5B57%5D=5590&genres%5B58%5D=5716&page=${pageNo}`;
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
            if ($(".card-body").children("div").eq(0).children("article").length == 0) {
              resolve({
                LatestManga: [],
              });
            } else {
              $(".card-body")
                .children("div")
                .eq(0)
                .children("article")
                .each((idx, el) => {
                  let title = $(el)
                    .children("a")
                    .eq(0)
                    .attr("title")
                  // console.log(title)
                  let link = $(el)
                    .children("a")
                    .attr("href")
                    
                  link = "https://mangajar.com" + link;
                  let imageLink = $(el)
                    .children("a")
                    .children("img")
                    .attr("data-src")

                  if(imageLink === undefined){
                    imageLink = $(el)
                    .children("a")
                    .children("img")
                    .attr("src")
                  }

                  tempObj = {
                    description: "",
                    title: title,
                    link: link,
                    thumb: imageLink,
                  };

                  mangaArr.push(tempObj);
                });

              resolve({
                LatestManga: mangaArr,
              });
            }
          } catch (error) {
            console.log(error);
          }
        });
      });
    });
  }

  search(maxItem, title, finalArray) {
    return new Promise((resolve, reject) => {
      let url = "https://mangajar.com/search?q=" + encodeURI(title);
      console.log(url)
      http.get(url, (resp) => {
        let html = "";

        resp.on("data", (chunk) => {
          html += chunk;
        });

        resp.on("end", () => {
          try {
            const $ = cheerio.load(html);
            console.log(html)
            for (let i = 0; i < maxItem; i++) {
              if (
                $(".row")
                  .children("div")
                  .children("div")
                  .eq(0)
                  .children("article").length !== 0
                  
                ) {
                
                finalArray.push({
                  src: "MGJR",
                  thumb: $(".row")
                    .children("div")
                    .children("div")
                    .eq(0)
                    .children("article")
                    .eq(i)
                    .children("a")
                    .children("img")
                    .attr("src"),
                  link:
                    "https://mangajar.com" +
                    $(".row")
                    .children("div")
                    .children("div")
                    .eq(0)
                    .children("article")
                    .eq(i)
                    .children("a")
                    .attr("href"),

                  title: $(".row")
                    .children("div")
                    .children("div")
                    .eq(0)
                    .children("article")
                    .eq(i)
                    .children("a")
                    .attr("title")
                    .trim(),
                });
              }
            }
          } catch (e) {
            console.log(e);
          } finally {
            resolve(finalArray);
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
              message: $(".chapter-list-container")
              .children("li")
              .eq(0)
              .children("a").children("span").text().trim()
            });
          } catch (error) {
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

        resp.on("end", async () => {
          try {
            const $ = cheerio.load(html);
            let thumb = $(".card-body")
                          .eq(0)
                          .children("div")
                          .eq(0)
                          .children("div")
                          .eq(0)
                          .children("img")
                          .attr("src");
            let title = $(".card-body")
                          .children("div")
                          .eq(0)
                          .children("div")
                          .eq(0)
                          .children("img")
                          .attr("title");
            let desc = $(".manga-description")
                          .text()
                          .trim();
            let status =  $(".card-body")
                            .children("div")
                            .eq(0)
                            .children("div")
                            .eq(1)
                            .children(".post-info")
                            .children("span")
                            .eq(1)
                            .text();
              status = status.substring(status.indexOf(':')+1)
              status = status.trim()
            

            let chapterList = [];

            $(".chapter-list-container")
              .children("li")
              .each((idx, el) => {
                chapterList.push({
                  chapterTitle:$(el).children("a").children("span").text().trim(),
                  chapterLink:"https://mangajar.com"+$(el).children("a").attr("href"),
                  chapDate:$(el).children("span").text().trim(),
                });
              });

            let chap_pages = $(".pagination").children("li").length - 3;
            let $2 = null
          
            function doRequest(link){
              let chap_list = [];
              return new Promise((resolve, reject) => {
                http.get(link, (resp) => {
                  let html = "";
          
                  resp.on("data", (chunk) => {
                    html += chunk;
                  });
          
                  resp.on("end", () => {
                    
                    $2 = cheerio.load(html);
                    $2(".chapter-list-container")
                      .children("li")
                      .each((idx, el) => {
                        chap_list.push({
                          chapterTitle:$2(el).children("a").children("span").text().trim(),
                          chapterLink:"https://mangajar.com"+$2(el).children("a").attr("href"),
                          chapDate:$2(el).children("span").text().trim(),
                        });
                      });

                    resolve(chap_list)
                  
                  })
                });
              }
              )
            }

            for(let i = 2 ; i < chap_pages +2; i++){
              let link = "https://mangajar.com" + $(".pagination").children("li").eq(i).children("a").attr("href");
              chapterList = chapterList.concat(await doRequest(link));
            
            }
            
            resolve({
              mangaInfo: {
                thumb: thumb,
                title: title,
                desc: desc,
                status: status,
                author: "",
                lastUpdate: "",
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
      let url = "https://mangajar.com/genre";
      let genreList = [];
      http.get(url, (resp) => {
        let html = "";

        resp.on("data", (chunk) => {
          html += chunk;
        });

        resp.on("end", () => {
          try {
            const $ = cheerio.load(html);
            $(".card-body")
              .children("div")
              .children("div")
              .each((i, el) => {
                genreList.push({
                  link: encodeURI("https://mangajar.com" +$(el).children("a").attr("href")),
                  title: $(el).children("a").text(),
                });
              });

            resolve({ genreList: genreList });
          } catch (e) {
            console.log(e);
          }
        });
      });
    });
  }

  getGenreManga(link, page) {
    return new Promise((resolve, reject) => {
      let url = link + `?page=${page}`;
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

            // if ($(".row").eq(2).children("article").length == 0) {
            //   resolve({
            //     LatestManga: [],
            //   });
            // } else {
              $(".flex-item-mini")
                .each((idx, el) => {
                  let title = $(el)
                    .children("div")
                    .children("a")
                    .children("img")
                    .attr("title")
                    .trim();
                  let link = $(el)
                    .children("div")
                    .children("a")
                    .attr("href");
                  link = "https://mangajar.com" + link;
                  let imageLink = $(el)
                  .children("div")
                  .children("a")
                  .children("img")
                  .attr("data-src")
                  tempObj = {
                    description: "",
                    title: title,
                    link: link,
                    thumb: imageLink,
                  };
                  mangaArr.push(tempObj);
                });

              resolve({
                LatestManga: mangaArr,
              });
            // }
          } catch (e) {
            console.log(e);
          }
        });
      });
    });
  }
}

module.exports = MangaJar;
