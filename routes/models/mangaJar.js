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
            // console.log(html)
            $(".carousel-inner")
              .children(".carousel-item")
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
            if(img.length === 0){
              $(".chapter-images")
              .children("img")
              .each((i,e)=>{
                let src = $(e).attr("data-src");
                if(src === undefined){
                  src = $(e).attr("src");
                }
                img.push(src);
                
              })
            }
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

  getDashboardItems(){
    const url = 'https://mangajar.com/';
    return new Promise((resolve, reject) => {
      http.get(url, (resp) => {
        let html = "";

        resp.on("data", (chunk) => {
          html += chunk;
        });

        resp.on("end", async () => {
          try {
            const $ = cheerio.load(html);
            let TrendingItems = [];
            let popularItems = [];
            let newUpdates = [];
            $(".splide__list").eq(1).children("article").each(
              (i,e)=>{
                TrendingItems.push({
                  link: 'https://mangajar.com'+ $(e).children(".poster-container").children("a").attr("href"),
                  thumb: $(e).children(".poster-container").children("a").children("img").attr("src") || $(e).children(".poster-container").children("a").children("img").attr("data-splide-lazy"),
                  title: $(e).children(".poster-container").children("a").attr("title")
                })
            });
            let featuredIndex = Math.floor(Math.random() * TrendingItems.length)
            let featuredLink = TrendingItems[featuredIndex].link 
            const featuredInfo = await this.getMangaInfo(featuredLink,true);
            $(".splide__list").eq(0).children("article").each(
              (i,e)=>{
                newUpdates.push({
                  link: 'https://mangajar.com'+ $(e).children(".poster-container").children("a").attr("href"),
                  thumb: $(e).children(".poster-container").children("a").children("img").attr("src") || $(e).children(".poster-container").children("a").children("img").attr("data-splide-lazy"),
                  title: $(e).children(".poster-container").children("a").attr("title")
                })
            });
            $(".splide__list").eq(3).children("article").each(
              (i,e)=>{
                popularItems.push({
                  link: 'https://mangajar.com'+ $(e).children(".poster-container").children("a").attr("href"),
                  thumb: $(e).children(".poster-container").children("a").children("img").attr("src")|| $(e).children(".poster-container").children("a").children("img").attr("data-splide-lazy"),
                  title: $(e).children(".poster-container").children("a").attr("title")
                })
            });

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
          } catch (error) {
            reject(error)
            console.log(error)
          }
        });
      });
    });
  }

  search(maxItem, title, finalArray) {
    return new Promise((resolve, reject) => {
      let url = "https://mangajar.com/search?q=" + encodeURI(title);
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
                $(".row")
                  .children("div")
                  .children("div")
                  .eq(0)
                  .children("article").length !== 0
                  
                ) {
                let thumbLink =  $(".row").children("div").children("div")
                                .eq(0)
                                .children("article")
                                .eq(i)
                                .children("a")
                                .children("img")
                                .attr("data-src") ?
                                $(".row").children("div").children("div")
                                .eq(0)
                                .children("article")
                                .eq(i)
                                .children("a")
                                .children("img")
                                .attr("data-src"):
                                $(".row").children("div").children("div")
                                .eq(0)
                                .children("article")
                                .eq(i)
                                .children("a")
                                .children("img")
                                .attr("src")
                finalArray.push({
                  src: "MGJR",
                  thumb: thumbLink,
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

  getMangaInfo(url,skipBool = false) {
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
                          .children("h1")
                          .children("span")
                          .text();
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
                    "january" : 0,
                    "february": 1,
                    "march": 2,
                    "april": 3,
                    "may": 4,
                    "june": 5,
                    "july": 6,
                    "august": 7,
                    "september": 8,
                    "october": 9,
                    "november": 10,
                    "december": 11
                  }

                  const currentTimeStamp = Date.now();
                  date = date.split(" ")
                  
                  let newDate = new Date(date[2],monthMap[date[1]],date[0])
                  newDate = newDate.getTime();
                  return timeDifference(currentTimeStamp,newDate)
                }
            }

            function NomarlizeChapter(chap){
              let res = chap.match(/\d+(?=\D*$)/)
              chap = "Chapter "+ res[0]
              return chap
            }

            let chapterList = [];
            let countChapter = 1;
            function doRequest(link){
                let $2 = null
                let chap_list = [];
                try {
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
                                chapterTitle:NomarlizeChapter($2(el).children("a").children("span").text().trim()),
                                chapterLink:"https://mangajar.com"+$2(el).children("a").attr("href"),
                                chapterDate:NomarlizeDate($2(el).children("span").text().trim()),
                              });
                            });
      
                          resolve(chap_list)
                        
                        })

                        

                        
                      }).on('error', (e) => {
                        // console.error(e);
                        // console.log(link)
                        reject("NOT_FOUND");
                      });
                      
                  });
                }
                catch (error) {
                  console.log(error)
                }
              }
            
            
            if(skipBool === false){
              $(".chapter-list-container")
                .children("li")
                .each((idx, el) => {
                  chapterList.push({
                    chapterTitle:NomarlizeChapter($(el).children("a").children("span").text().trim()),
                    chapterLink:"https://mangajar.com"+$(el).children("a").attr("href"),
                    chapterDate:NomarlizeDate($(el).children("span").text().trim()),
                  });
                });

            }
            // console.log(chapterList)

            if(skipBool === false){
              let chap_pages = $(".chapters-infinite-pagination").children("nav").children(".pagination").children(".page-item").eq(-2).text();
              let link = "https://mangajar.com" + $(".pagination").children("li").eq(2).children("a").attr("href");
              link = link.slice(0,link.length-2)
              

              // console.log(chap_pages)
              for(let i = 2 ; i <= chap_pages; i++){
                let url = link + "=" + i;

                let data = await doRequest(url);
                chapterList = chapterList.concat(data);
              }
            }
            // console.log(chapterList)

            
            
            if(skipBool=== false){
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
            }else{
              resolve({
                mangaInfo: {
                  thumb: thumb,
                  title: title,
                  desc: desc,
                  status: status,
                  author: "",
                  lastUpdate: "",
                },
              });
            }

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

  getGenreManga(genreArray, page, sort) {
    return new Promise((resolve, reject) => {
      let url = ''
      if(sort === 'default'){
        url = genreArray[0].link+ `?page=${page}`;
      }else if(sort === "Year (newest first)"){
        url = genreArray[0].link + `?sortBy=-year&translated%5B0%5D=0&translated%5B1%5D=1&years%5B0%5D=2020&years%5B1%5D=2019&years%5B2%5D=2018&years%5B3%5D=2017&years%5B4%5D=2016&years%5B5%5D=2015&years%5B6%5D=2014&years%5B7%5D=2013&years%5B8%5D=2012&years%5B9%5D=2011&years%5B10%5D=2010&years%5B11%5D=2009&years%5B12%5D=2008&years%5B13%5D=2007&years%5B14%5D=2006&years%5B15%5D=2005&years%5B16%5D=2004&years%5B17%5D=2003&years%5B18%5D=2002&years%5B19%5D=2001&years%5B20%5D=2000&years%5B21%5D=1999&years%5B22%5D=1998&years%5B23%5D=1997&years%5B24%5D=1996&years%5B25%5D=1995&years%5B26%5D=1994&years%5B27%5D=1993&years%5B28%5D=1992&years%5B29%5D=1991&years%5B30%5D=1990&years%5B31%5D=1989&years%5B32%5D=1988&years%5B33%5D=1987&years%5B34%5D=1986&years%5B35%5D=1985&years%5B36%5D=1984&years%5B37%5D=1983&years%5B38%5D=1982&years%5B39%5D=1981&years%5B40%5D=1980&years%5B41%5D=1979&years%5B42%5D=1976&years%5B43%5D=1972&years%5B44%5D=1969&years%5B45%5D=1968&years%5B46%5D=1967&years%5B47%5D=0&page=${page}`
      }else if(sort === "Year (oldest first)"){
        url = genreArray[0].link + `?sortBy=year&translated%5B0%5D=0&translated%5B1%5D=1&years%5B0%5D=2020&years%5B1%5D=2019&years%5B2%5D=2018&years%5B3%5D=2017&years%5B4%5D=2016&years%5B5%5D=2015&years%5B6%5D=2014&years%5B7%5D=2013&years%5B8%5D=2012&years%5B9%5D=2011&years%5B10%5D=2010&years%5B11%5D=2009&years%5B12%5D=2008&years%5B13%5D=2007&years%5B14%5D=2006&years%5B15%5D=2005&years%5B16%5D=2004&years%5B17%5D=2003&years%5B18%5D=2002&years%5B19%5D=2001&years%5B20%5D=2000&years%5B21%5D=1999&years%5B22%5D=1998&years%5B23%5D=1997&years%5B24%5D=1996&years%5B25%5D=1995&years%5B26%5D=1994&years%5B27%5D=1993&years%5B28%5D=1992&years%5B29%5D=1991&years%5B30%5D=1990&years%5B31%5D=1989&years%5B32%5D=1988&years%5B33%5D=1987&years%5B34%5D=1986&years%5B35%5D=1985&years%5B36%5D=1984&years%5B37%5D=1983&years%5B38%5D=1982&years%5B39%5D=1981&years%5B40%5D=1980&years%5B41%5D=1979&years%5B42%5D=1976&years%5B43%5D=1972&years%5B44%5D=1969&years%5B45%5D=1968&years%5B46%5D=1967&years%5B47%5D=0&page=${page}`
      }else if(sort === "Popularity (popular first)"){
        url = genreArray[0].link+ `?page=${page}`;
      }else if(sort === "Popularity (unpopular first)"){
        url = genreArray[0].link + `?sortBy=-popular&translated%5B0%5D=0&translated%5B1%5D=1&years%5B0%5D=2020&years%5B1%5D=2019&years%5B2%5D=2018&years%5B3%5D=2017&years%5B4%5D=2016&years%5B5%5D=2015&years%5B6%5D=2014&years%5B7%5D=2013&years%5B8%5D=2012&years%5B9%5D=2011&years%5B10%5D=2010&years%5B11%5D=2009&years%5B12%5D=2008&years%5B13%5D=2007&years%5B14%5D=2006&years%5B15%5D=2005&years%5B16%5D=2004&years%5B17%5D=2003&years%5B18%5D=2002&years%5B19%5D=2001&years%5B20%5D=2000&years%5B21%5D=1999&years%5B22%5D=1998&years%5B23%5D=1997&years%5B24%5D=1996&years%5B25%5D=1995&years%5B26%5D=1994&years%5B27%5D=1993&years%5B28%5D=1992&years%5B29%5D=1991&years%5B30%5D=1990&years%5B31%5D=1989&years%5B32%5D=1988&years%5B33%5D=1987&years%5B34%5D=1986&years%5B35%5D=1985&years%5B36%5D=1984&years%5B37%5D=1983&years%5B38%5D=1982&years%5B39%5D=1981&years%5B40%5D=1980&years%5B41%5D=1979&years%5B42%5D=1976&years%5B43%5D=1972&years%5B44%5D=1969&years%5B45%5D=1968&years%5B46%5D=1967&years%5B47%5D=0&page=${page}`;
      }else if(sort === "Alphabet (a-z)"){
        url = genreArray[0].link + `?sortBy=name&translated%5B0%5D=0&translated%5B1%5D=1&years%5B0%5D=2020&years%5B1%5D=2019&years%5B2%5D=2018&years%5B3%5D=2017&years%5B4%5D=2016&years%5B5%5D=2015&years%5B6%5D=2014&years%5B7%5D=2013&years%5B8%5D=2012&years%5B9%5D=2011&years%5B10%5D=2010&years%5B11%5D=2009&years%5B12%5D=2008&years%5B13%5D=2007&years%5B14%5D=2006&years%5B15%5D=2005&years%5B16%5D=2004&years%5B17%5D=2003&years%5B18%5D=2002&years%5B19%5D=2001&years%5B20%5D=2000&years%5B21%5D=1999&years%5B22%5D=1998&years%5B23%5D=1997&years%5B24%5D=1996&years%5B25%5D=1995&years%5B26%5D=1994&years%5B27%5D=1993&years%5B28%5D=1992&years%5B29%5D=1991&years%5B30%5D=1990&years%5B31%5D=1989&years%5B32%5D=1988&years%5B33%5D=1987&years%5B34%5D=1986&years%5B35%5D=1985&years%5B36%5D=1984&years%5B37%5D=1983&years%5B38%5D=1982&years%5B39%5D=1981&years%5B40%5D=1980&years%5B41%5D=1979&years%5B42%5D=1976&years%5B43%5D=1972&years%5B44%5D=1969&years%5B45%5D=1968&years%5B46%5D=1967&years%5B47%5D=0&page=${page}`;
      }else if(sort ==="Alphabet (z-a)"){
        url = genreArray[0].link + `?sortBy=-name&translated%5B0%5D=0&translated%5B1%5D=1&years%5B0%5D=2020&years%5B1%5D=2019&years%5B2%5D=2018&years%5B3%5D=2017&years%5B4%5D=2016&years%5B5%5D=2015&years%5B6%5D=2014&years%5B7%5D=2013&years%5B8%5D=2012&years%5B9%5D=2011&years%5B10%5D=2010&years%5B11%5D=2009&years%5B12%5D=2008&years%5B13%5D=2007&years%5B14%5D=2006&years%5B15%5D=2005&years%5B16%5D=2004&years%5B17%5D=2003&years%5B18%5D=2002&years%5B19%5D=2001&years%5B20%5D=2000&years%5B21%5D=1999&years%5B22%5D=1998&years%5B23%5D=1997&years%5B24%5D=1996&years%5B25%5D=1995&years%5B26%5D=1994&years%5B27%5D=1993&years%5B28%5D=1992&years%5B29%5D=1991&years%5B30%5D=1990&years%5B31%5D=1989&years%5B32%5D=1988&years%5B33%5D=1987&years%5B34%5D=1986&years%5B35%5D=1985&years%5B36%5D=1984&years%5B37%5D=1983&years%5B38%5D=1982&years%5B39%5D=1981&years%5B40%5D=1980&years%5B41%5D=1979&years%5B42%5D=1976&years%5B43%5D=1972&years%5B44%5D=1969&years%5B45%5D=1968&years%5B46%5D=1967&years%5B47%5D=0&page=${page}`
      }else if(sort === "Date added (newest first)"){
        url = genreArray[0].link + `?sortBy=-published_at&translated%5B0%5D=0&translated%5B1%5D=1&years%5B0%5D=2020&years%5B1%5D=2019&years%5B2%5D=2018&years%5B3%5D=2017&years%5B4%5D=2016&years%5B5%5D=2015&years%5B6%5D=2014&years%5B7%5D=2013&years%5B8%5D=2012&years%5B9%5D=2011&years%5B10%5D=2010&years%5B11%5D=2009&years%5B12%5D=2008&years%5B13%5D=2007&years%5B14%5D=2006&years%5B15%5D=2005&years%5B16%5D=2004&years%5B17%5D=2003&years%5B18%5D=2002&years%5B19%5D=2001&years%5B20%5D=2000&years%5B21%5D=1999&years%5B22%5D=1998&years%5B23%5D=1997&years%5B24%5D=1996&years%5B25%5D=1995&years%5B26%5D=1994&years%5B27%5D=1993&years%5B28%5D=1992&years%5B29%5D=1991&years%5B30%5D=1990&years%5B31%5D=1989&years%5B32%5D=1988&years%5B33%5D=1987&years%5B34%5D=1986&years%5B35%5D=1985&years%5B36%5D=1984&years%5B37%5D=1983&years%5B38%5D=1982&years%5B39%5D=1981&years%5B40%5D=1980&years%5B41%5D=1979&years%5B42%5D=1976&years%5B43%5D=1972&years%5B44%5D=1969&years%5B45%5D=1968&years%5B46%5D=1967&years%5B47%5D=0&page=${page}`
      }else if(sort ==="Date added (oldest first)"){
        url = genreArray[0].link + `?sortBy=published_at&translated%5B0%5D=0&translated%5B1%5D=1&years%5B0%5D=2020&years%5B1%5D=2019&years%5B2%5D=2018&years%5B3%5D=2017&years%5B4%5D=2016&years%5B5%5D=2015&years%5B6%5D=2014&years%5B7%5D=2013&years%5B8%5D=2012&years%5B9%5D=2011&years%5B10%5D=2010&years%5B11%5D=2009&years%5B12%5D=2008&years%5B13%5D=2007&years%5B14%5D=2006&years%5B15%5D=2005&years%5B16%5D=2004&years%5B17%5D=2003&years%5B18%5D=2002&years%5B19%5D=2001&years%5B20%5D=2000&years%5B21%5D=1999&years%5B22%5D=1998&years%5B23%5D=1997&years%5B24%5D=1996&years%5B25%5D=1995&years%5B26%5D=1994&years%5B27%5D=1993&years%5B28%5D=1992&years%5B29%5D=1991&years%5B30%5D=1990&years%5B31%5D=1989&years%5B32%5D=1988&years%5B33%5D=1987&years%5B34%5D=1986&years%5B35%5D=1985&years%5B36%5D=1984&years%5B37%5D=1983&years%5B38%5D=1982&years%5B39%5D=1981&years%5B40%5D=1980&years%5B41%5D=1979&years%5B42%5D=1976&years%5B43%5D=1972&years%5B44%5D=1969&years%5B45%5D=1968&years%5B46%5D=1967&years%5B47%5D=0&page=${page}`
      }else if(sort ==="Date updated (newest first)"){
        url = genreArray[0].link + `?sortBy=-last_chapter_at&translated%5B0%5D=0&translated%5B1%5D=1&years%5B0%5D=2020&years%5B1%5D=2019&years%5B2%5D=2018&years%5B3%5D=2017&years%5B4%5D=2016&years%5B5%5D=2015&years%5B6%5D=2014&years%5B7%5D=2013&years%5B8%5D=2012&years%5B9%5D=2011&years%5B10%5D=2010&years%5B11%5D=2009&years%5B12%5D=2008&years%5B13%5D=2007&years%5B14%5D=2006&years%5B15%5D=2005&years%5B16%5D=2004&years%5B17%5D=2003&years%5B18%5D=2002&years%5B19%5D=2001&years%5B20%5D=2000&years%5B21%5D=1999&years%5B22%5D=1998&years%5B23%5D=1997&years%5B24%5D=1996&years%5B25%5D=1995&years%5B26%5D=1994&years%5B27%5D=1993&years%5B28%5D=1992&years%5B29%5D=1991&years%5B30%5D=1990&years%5B31%5D=1989&years%5B32%5D=1988&years%5B33%5D=1987&years%5B34%5D=1986&years%5B35%5D=1985&years%5B36%5D=1984&years%5B37%5D=1983&years%5B38%5D=1982&years%5B39%5D=1981&years%5B40%5D=1980&years%5B41%5D=1979&years%5B42%5D=1976&years%5B43%5D=1972&years%5B44%5D=1969&years%5B45%5D=1968&years%5B46%5D=1967&years%5B47%5D=0&page=${page}`
      }else if(sort === "Date updated (oldest first)"){
        url = genreArray[0].link + `?sortBy=last_chapter_at&translated%5B0%5D=0&translated%5B1%5D=1&years%5B0%5D=2020&years%5B1%5D=2019&years%5B2%5D=2018&years%5B3%5D=2017&years%5B4%5D=2016&years%5B5%5D=2015&years%5B6%5D=2014&years%5B7%5D=2013&years%5B8%5D=2012&years%5B9%5D=2011&years%5B10%5D=2010&years%5B11%5D=2009&years%5B12%5D=2008&years%5B13%5D=2007&years%5B14%5D=2006&years%5B15%5D=2005&years%5B16%5D=2004&years%5B17%5D=2003&years%5B18%5D=2002&years%5B19%5D=2001&years%5B20%5D=2000&years%5B21%5D=1999&years%5B22%5D=1998&years%5B23%5D=1997&years%5B24%5D=1996&years%5B25%5D=1995&years%5B26%5D=1994&years%5B27%5D=1993&years%5B28%5D=1992&years%5B29%5D=1991&years%5B30%5D=1990&years%5B31%5D=1989&years%5B32%5D=1988&years%5B33%5D=1987&years%5B34%5D=1986&years%5B35%5D=1985&years%5B36%5D=1984&years%5B37%5D=1983&years%5B38%5D=1982&years%5B39%5D=1981&years%5B40%5D=1980&years%5B41%5D=1979&years%5B42%5D=1976&years%5B43%5D=1972&years%5B44%5D=1969&years%5B45%5D=1968&years%5B46%5D=1967&years%5B47%5D=0&page=${page}`
      }
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
            let sortArr = [];
            $('#sortBy').children('option')
            .each((i,e)=>{
              sortArr.push($(e).text().trim() + $(e).attr('data-subtext'))
            });
            if($(".flex-item-mini").length > 0){
              $(".flex-item-mini")
                .each((idx, el) => {
                  let title = $(el)
                    .children("div")
                    .children("a")
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
                result: {resultList: mangaArr,sorts: sortArr},
              });
            }else{
              resolve({
                result: {resultList: 'END',sorts: sortArr}
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


  //Error Fix For Link
  getLinkFromName(name){
    return new Promise((resolve, reject) => {
      // console.log(name)

      let url = "https://mangajar.com/search?q=" + encodeURI(name.split('-')[0]);
      http.get(url, (resp) => {
        let html = "";

        resp.on("data", (chunk) => {
          html += chunk;
        });

        resp.on("end", () => {
          try {
            const $ = cheerio.load(html);
            let maxItem = 1
            let link = ''
            for (let i = 0; i < maxItem; i++) {
              if (
                $(".row")
                  .children("div")
                  .children("div")
                  .eq(0)
                  .children("article").length !== 0    
                ){
                  link = 
                    "https://mangajar.com" +
                    $(".row")
                    .children("div")
                    .children("div")
                    .eq(0)
                    .children("article")
                    .eq(i)
                    .children("a")
                    .attr("href")

                  resolve({link:link,name:name.split('- ')[0].trim()})
                }
              }
          }
          catch (e) {
            console.log(e);
          }
        });
      });
    });
  }
}

module.exports = MangaJar;
