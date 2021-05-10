const http = require("https");
const axios = require("axios");
const cheerio = require("cheerio");
const moment = require('moment');

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
                const $ = cheerio.load(html);
                function evalMangaList(html){
                    var path = html.substring(html.lastIndexOf("vm.CurPathName = \""),);
                    path = path.substring(path.indexOf("\"")+1,path.indexOf(";")-1);

                    var index = html.substring(html.lastIndexOf("vm.IndexName = \""),);
                    index = index.substring(index.indexOf("\"")+1,index.indexOf(";")-1);

                    console.log(path)
                    console.log(index)

                    function chapText(ChapterString){
                        var Chapter = ChapterString.slice(1,-1);
                        var Odd = ChapterString[ChapterString.length -1];
                        if(Odd == 0){
                            return Chapter;
                        }else{
                            return Chapter + "." + Odd;
                        }
                    };

                    function PageText(PageString){
                        var s = "000" + PageString;
                        return s.substr(s.length - 3);
                    }

                    var currChapterDir = html.substring(html.lastIndexOf("vm.CurChapter = {"),);
                    currChapterDir = currChapterDir.substring(currChapterDir.indexOf("{"),currChapterDir.indexOf('};')+2)
                    eval("currChapterDir = "+currChapterDir);
                    "https://"+path+"/manga/"+index+"/"+ currChapterDir.Directory == '' ? '' : currChapterDir.Directory +'/';

                    var sub = html.substring(html.lastIndexOf("vm.CHAPTERS = ["),);
                    sub = sub.substring(0,sub.indexOf('];'))
                    sub = sub + "];"
                    sub = sub.substring(sub.indexOf("["))
                    var re = eval(sub);
                    var page = currChapterDir.Page;
                    console.log(currChapterDir);
                    var imgList = [];
                    for(var i=1;i<=page;i++){
                        imgList.push("https://"+path+"/manga/"+index+"/"+ (currChapterDir.Directory == '' ? '' : (currChapterDir.Directory +'/'))+chapText(currChapterDir.Chapter)+'-'+PageText(i)+".png");
                    }
                    
                    return imgList;
                } 
                resolve({
                    imageList: evalMangaList(html),
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
    let url = `https://mangasee123.com/`;
    return new Promise((resolve, reject) => {
      http.get(url, (resp) => {
        let html = "";

        resp.on("data", (chunk) => {
          html += chunk;
        });

        resp.on("end", () => {
          try {
            const $ = cheerio.load(html);
            console.log(html)
            function evalMangaList(html){
                var arr = [];
                var sub = html.substring(html.lastIndexOf("LatestJSON"),);
                sub = sub.substring(0,sub.indexOf('];'))
                sub = sub + "];"
                sub = sub.substring(sub.indexOf("["))
                var re = eval(sub);
                for(var x of re){
                    // console.log(x)
                    arr.push({
                        title: x.SeriesName,
                        link: "https://mangasee123.com/manga/"+ x.IndexName,
                        thumb: "https://cover.nep.li/cover/" + x.IndexName + ".jpg"
                    })
                }

                return arr;
            }
            if(pageNo == 1){
              resolve({
                LatestManga: evalMangaList(html),
              });
            }else{
              resolve({
                LatestManga: [],
              });
            }
            
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
      let url = "https://mangasee123.com/search/?name=" + encodeURI(title);
      http.get(url, (resp) => {
        let html = "";
        resp.on("data", (chunk) => {
          html += chunk;
        });
        resp.on("end", () => {
          try {
            const $ = cheerio.load(html);
            var Dir = html.substring(html.lastIndexOf("vm.Directory = ["),);
            Dir = Dir.substring(Dir.indexOf("{")-1,Dir.indexOf('];')+2)
            eval("Dir = "+Dir);

            function binarySearch(sortedArray, key){
              let start = 0;
              let end = sortedArray.length - 1;
              while (start <= end) {
                  let middle = Math.floor((start + end) / 2);
          
                  if (sortedArray[middle].s.toLowerCase() === key.toLowerCase()) {
                      // found the key
                      return middle;
                  } else if (sortedArray[middle].s.toLowerCase() < key.toLowerCase()) {
                      start = middle + 1;
                  } else {
                      // search searching to the left
                      end = middle - 1;
                  }
              }
              // key wasn't found
                return -1;
              }
          
          var hitIndex = binarySearch(Dir,title)
          var hit = Dir[hitIndex];
          if(hitIndex !== -1){
            finalArray.push({
              src: "MGSE",
              link: "https://mangasee123.com/manga/"+ hit.i,
              thumb: "https://cover.nep.li/cover/" + hit.i + ".jpg",
              title:hit.s,
            }); 
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
    // this.search(10,"one piece",[]);
      http.get(url, (resp) => {
        let html = "";

        resp.on("data", (chunk) => {
          html += chunk;
        });

        resp.on("end", () => {
          try {
            const $ = cheerio.load(html);
            function evalMangaList(html){
                function chapName(e){
                    var t=parseInt(e.slice(1,-1)),n=e[e.length-1];
                    return 0==n?t:t+"."+n
                }
                var sub = html.substring(html.lastIndexOf("vm.Chapters"),);
                sub = sub.substring(0,sub.indexOf('];'))
                sub = sub + "];"
                sub = sub.substring(sub.indexOf("["))
                var re = eval(sub);
                return ("chapter "+chapName(re[0].Chapter))
            }
            resolve({
              message: evalMangaList(html)
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
                function evalMangaList(html){
                    function encode(e){
                        var Index="";var t=e.substring(0,1);
                        1!=t&&(Index="-index-"+t);
                        var n=parseInt(e.slice(1,-1)),m="",a=e[e.length-1];
                        return 0!=a&&(m="."+a),"-chapter-"+n+m+Index+".html"
                    }

                    function formatDate(e){
                        var t=moment(e).subtract(9,"hour"),n=moment(),m=n.diff(t,"hours");
                        return n.isSame(t,"d")?moment(e).subtract(9,"hour").fromNow():m<24?moment(e).subtract(9,"hour").calendar():moment(e).subtract(9,"hour").format("L")
                    }

                    function chapName(e){
                        var t=parseInt(e.slice(1,-1)),n=e[e.length-1];
                        return 0==n?t:t+"."+n
                    }

                    var chap = [];
                    var indexName = html.substring(html.lastIndexOf("vm.IndexName = "));
                    indexName = indexName.substring(indexName.indexOf("\"")+1,indexName.indexOf(";")-1);
                    var sub = html.substring(html.lastIndexOf("vm.Chapters"),);
                    sub = sub.substring(0,sub.indexOf('];'))
                    sub = sub + "];"
                    sub = sub.substring(sub.indexOf("["))
                    var re = eval(sub);
                    for(var x of re){
                        chap.push({
                            chapterTitle: "chapter "+chapName(x.Chapter),
                            chapterLink: "https://mangasee123.com/read-online/"+indexName+encode(x.Chapter),
                            chapDate: formatDate(x.Date),
                        })
                    }
    
                    return [indexName,chap];
                }
                var ret = evalMangaList(html)
                resolve({
                  mangaInfo: {
                    thumb: "https://cover.nep.li/cover/"+ret[0]+".jpg",
                    title: $(".BoxBody").children(".row").children("div").eq(2).children("ul").children("li").eq(0).text().trim(),
                    desc: $(".BoxBody").children(".row").children("div").eq(2).children("ul").children("li").eq(-1).children("div").text().trim(),
                    status:  $(".BoxBody").children(".row").children("div").eq(2).children("ul").children("li").eq(-3).children("a").eq(0).text().trim(),
                    author: $(".BoxBody").children(".row").children("div").eq(2).children("ul").children("li").eq(3).children("a").eq(0).text().trim(),
                    chapterList: ret[1],
                  },
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
           var genre = html.substring(html.lastIndexOf("Genre"),);
           genre = genre.substring(genre.indexOf("\"")+1,genre.indexOf(";")-1);
           console.log(genre);
            // $(".browse-bar-filter-list")
            //   .children("div")
            //   .children("ul")
            //   .children("li")
            //   .each((i, el) => {
            //     genreList.push({
            //       link: "https://fanfox.net" + $(el).children("a").attr("href"),
            //       title: $(el).children("a").text(),
            //     });
            //   });
          } catch (e) {
            console.log(e);
          }
          resolve({ genreList: []});
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

    



            // let mangaArr = [];

            // $(".manga-list-1-list")
            //   .children("li")
            //   .each((i, el) => {
            //     let title = $(el)
            //       .children(".manga-list-1-item-title")
            //       .children("a")
            //       .text()
            //       .trim();
            //     let link = $(el)
            //       .children(".manga-list-1-item-title")
            //       .children("a")
            //       .attr("href");
            //     link = "https://fanfox.net" + link;
            //     let imageLink = $(el).children("a").children("img").attr("src");
            //     mangaArr.push({
            //       description: "",
            //       title: title,
            //       link: link,
            //       thumb: imageLink,
            //     });
            //   });

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
