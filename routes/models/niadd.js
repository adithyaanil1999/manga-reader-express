const http = require("https");
const cheerio = require("cheerio");
class Niadd{

    getImageList(url) {
        return new Promise((resolve, reject) => {
            http.get(url, (resp) => {
                let html = "";
        
                resp.on("data", (chunk) => {
                  html += chunk;
                });
        
                resp.on("end", async () => {
                  try {
                      const $ = cheerio.load(html);
                      let imgArr = []
                      imgArr.push($('.manga_pic').attr('src'));
                      const pages=$('.sl-page').children('option')
                      let linkArr = [];
                      pages.each((i,e)=>{
                        linkArr.push($(e).attr('value'))
                      })
                      for(let i=1;i<linkArr.length;i++){
                        const link = 'https://nineanime.com' + linkArr[i];
                        http.get(link, (resp) => {
                          let html = "";
                  
                          resp.on("data", (chunk) => {
                            html += chunk;
                          });
                          resp.on("end", async () => {
                            try {
                              const $temp = cheerio.load(html);
                              imgArr.push($temp('.manga_pic').attr('src'));
                              if(i === linkArr.length-1){
                                resolve({ imageList: imgArr });
                              }
                            }catch(e){
                              console.log(e)
                            }
                          });
                        });
                      }


                  }catch(e){
                      console.log(e)
                  }
                });
            });

        })

    }
    getMangaInfo(url,skipBool = false){
        return new Promise((resolve, reject) => {
            let urlChap = url.substring(0,url.indexOf(".html"));
            urlChap = urlChap + "/chapters.html";
            http.get(url, (resp) => {
                let html = "";  
                resp.on("data", (chunk) => {
                  html += chunk;
                });
                resp.on("end", async () => {
                  try {
                    function NomarlizeDate(date){
                      function timeDifference(current, previous) {
      
                        var msPerMinute = 60 * 1000;
                        var msPerHour = msPerMinute * 60;
                        var msPerDay = msPerHour * 24;
                        var msPerMonth = msPerDay * 30;
                        var msPerYear = msPerDay * 365;
                    
                        var elapsed = current - previous;
                    
                        if (elapsed < msPerMinute) {
                             return Math.round(elapsed/1000) + ' seconds ago';   
                        }
                    
                        else if (elapsed < msPerHour) {
                             return Math.round(elapsed/msPerMinute) + ' minutes ago';   
                        }
                    
                        else if (elapsed < msPerDay ) {
                             return Math.round(elapsed/msPerHour ) + ' hours ago';   
                        }
                    
                        else if (elapsed < msPerMonth) {
                            return Math.round(elapsed/msPerDay) + ' days ago';   
                        }
                    
                        else if (elapsed < msPerYear) {
                            return Math.round(elapsed/msPerMonth) + ' months ago';   
                        }
                    
                        else {
                            return Math.round(elapsed/msPerYear ) + ' years ago';   
                        }
                      }
                      date = date.toLowerCase();
                      if(date.includes("day") || date.includes("hour") || date.includes("second") || date.includes("minute") ){
                        return date
                      }else{
                        const monthMap = {
                          "jan" : 0,
                          "feb": 1,
                          "mar": 2,
                          "apr": 3,
                          "may": 4,
                          "jun": 5,
                          "jul": 6,
                          "aug": 7,
                          "sep": 8,
                          "oct": 9,
                          "nov": 10,
                          "dec": 11
                        }
      
                        const currentTimeStamp = Date.now();
                        // remove comma from date
                        date = date.replace(",","");
                        date = date.split(" ")
                        
                        let newDate = new Date(date[2],monthMap[date[0]],date[1])
                        newDate = newDate.getTime();
                        return timeDifference(currentTimeStamp,newDate)
                      }
                    }
                    function NomarlizeChapter(chap){
                      chap = chap.split('\n')[0]
                      // remove everthing after  first \n
                      chap.substring(0,chap.indexOf("\n"));
                      let res = chap.match(/\d+(?=\D*$)/)
                      if(res)
                        chap = "Chapter "+ res[0]
                      else
                        chap = "Chapter 1"
                      // if "New" is in the chapter name, remove it
                      if(chap.includes("New")){
                        chap = chap.replace("New","");
                      }
                      return chap.trim();
                    }
                    // scrape details of the manga
                    const $ = cheerio.load(html);
                    let chapterList = []
                    let thumb = $('.bookside-img-box').children('a').children('div').children('img').attr('src');
                    let title = $('.bookside-img-box').children('a').children('div').children('img').attr('alt');  
                    let desc = $('.detail-synopsis').eq(1).text().trim();
                    let status = $('.book-status').text().trim();
                    let author = $('.bookside-bookinfo').children('div').eq(1).children('a').text();
                    if(skipBool=== true){
                      resolve({
                        mangaInfo: {
                          thumb: thumb,
                          title: title,
                          desc: desc,
                          status: status,
                          author: author,
                          lastUpdate: "",
                          chapterList: chapterList,
                        },
                      });
                    }else{
                      http.get(urlChap, (resp) => {
                        let html2 = "";  
                        resp.on("data", (chunk) => {
                          html2 += chunk;
                        });
                        resp.on("end", async () => {
                          try {
                            // scrape chapter list
                            const $2 = cheerio.load(html2);
                            $2('.bookinfo-cate-section').children('ul').children('a').each((i,e)=>{
                              chapterList.push({
                                chapterTitle: NomarlizeChapter( $(e).text().trim()),
                                chapterLink: $(e).attr('href'),
                                chapterDate:NomarlizeDate($(e).children("li").children('div').eq(1).children('span').eq(2).text().trim()),
                              })
                            })

                            resolve({
                              mangaInfo: {
                                thumb: thumb,
                                title: title,
                                desc: desc,
                                status: status,
                                author: "",
                                lastUpdate: "",
                                chapterList: chapterList
                              },
                            });
                          }
                          catch (e) {
                            console.log(e)
                          }
                        });
                      });
                      
                    }

                   
                  }
                  catch (e) {
                    console.log(e);
                  }
                });
            });
        })
    }

    getDashboardItems(){
        const url = 'https://www.niadd.com/';
        return new Promise((resolve, reject) => {
            http.get(url, (resp) => {
                let html = "";
        
                resp.on("data", (chunk) => {
                  html += chunk;
                });
        
                resp.on("end", async () => {
                  try {
                    const $ = cheerio.load(html);
                    // console.log($.text())
                    let TrendingItems = [];
                    let popularItems = [];
                    let newUpdates = [];

                    //Trending items

                    // extract the trending items
                   $(".main-content").children(".block-item-box").eq(2)
                    .children("section").children(".rec-list").children(".rec-item").each(
                      (i, e) => {
                        TrendingItems.push({
                          title: $(e).children("a").children(".hover-underline").text().trim(),
                          link: $(e).children("a").attr("href"),
                          thumb: $(e).children("a").children(".rec-manga-pic").children("img").attr("src"),
                        })
                      }
                    )

                    // extract the popular items
                    $(".main-content").children(".block-item-box").eq(5)
                    .children("section").children("div").children("div").each(
                      (i, e) => {
                        popularItems.push({
                          title: $(e).children("a").children(".hover-underline").text().trim(),
                          link: $(e).children("a").attr("href"),
                          thumb: $(e).children("a").children(".rec-manga-pic").children("img").attr("src"),
                        })
                      }
                    )

                    //extract the new updates
                    $(".main-content").children(".block-item-box").eq(0)
                    .children("section").children("div").children("div").each(
                      (i, e) => {
                        newUpdates.push({
                          title: $(e).children("a").children(".hover-underline").text().trim(),
                          link: $(e).children("a").attr("href"),
                          thumb: $(e).children("a").children(".rec-manga-pic").children("img").attr("src"),
                        })
                      }
                    )

                    // get random item from popular items as featured item
                    let random = Math.floor(Math.random() * popularItems.length);
                    // get link of featured item
                    let featuredLink = popularItems[random].link;
                    const featuredInfo = await this.getMangaInfo(featuredLink,true);
                    
                    if(featuredInfo){
                        resolve(
                          {
                            featuredItemInfo: {
                              thumb: featuredInfo.mangaInfo.thumb,
                              title: featuredInfo.mangaInfo.title,
                              desc: featuredInfo.mangaInfo.desc,
                              link: featuredLink,
                            },
                            TrendingItems: TrendingItems,
                            popularItems: popularItems,
                            newUpdates: newUpdates
                          }
                        )
                    }

                  }catch(e){
                      console.log(e)
                  }
                });
            });
        })
    }

    getLatestChapterIndex(url) {
      return new Promise(async(resolve, reject) => {
        try {
          const resp = await this.getMangaInfo(url);
          if(resp){
            resolve(String(resp.mangaInfo.chapterList.length))
          }
        } catch (error) {
          console.log(error)
        }
        
      });
    }

    search(maxItem, title, finalArray) {
      return new Promise((resolve, reject) => {
        title = title.replace(' ','+')
        let url = "https://www.niadd.com/search/?search_type=1&name=" +title;
        http.get(url, (resp) => {
          let html = "";
  
          resp.on("data", (chunk) => {
            html += chunk;
          });

          resp.on("end", () => {
            try {
              const $ = cheerio.load(html);
              $('.manga-list').children('.manga-item').each((i,e)=>{
                let thumbLink =  $(e).children('table').children('tbody').children('tr').children('td').eq(0).children('a').children('div').children('img').attr('src');
                let link = $(e).children('table').children('tbody').children('tr').children('td').eq(0).children('a').attr('href');
                let title = $(e).children('table').children('tbody').children('tr').children('td').eq(0).children('a').attr('title');
                if(i<maxItem){
                  finalArray.push({
                    src: "NIAD",
                    thumb: thumbLink,
                    link: link,
                    title:title
                  })
                }
              })
            }catch(e){
              console.log(e)
            }finally{
              resolve(finalArray)
            }
          });
        });
      });
    }

    getGenre() {
      return new Promise((resolve, reject) => {
        let url = "https://www.niadd.com/search/?type=high";
        let genreList = [];
        http.get(url, (resp) => {
          let html = "";
  
          resp.on("data", (chunk) => {
            html += chunk;
          });
  
          resp.on("end", () => {
            try {
              const $ = cheerio.load(html);
              $('.genre-item').each((i,e)=>{
                genreList.push({
                  link:$(e).children('a').attr('onclick').replace(/[^0-9\.]/g, ''),
                  title:$(e).children('a').text().replace('"',''),
                })
              })

              resolve({ genreList: genreList });
            } catch (e) {
              console.log(e);
            }
          });
        });
      });
    }
    
    getGenreManga(genreArray, page, sort) {
      return new Promise((resolve, reject) => {
        let includeArr = []
        let excludeArr = []

        genreArray.forEach(element => {
          if(element.include === true){
            includeArr.push(element.link)
          }else{
            excludeArr.push(element.link)
          }
        });


        let url = `https://english.niadd.com/search/?name_sel=contain&name=&author_sel=contain&author=&artist_sel=contain&artist=&category_id=${includeArr.join('%2C')}&out_category_id=${excludeArr.join('%2C')}&released=0&rate_star=0&completed_series=&page=${page}.html`
        http.get(url, (resp) => {
          let html = "";
  
          resp.on("data", (chunk) => {
            html += chunk;
          });
  
          resp.on("end", () => {
            try {
              const $ = cheerio.load(html);
              let mangaArr = [];
              $('.manga-item').each((i,e)=>{
                mangaArr.push({
                  title: $(e).children('table').children('tbody').children('tr').children('td').eq(0).children('a').attr('title'),
                  link: $(e).children('table').children('tbody').children('tr').children('td').eq(0).children('a').attr('href'),
                  thumb: $(e).children('table').children('tbody').children('tr').children('td').eq(0).children('a').children('div').children('img').attr('src')
                })
              })
              if(mangaArr.length !== 0){
                resolve({
                  result: {resultList: mangaArr,sorts: []},
                });
              }else{
                resolve({
                  result: {resultList: 'END',sorts:[]}
                });
              }
              
              // }
            } catch (e) {
              console.log(e);
            }
          });
        });
      });
    }
}

module.exports = Niadd;