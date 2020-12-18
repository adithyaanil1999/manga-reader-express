const express = require('express')
const bodyParser = require('body-parser')
const cheerio = require('cheerio');
const http = require('https');
const cors = require('cors')
const puppeteer = require('puppeteer');
const axios = require('axios');



const app = express()
app.use(bodyParser.json());
app.use(cors())

// MANGAKAKALOT AND MANGAFOX(can be redone) dont work
// DEMO DEPLOYED AT: https://manga-reader-express.herokuapp.com/

app.post('/getImageList', async(req, res) => {
    let url = req.body.url
    if (url.indexOf('fanfox.net/') !== -1) {
        http.get(url, (resp) => {
            let html = '';

            resp.on('data', chunk => {
                html += chunk;
            });

            resp.on('end', () => {
                let imagecount = (html.substring(html.lastIndexOf('imagecount')));
                imagecount = imagecount.substring(0, imagecount.indexOf(';'));
                imagecount = imagecount.match(/\d+/g).join([]);

                imagecount = parseInt(imagecount);

                let temp = (html.substring(html.lastIndexOf('chapterid')));
                chapterid = temp.substring(0, temp.indexOf(';'));
                chapterid = chapterid.match(/\d+/g).join([]);

                function callFetch() {
                    //limits scope of eval statement
                    let urlParsed = url;
                    urlParsed = urlParsed.substring(0, urlParsed.lastIndexOf('/'));
                    urlParsed = urlParsed + `/chapterfun.ashx?cid=${chapterid}&page=1&key=`
                    var config = {
                        method: 'get',
                        url: urlParsed,
                        headers: {
                            'Referer': 'https://fanfox.net/manga/konjiki_no_moji_tsukai_yuusha_yonin_ni_makikomareta_unique_cheat/v12/c066/1.html',
                        },
                    };
                    axios(config)
                        .then(function(response) {

                            let zeroadd = function(number) {
                                length = 2;
                                var my_string = '' + number;
                                while (my_string.length < length) {
                                    my_string = '0' + my_string;
                                }

                                return my_string;
                            }

                            let imgList = []

                            let re = eval(JSON.stringify(response.data))
                            re = eval(re)

                            function findIndexOfRepeat(a, b) {
                                var shorterLength = Math.min(a.length, b.length);
                                for (var i = 0; i < shorterLength; i++) {
                                    if (a[i] !== b[i] && isNaN(parseInt(b[i]))) {
                                        return i - 1;
                                    } else if (a[i] !== b[i]) {
                                        console.log(parseInt(b[i + 1]))
                                        return i;
                                    }
                                }
                                if (a.length !== b.length) return shorterLength;

                                return -1;
                            }
                            let indexChange = findIndexOfRepeat(d[0], d[1]);
                            console.log(d)
                            d = d[0];
                            console.log(d[indexChange])
                            let startIndex = parseInt(d.substring(indexChange - 1, indexChange + 1));
                            let left = d.substring(0, indexChange - 1)
                            left = 'https:' + left;
                            let right = d.substring(indexChange + 1)
                            let t = ''
                            for (let i = 1; i < imagecount; i++) {
                                t = left + zeroadd(startIndex) + right;
                                startIndex++;
                                imgList.push(t);
                                t = '';

                            }
                            res.send({ imageList: imgList })

                        })
                        .catch(function(error) {
                            console.log(error);
                        });
                }

                callFetch();
            });
        });



    } else if (url.indexOf('mangapark.net') !== -1) {
        async function run() {
            //MANGAPARK
            let browser;
            url = url.substring(0, url.lastIndexOf('/'))
            try {
                browser = await puppeteer.launch({
                    args: [
                        '--no-sandbox',
                        '--disable-setuid-sandbox',
                    ],
                });
                const page = await browser.newPage();
                await page.setViewport({ width: 1200, height: 1200 });
                await page.goto(url, { waitUntil: 'load', timeout: 0 });
                const imgs = await page.$$eval('.img-link img[src]', imgs => imgs.map(img => img.getAttribute('src')));
                res.send({ imageList: imgs })
            } catch (e) {
                res.send({ errormsg: "Something went wrong with the scrapper" });
                console.log(e);
            } finally {
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


    if (req.body.src == "MGFX") {
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
                    desc = desc.replace(/\\/g, '')
                    let title = $(el).children('.manga-list-1-item-title').children('a').text();
                    let link = $(el).children('a').attr('href');
                    link = 'https://fanfox.net' + link;
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
    } else if (req.body.src == "MGPK") {
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
                if ($('body').find($('.no-match')).length !== 0) {
                    console.log('end');
                    res.send({
                        'LatestManga': 'end'
                    })
                } else {
                    $('.manga-list').children('.item').each((idx, el) => {
                        let title = $(el).children('table').children('tbody').children('tr').children('td').eq(1).children('h2').children('a').text().trim();
                        let link = $(el).children('table').children('tbody').children('tr').children('td').eq(1).children('h2').children('a').attr('href');
                        link = 'https://mangapark.net' + link;
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

                }
            });
        });
    }



})

app.post('/autocomplete', (req, res) => {

    if (req.body.type = 'manga') {
        http.get(`https://myanimelist.net/search/prefix.json?type=manga&keyword=${req.body.title}&v=11`, function(response) {
            var chunks = [];
            response.on("data", function(chunk) {
                chunks.push(chunk);
            });

            response.on("end", function(chunk) {
                let body = Buffer.concat(chunks);
                jsonBody = JSON.parse(body);
                res.send({ message: jsonBody.categories[0].items })

            });
        });
    } else {
        //comic
    }
});

app.post('/search', (req, res) => {
    let title = req.body.title;
    let finalArray = [];
    let maxItem = 3;

    if (req.body.type === 'manga') {
        {
            ///MORE source to be added
            let url = 'https://fanfox.net/search?title=' + encodeURI(title);
            http.get(url, (resp) => {
                let html = '';

                resp.on('data', chunk => {
                    html += chunk;
                });

                resp.on('end', () => {
                    const $ = cheerio.load(html);
                    for (let i = 0; i < maxItem; i++) {
                        finalArray.push({
                            src: 'MGFX',
                            thumb: $('.manga-list-4-list').children('li').eq(i).children('a').children('img').attr('src'),
                            link: 'https://fanfox.net' + $('.manga-list-4-list').children('li').eq(i).children('a').attr('href'),
                            title: $('.manga-list-4-list').children('li').eq(i).children('a').attr('title').trim(),
                        });
                    } {
                        let url = 'https://mangapark.net/search?orderby=views_a&q=' + encodeURI(title);
                        http.get(url, (resp) => {
                            let html = '';

                            resp.on('data', chunk => {
                                html += chunk;
                            });

                            resp.on('end', () => {
                                const $ = cheerio.load(html);
                                for (let i = 0; i < maxItem; i++) {
                                    finalArray.push({
                                        src: 'MGPK',
                                        thumb: $('.manga-list').children('.item').eq(i).children('table').children('tbody').children('tr').children('td').eq(0).children('a').children('img').attr('data-cfsrc'),
                                        link: 'https://mangapark.net' + $('.manga-list').children('.item').eq(i).children('table').children('tbody').children('tr').children('td').eq(1).children('h2').children('a').attr('href'),
                                        title: $('.manga-list').children('.item').eq(i).children('table').children('tbody').children('tr').children('td').eq(1).children('h2').children('a').text(),
                                    });
                                }
                                res.send({ searchArray: finalArray })
                            });
                        });
                    }
                });
            });
        }
        //MangaPark Results;


    } else if (req.body.type === 'comic') {
        //comic
    } else {
        res.send({ searchArray: 'error' })
    }
});

app.post('/getLatestChapter', (req, res) => {
    if (req.body.src === 'MGPK') {
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

                for (var i = 0; i < maxStreams; i++) {
                    streamLen.push($('.stream').eq(i).children('div').eq(0).children('div').eq(0).children('span').text())
                }

                for (let i = 0; i < maxStreams; i++) {
                    streamLen[i] = parseInt(streamLen[i].substring(1, 4))
                }

                let bestStream = streamLen.indexOf(Math.max(...streamLen))

                let lastChap = $('.stream').eq(bestStream).find('.tit').eq(0).children('a').text()
                res.send({ message: lastChap })
            });
        });
    } else if (req.body.src === 'MGFX') {
        url = req.body.link;
        http.get(url, (resp) => {
            let html = '';

            resp.on('data', chunk => {
                html += chunk;
            });

            resp.on('end', () => {
                const $ = cheerio.load(html);
                res.send({ message: $('.detail-main-list').children('li').eq(0).children('a').children('.detail-main-list-main').children('.title3').text() })
            });
        });

    }
});




app.post('/getMangaInfo', (req, res) => {


    // Gets info and chapter list of manga from url
    let response = {};
    let url = req.body.url;

    if (url.indexOf('fanfox.net') !== -1) {
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
                let chapLink = ''
                let chapDate = ''

                $('.detail-main-list').children('li').each((i, el) => {
                    chapTitle = $(el).children('a').children('.detail-main-list-main').children('.title3').text();
                    chapDate = $(el).children('a').children('.detail-main-list-main').children('.title2').text();
                    chapLink = $(el).children('a').attr('href');
                    chapLink = 'https://fanfox.net' + chapLink

                    chapObj = {
                        'chapterTitle': chapTitle,
                        'chapterLink': chapLink,
                        'chapDate': chapDate
                    }

                    chapterList.push(chapObj);
                });

                tempObj = {
                    'thumb': thumb,
                    'title': title,
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
    } else if (url.indexOf('mangapark.net') !== -1) {

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

                for (var i = 0; i < maxStreams; i++) {
                    streamLen.push($('.stream').eq(i).children('div').eq(0).children('div').eq(0).children('span').text())
                }

                for (let i = 0; i < maxStreams; i++) {
                    streamLen[i] = parseInt(streamLen[i].substring(1, 4))
                }

                let bestStream = streamLen.indexOf(Math.max(...streamLen))


                $('.stream').eq(bestStream).find('.tit').each((i, el) => {
                    let chapDate = $(el).parent().children('.ext').children('.time').text();
                    chapDate = chapDate.replace(/\n+/g, '')
                    chapDate = chapDate.trim()

                    chapObj = {
                        'chapterTitle': $(el).children('a').text(),
                        'chapterLink': "https://mangapark.net" + $(el).children('a').attr('href'),
                        'chapDate': chapDate
                    }
                    chapterList.push(chapObj);

                });
                tempObj = {
                        'thumb': thumb,
                        'title': title,
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

app.post('/getGenres', (req, res) => {
    if (req.body.src === 'MGPK') {
        let url = "https://mangapark.net/genre";
        let genreList = [];
        http.get(url, (resp) => {

            let html = '';

            resp.on('data', chunk => {
                html += chunk;
            });

            resp.on('end', () => {
                const $ = cheerio.load(html);
                $('#top-genres').children('.items').children('div').each((i, el) => {
                    genreList.push({
                        link: "https://mangapark.net" + $(el).children('a').eq(0).attr('href'),
                        title: $(el).children('a').eq(0).text(),
                    })
                });

                res.send({ genreList: genreList });
            });
        });
    } else if (req.body.src === "MGFX") {
        let url = "https://fanfox.net/directory/";
        let genreList = [];
        http.get(url, (resp) => {

            let html = '';

            resp.on('data', chunk => {
                html += chunk;
            });

            resp.on('end', () => {
                const $ = cheerio.load(html);
                $('.browse-bar-filter-list').children('div').children('ul').children('li').each((i, el) => {
                    genreList.push({
                        link: "https://fanfox.net" + $(el).children('a').attr('href'),
                        title: $(el).children('a').text(),
                    })
                });

                res.send({ genreList: genreList });
            });
        });
    }
});

app.post('/genreManga', (req, res) => {
    if (req.body.src === 'MGPK') {
        let url = req.body.link + `/${req.body.page}?views_t`;
        http.get(url, (resp) => {

            let html = '';

            resp.on('data', chunk => {
                html += chunk;
            });

            resp.on('end', () => {
                const $ = cheerio.load(html);
                mangaArr = []
                tempObj = {}

                if ($('body').find($('.no-match')).length !== 0) {
                    console.log('end');
                    res.send({
                        'LatestManga': 'end'
                    })
                } else {
                    $('.ls1').children('div').each((idx, el) => {
                        let title = $(el).children('div').children('h3').children('a').text().trim();
                        let link = $(el).children('div').children('h3').children('a').attr('href');
                        link = 'https://mangapark.net' + link;
                        let imageLink = $(el).children('a').children('img').attr('data-cfsrc');
                        tempObj = {
                            'description': '',
                            'title': title,
                            'link': link,
                            'thumb': imageLink
                        }
                        mangaArr.push(tempObj)
                    });

                    let response = {
                        'LatestManga': mangaArr
                    }
                    res.send(response)
                }
            });
        });
    } else if (req.body.src === 'MGFX') {
        let url = req.body.link + http + `${req.body.page}.html`;
        http.get(url, (resp) => {

            let html = '';

            resp.on('data', chunk => {
                html += chunk;
            });

            resp.on('end', () => {
                const $ = cheerio.load(html);
                mangaArr = []
                tempObj = {}

                $('.manga-list-1-list').children('li').each((i, el) => {
                    let title = $(el).children('.manga-list-1-item-title').children('a').text().trim();
                    let link = $(el).children('.manga-list-1-item-title').children('a').attr('href');
                    link = 'https://fanfox.net' + link;
                    let imageLink = $(el).children('a').children('img').attr('src');
                    tempObj = {
                        'description': '',
                        'title': title,
                        'link': link,
                        'thumb': imageLink
                    }
                    mangaArr.push(tempObj)

                });

                let response = {
                    'LatestManga': mangaArr
                }
                res.send(response)


            });
        });
    }
});



app.listen(process.env.PORT || 4000);