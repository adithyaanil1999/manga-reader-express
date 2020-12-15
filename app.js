const express = require('express')
const bodyParser = require('body-parser')
const cheerio = require('cheerio');
const http = require('https');
const cors = require('cors')
const puppeteer = require('puppeteer');



const app = express()




// MANGAKAKALOT AND MANGAFOX(can be redone) dont work



app.use(bodyParser.json());
app.use(cors())



// DEMO DEPLOYED AT: https://manga-reader-express.herokuapp.com/



app.post('/getImageList', (req, res) => {                       
    //Gets image link array from chapter url


    let response = {}
    let imageList = []
    let url = req.body.url
   if(url.indexOf('fanfox.net/') !== -1){ 
        
        
        // MANGA FOX REQUIRES ASYNC PROCESSING not possible with cheerio :( to be redone with puppeteer
        res.send('Work in progress')




    }else if(url.indexOf('mangapark.net') !== -1){
        async function run(){
            //MANGAPARK
            let browser;
            try{
                browser = await puppeteer.launch({
                    args: [
                        '--no-sandbox',
                        '--disable-setuid-sandbox',
                    ],
                });
                const page = await browser.newPage();
                await page.setViewport({ width: 1200, height: 1200 });
                await page.goto(url,{waitUntil:'load',timeout: 0});
                const imgs = await page.$$eval('.img-link img[src]', imgs => imgs.map(img => img.getAttribute('src')));
                res.send({imageList:imgs})
            }catch(e){
                res.send({errormsg:"Something went wrong with the scrapper"});
                console.log(e)
            }finally{
                await browser.close(); 
            }
        }
        run();
    }
})




app.post('/getMangaList', (req, res) => {        
  // Gets manga list according to params and source


  let response = {}
  let pageNo = req.body.page
  let url = ''
  let type = req.body.type
  let status = req.body.status
  let category = req.body.category


  if(req.body.src == "MGFX"){
    // http://fanfox.net/directory/
    url = `https://fanfox.net/directory/${pageNo}.html`
    http.get(url, (resp) => {
        let html = '';
  
        resp.on('data', chunk => {
            html += chunk;
        });
  
        resp.on('end', () => {
            const $ = cheerio.load(html);
            mangaArr = []
            tempObj = {}
            $('.manga-list-1-list').children('li').each((idx, el) => {
                let desc = $(el).children('p').text();
                desc = desc.replace(/\n/g, '')
                desc = desc.replace(/\\/g,'')
                let title = $(el).children('.manga-list-1-item-title').children('a').text();
                let link = $(el).children('a').attr('href');
                link = 'https://fanfox.net'+link;
                let imageLink = $(el).children('a').children('img').attr('src');
                tempObj = {
                    'description': '',
                    'title': title,
                    'link': link,
                    'thumb': imageLink
                }

                mangaArr.push(tempObj)
                    
            });

            response = {
                'LatestManga': mangaArr
            }
            res.send(response)
        });
        
    });
  }else if(req.body.src == "MGPK"){
    url = `https://mangapark.net/search?orderby=views_a&genres-exclude=smut&orderby=views_m&page=${pageNo}`
    http.get(url, (resp) => {
        let html = '';
  
        resp.on('data', chunk => {
            html += chunk;
        });
  
        resp.on('end', () => {
            const $ = cheerio.load(html);
            mangaArr = []
            tempObj = {}
            

            $('.manga-list').children('.item').each((idx, el) => {
               let title = $(el).children('table').children('tbody').children('tr').children('td').eq(1).children('h2').children('a').text().trim();
               let link = $(el).children('table').children('tbody').children('tr').children('td').eq(1).children('h2').children('a').attr('href');
               link = 'https://mangapark.net'+link;
               let imageLink = $(el).children('table').children('tbody').children('tr').children('td').eq(0).children('a').children('img').attr('data-cfsrc')
               tempObj = {
                   'description': '',
                   'title': title,
                   'link': link,
                   'thumb': imageLink
               }

               mangaArr.push(tempObj)
            });
     
            response = {
                'LatestManga': mangaArr
            }
            res.send(response)
        });
    });
  }
  


})

app.post('/autocomplete', (req, res) => {
      
    if(req.body.type='manga'){
        http.get(`https://myanimelist.net/search/prefix.json?type=manga&keyword=${req.body.title}&v=11`, function (response) {
            var chunks = [];
            response.on("data", function (chunk) {
                chunks.push(chunk);
            });
            
            response.on("end", function (chunk) {
                let body = Buffer.concat(chunks);
                jsonBody = JSON.parse(body);
                res.send({message:jsonBody.categories[0].items})
                
            });
        });
    }else{
        //comic
    }
});

app.post('/search', (req, res) => {
    let title = req.body.title;
    let finalArray = [];
    if(req.body.type === 'manga'){
        //MangaPark Results;
        {
            let url = 'https://mangapark.net/search?orderby=views_a&q='+encodeURI(title);
            http.get(url, (resp) => {
                let html = '';
          
                resp.on('data', chunk => {
                    html += chunk;
                });
          
                resp.on('end', () => {
                    const $ = cheerio.load(html);
                    finalArray.push({
                        src:'MGPK',
                        thumb: $('.manga-list').children('.item').eq(0).children('table').children('tbody').children('tr').children('td').eq(0).children('a').children('img').attr('data-cfsrc'),
                        link: 'https://mangapark.net'+$('.manga-list').children('.item').eq(0).children('table').children('tbody').children('tr').children('td').eq(1).children('h2').children('a').attr('href'),
                        title: $('.manga-list').children('.item').eq(0).children('table').children('tbody').children('tr').children('td').eq(1).children('h2').children('a').children('font').text(),
                    });
                    res.send({searchArray:finalArray})
                    {
                        ///MORE source to be added
                    }
                });
            });
        }

    }else if(req.body.type === 'comic'){
        //comic
    }else{
        res.send({searchArray:'error'})
    }
});

app.post('/getLatestChapter', (req, res) => {
    if(req.body.src === 'MGPK'){
        url = req.body.link;
        http.get(url, (resp) => {
            let html = '';
      
            resp.on('data', chunk => {
                html += chunk;
            });
      
            resp.on('end', () => {
                const $ = cheerio.load(html);
                let streamLen = []
                let maxStreams = 0;

                maxStreams = $('.stream').length;

                for(var i=0;i<maxStreams;i++){
                    streamLen.push($('.stream').eq(i).children('div').eq(0).children('div').eq(0).children('span').text())
                }

                for(let i=0;i<maxStreams;i++){
                    streamLen[i] = parseInt(streamLen[i].substring(1,4))
                }

                let bestStream = streamLen.indexOf(Math.max(...streamLen))

                let lastChap = $('.stream').eq(bestStream).find('.tit').eq(0).children('a').text()
                res.send({message:lastChap})
            });
        });
    }
});




app.post('/getMangaInfo', (req, res) => {                       
    
    
    // Gets info and chapter list of manga from url
    let response = {};
    let url = req.body.url;

   if(url.indexOf('fanfox.net') !== -1){
        let tempObj = {}
        http.get(url, (resp) => {
            let html = '';
      
            resp.on('data', chunk => {
                html += chunk;
            });
      
            resp.on('end', () => {
                const $ = cheerio.load(html);
                tempObj = {} 
                let thumb = $('.detail-info-cover-img').attr('src');
                let title = $('.detail-info-right-title-font').text();
                let status = $('.detail-info-right-title-tip').text();
                let author = $('.detail-info-right-say').children('a').text();
                let lastUpdate = $('.detail-main-list-title-right').text();
                let desc = $('.detail-info-right-content').text();


                let chapterList = []
                let chapObj = {}
                let chapTitle = ''
                let chapLink  = ''
                let chapDate = ''

                $('.detail-main-list').children('li').each((i,el)=>{
                    chapTitle = $(el).children('a').children('.detail-main-list-main').children('.title3').text();
                    chapDate =  $(el).children('a').children('.detail-main-list-main').children('.title2').text();
                    chapLink  = $(el).children('a').attr('href');
                    chapLink = 'https://fanfox.net'+chapLink

                    chapObj ={
                        'chapterTitle': chapTitle,
                        'chapterLink': chapLink,
                        'chapDate': chapDate
                    }

                    chapterList.push(chapObj);
                });

                tempObj={
                    'thumb': thumb,
                    'title':title,
                    'desc': desc,
                    'status': status,
                    'author': author,
                    'lastUpdate': lastUpdate,
                    'chapterList': chapterList
                }
    
                response = {
                    'mangaInfo': tempObj
                }
                res.send(response)
            })
        });
    }else if(url.indexOf('mangapark.net') !== -1){

        //kinda effy
        http.get(url, (resp) => {
        
            let html = '';
        
            resp.on('data', chunk => {
                html += chunk;
            });
    
            resp.on('end', () => {
                const $ = cheerio.load(html);
                let thumb = $('.cover').children('img').attr('data-cfsrc');
                let title = $('.pb-1').children('h2').children('a').text();
                let desc = $('.summary').text();
                let status = $('.attr').children('tbody').children('tr').eq(8).children('td').text().trim();
                let author = $('.attr').children('tbody').children('tr').eq(4).children('td').text().trim();


                let chapterList = []
                let chapObj = {}
                
                //FIND OUT WHICH STREAM HAS MOST CHAPTERS

                let streamLen = []
                let maxStreams = 0;

                maxStreams = $('.stream').length;

                for(var i=0;i<maxStreams;i++){
                    streamLen.push($('.stream').eq(i).children('div').eq(0).children('div').eq(0).children('span').text())
                }

                for(let i=0;i<maxStreams;i++){
                    streamLen[i] = parseInt(streamLen[i].substring(1,4))
                }

                let bestStream = streamLen.indexOf(Math.max(...streamLen))
                

                $('.stream').eq(bestStream).find('.tit').each((i,el)=>{
                    let chapDate = $(el).parent().children('.ext').children('.time').text();
                    chapDate = chapDate.replace(/\n+/g, '')
                    chapDate = chapDate.trim()
                    
                    chapObj ={
                        'chapterTitle': $(el).children('a').text(),
                        'chapterLink': "https://mangapark.net"+$(el).children('a').attr('href'),
                        'chapDate': chapDate
                    }
                    chapterList.push(chapObj);
                
                });
                tempObj={
                    'thumb': thumb,
                    'title':title,
                    'desc': desc,
                    'status': status,
                    'author': author,
                    'lastUpdate': '',
                    'chapterList': chapterList
                }
                // console.log(tempObj)
                response = {
                    'mangaInfo': tempObj
                }
                res.send(response)

            });
        });
    }
    
  
})

app.listen(process.env.PORT || 4000);

/*



        fetch('https://cors-anywhere.herokuapp.com/https://mangapark.net/manga/i-became-a-millionaire-s-daughter/i2614002/c27').then(function(response) {
            return response.text();
        }).then(function(string) {
            const r = string;
            console.log(r)
        });

*/