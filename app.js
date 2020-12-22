const _ = require('underscore');
const express = require('express')
const bodyParser = require('body-parser')
const cheerio = require('cheerio');
const http = require('https');
const cors = require('cors')
    // const puppeteer = require('puppeteer');
const axios = require('axios');
const api = require("mangadex-full-api");



const app = express()
app.use(bodyParser.json());
app.use(cors())

const apiUrl = 'https://mangadex.org/api/v2/'; // for mangadex

// MANGAKAKALOT AND MANGAFOX(can be redone) dont work
// DEMO DEPLOYED AT: https://manga-reader-express.herokuapp.com/
// buildpack https://github.com/jontewks/puppeteer-heroku-buildpack.git
//node app.js > app.log 2>&1

app.post('/getImageList', async(req, res) => {
    let url = req.body.url
    console.log(url)
    if (url.indexOf('fanfox.net/') !== -1) {
        http.get(url, (resp) => {
            let html = '';

            resp.on('data', chunk => {
                html += chunk;
            });

            resp.on('end', () => {
                try {
                    let imagecount = (html.substring(html.lastIndexOf('imagecount')));
                    imagecount = imagecount.substring(0, imagecount.indexOf(';'));
                    imagecount = imagecount.match(/\d+/g).join([]);
                    imagecount = parseInt(imagecount);

                    let temp = (html.substring(html.lastIndexOf('chapterid')));
                    let chapterid = temp.substring(0, temp.indexOf(';'));
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
                                'Referer': 'https://fanfox.net/',
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
                                            return i;
                                        }
                                    }
                                    if (a.length !== b.length) return shorterLength;

                                    return -1;
                                }
                                let indexChange = findIndexOfRepeat(d[0], d[1]);
                                d = d[0];
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

                } catch (e) {
                    console.log(e)
                }
                resp.on('error', () => { console.log(error) });
            });
        });



    } else if (url.indexOf('mangahere') !== -1) {
        http.get(url, (resp) => {
            let html = '';

            resp.on('data', chunk => {
                html += chunk;
            });

            resp.on('end', () => {
                try {
                    let imagecount = (html.substring(html.lastIndexOf('imagecount')));
                    imagecount = imagecount.substring(0, imagecount.indexOf(';'));
                    imagecount = imagecount.match(/\d+/g).join([]);

                    imagecount = parseInt(imagecount);

                    let temp = (html.substring(html.lastIndexOf('chapterid')));
                    let chapterid = temp.substring(0, temp.indexOf(';'));
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
                                'Referer': 'http://www.mangahere.cc/',
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
                                            return i;
                                        }
                                    }
                                    if (a.length !== b.length) return shorterLength;

                                    return -1;
                                }
                                let indexChange = findIndexOfRepeat(d[0], d[1]);
                                d = d[0];
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

                } catch (e) {
                    console.log(e)
                }

            });
            resp.on('error', () => { console.log(error) });
        });
    } else if (url.indexOf('mangapark.net') !== -1) {
        url = url.substring(0, url.lastIndexOf('/'))
        http.get(url, (resp) => {
            let html = '';

            resp.on('data', chunk => {
                html += chunk;
            });

            resp.on('end', () => {
                try {
                    html = html.substring(html.indexOf('_load_pages'));
                    html = html.substring(html.indexOf('['), html.indexOf(';'))
                    let arr = eval(html)
                    let img = [];
                    for (let i of arr) {
                        img.push(i.u)
                    }
                    res.send({ imageList: img })
                } catch (error) {
                    console.log(error)
                }
            });

            resp.on('error', () => { console.log(error) });
        })
    } else if (url.indexOf('mangadex') !== -1) {

        var config = {
            method: 'get',
            url: url + "?saver=true",
        };

        let parseArr = function(sv, hash, list) {
            for (let i = 0; i < list.length; i++) {
                list[i] = sv + hash + '/' + list[i];
            }
            return list;
        }

        axios(config)
            .then(function(response) {
                res.send({
                    imageList: parseArr(response.data.data.server, response.data.data.hash, response.data.data.pages)
                })
            })
            .catch(function(error) {
                console.log(error);
            });

    }
})




app.post('/getMangaList', (req, res) => {
    // Gets manga list according to params and source

    let response = {}
    let pageNo = req.body.page
    let url = ''
    if (req.body.src == "MGFX") {
        // http://fanfox.net/directory/
        url = `https://fanfox.net/directory/${pageNo}.html`
        http.get(url, (resp) => {
            let html = '';

            resp.on('data', chunk => {
                html += chunk;
            });

            resp.on('end', () => {
                try {
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
                } catch (error) {
                    console.log(erro)
                }

            });

            resp.on('error', () => { console.log(error) });

        })
    } else if (req.body.src === "MGHR") {
        url = `https://www.mangahere.cc/directory/${pageNo}.htm`
        http.get(url, (resp) => {
            let html = '';

            resp.on('data', chunk => {
                html += chunk;
            });

            resp.on('end', () => {
                try {
                    const $ = cheerio.load(html);
                    mangaArr = []
                    tempObj = {}
                    $('.manga-list-1-list').children('li').each((idx, el) => {
                        let desc = $(el).children('p').text();
                        desc = desc.replace(/\n/g, '')
                        desc = desc.replace(/\\/g, '')
                        let title = $(el).children('.manga-list-1-item-title').children('a').text();
                        let link = $(el).children('a').attr('href');
                        link = 'https://www.mangahere.cc' + link;
                        let imageLink = $(el).children('a').children('img').attr('src');
                        tempObj = {
                                'description': '',
                                'title': title,
                                'link': link,
                                'thumb': imageLink
                            }
                            //console.log('here')
                        mangaArr.push(tempObj)

                    });

                    response = {
                        'LatestManga': mangaArr
                    }
                    res.send(response)
                } catch (e) {
                    console.log(e)
                }

            })
            resp.on('error', () => { console.log(error) });
        });
    } else if (req.body.src == "MGPK") {
        url = `https://mangapark.net/search?orderby=views_a&genres-exclude=smut&orderby=views_m&page=${pageNo}`
        http.get(url, (resp) => {
            let html = '';

            resp.on('data', chunk => {
                html += chunk;
            });

            resp.on('end', () => {
                try {
                    const $ = cheerio.load(html);
                    mangaArr = []
                    tempObj = {}
                    if ($('body').find($('.no-match')).length !== 0) {
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
                } catch (error) {
                    console.log(error)
                }

            });
        });
    }
    if (req.body.src == "MGDX") {
        url = `https://mangadex.org/titles/9/${pageNo}`;
        http.get(url, (resp) => {
            let html = '';
            resp.on('data', chunk => {
                html += chunk;
            });

            resp.on('end', () => {
                try {
                    const $ = cheerio.load(html);
                    mangaArr = []
                    tempObj = {}
                    if ($('.container').children('.alert-warning').text().trim() !== '') {
                        res.send({
                            'LatestManga': 'end'
                        })
                    } else {
                        $('.manga-entry').each((i, el) => {
                            tempObj = {
                                'description': '',
                                'title': $(el).children('div').eq(1).children('a').text().trim(),
                                'link': 'https://mangadex.org' + $(el).children('div').eq(1).children('a').attr('href'),
                                'thumb': 'https://mangadex.org' + $(el).children('div').eq(0).children('a').children('img').attr('src')
                            }
                            mangaArr.push(tempObj)
                        });
                        response = {
                            'LatestManga': mangaArr
                        }
                        res.send(response)
                    }
                } catch (error) {
                    console.log(error)
                }
            });
        });
    }
})

app.post('/autocomplete', (req, res) => {

    if (req.body.type = 'manga') {
        try {
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
        } catch (e) {
            console.log(e)
        }

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
            try {
                let url = 'https://www.mangahere.cc/search?title=' + encodeURI(title);
                http.get(url, (resp) => {
                    let html = '';

                    resp.on('data', chunk => {
                        html += chunk;
                    });

                    resp.on('end', () => {
                        try {
                            const $ = cheerio.load(html);
                            for (let i = 0; i < maxItem; i++) {
                                if ($('.manga-list-4-list').children('li').eq(i).children('a').attr('title').trim()) {
                                    finalArray.push({
                                        src: 'MGHR',
                                        thumb: $('.manga-list-4-list').children('li').eq(i).children('a').children('img').attr('src'),
                                        link: 'https://www.mangahere.cc' + $('.manga-list-4-list').children('li').eq(i).children('a').attr('href'),
                                        title: $('.manga-list-4-list').children('li').eq(i).children('a').attr('title').trim(),
                                    });
                                }
                            }
                        } catch (e) {
                            console.log(e)

                        } {
                            let url = 'https://fanfox.net/search?title=' + encodeURI(title);
                            http.get(url, (resp) => {
                                let html = '';

                                resp.on('data', chunk => {
                                    html += chunk;
                                });

                                resp.on('end', () => {
                                    try {
                                        const $ = cheerio.load(html);
                                        for (let i = 0; i < maxItem; i++) {
                                            if ($('.manga-list-4-list').children('li').eq(i).children('a').attr('title').trim()) {
                                                finalArray.push({
                                                    src: 'MGFX',
                                                    thumb: $('.manga-list-4-list').children('li').eq(i).children('a').children('img').attr('src'),
                                                    link: 'https://fanfox.net' + $('.manga-list-4-list').children('li').eq(i).children('a').attr('href'),
                                                    title: $('.manga-list-4-list').children('li').eq(i).children('a').attr('title').trim(),
                                                });
                                            }
                                        }
                                    } catch (e) {
                                        console.log(e)
                                    } {
                                        let url = 'https://mangapark.net/search?orderby=views_a&q=' + encodeURI(title);
                                        http.get(url, (resp) => {
                                            let html = '';

                                            resp.on('data', chunk => {
                                                html += chunk;
                                            });

                                            resp.on('end', () => {
                                                try {
                                                    const $ = cheerio.load(html);
                                                    for (let i = 0; i < maxItem; i++) {
                                                        if ($('.manga-list').children('.item').eq(i).children('table').children('tbody').children('tr').children('td').eq(1).children('h2').children('a').text().trim()) {
                                                            finalArray.push({
                                                                src: 'MGPK',
                                                                thumb: $('.manga-list').children('.item').eq(i).children('table').children('tbody').children('tr').children('td').eq(0).children('a').children('img').attr('data-cfsrc'),
                                                                link: 'https://mangapark.net' + $('.manga-list').children('.item').eq(i).children('table').children('tbody').children('tr').children('td').eq(1).children('h2').children('a').attr('href'),
                                                                title: $('.manga-list').children('.item').eq(i).children('table').children('tbody').children('tr').children('td').eq(1).children('h2').children('a').text().trim(),
                                                            });
                                                        }
                                                    }
                                                } catch (e) {
                                                    console.log(e)
                                                } finally {
                                                    res.send({ searchArray: finalArray })

                                                }

                                            });
                                        });
                                    }
                                });
                            });
                        }




                    })
                });
            } catch (e) {
                console.log(e)
            }
        }
    } else if (req.body.type === 'comic') {
        //comic
    } else {
        res.send({ searchArray: 'error' })
    }
});

app.post('/getLatestChapter', (req, res) => {
    if (req.body.src === 'MGPK') {
        let url = req.body.link;
        http.get(url, (resp) => {
            let html = '';

            resp.on('data', chunk => {
                html += chunk;
            });

            resp.on('end', () => {
                try {
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
                } catch (error) {
                    console.log(e)
                }

            });
        });
    } else if (req.body.src === 'MGFX') {
        let url = req.body.link;
        http.get(url, (resp) => {
            let html = '';

            resp.on('data', chunk => {
                html += chunk;
            });

            resp.on('end', () => {
                try {
                    const $ = cheerio.load(html);
                    res.send({ message: $('.detail-main-list').children('li').eq(0).children('a').children('.detail-main-list-main').children('.title3').text() })
                } catch (error) {
                    console.log(e)
                }
            });
        });
    } else if (req.body.src === 'MGHR') {
        let url = req.body.link;
        http.get(url, (resp) => {
            let html = '';

            resp.on('data', chunk => {
                html += chunk;
            });

            resp.on('end', () => {
                try {
                    const $ = cheerio.load(html);
                    res.send({ message: $('.detail-main-list').children('li').eq(0).children('a').children('.detail-main-list-main').children('.title3').text() })
                } catch (e) {
                    console.log(e)
                }

            });
        });
    } else if (req.body.src === 'MGDX') {
        let url = req.body.link;
        let chapterId = url.substring(url.lastIndexOf('title') + 6)
        chapterId = parseInt(chapterId.substring(0, chapterId.lastIndexOf('/')));
        var config = {
            method: 'get',
            url: 'https://mangadex.org/api/v2/manga/' + chapterId + '/chapters',
            headers: {
                'Content-Type': 'application/json',
            }
        };

        axios(config)
            .then(function(response) {
                let data2 = response.data.data;
                for (let i of data2.chapters) {
                    if (i.language === 'gb') {
                        res.send({ message: 'V.' + i.volume + ' ' + 'Ch.' + i.chapter })
                        break;
                    }
                }
            }).catch((e) => { console.log(e) })
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
                try {
                    const $ = cheerio.load(html);
                    tempObj = {}
                    let thumb = $('.detail-info-cover-img').attr('src');
                    let title = $('.detail-info-right-title-font').text();
                    let status = $('.detail-info-right-title-tip').text();
                    let author = $('.detail-info-right-say').children('a').text();
                    let lastUpdate = $('.detail-main-list-title-right').text();
                    let desc = $('.detail-info-right-content').text();


                    let chapterList = []
                    $('.detail-main-list').children('li').each((i, el) => {
                        chapterList.push({
                            'chapterTitle': $(el).children('a').children('.detail-main-list-main').children('.title3').text(),
                            'chapterLink': 'https://fanfox.net' + $(el).children('a').attr('href'),
                            'chapDate': $(el).children('a').children('.detail-main-list-main').children('.title2').text(),
                        });
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
                } catch (e) {
                    console.log(e)
                }

            })
        });
    } else if (url.indexOf('mangahere') !== -1) {
        let tempObj = {}
        http.get(url, (resp) => {
            let html = '';

            resp.on('data', chunk => {
                html += chunk;
            });

            resp.on('end', () => {
                try {
                    const $ = cheerio.load(html);
                    tempObj = {}
                    let thumb = $('.detail-info-cover-img').attr('src');
                    let title = $('.detail-info-right-title-font').text();
                    let status = $('.detail-info-right-title-tip').text();
                    let author = $('.detail-info-right-say').children('a').text();
                    let lastUpdate = $('.detail-main-list-title-right').text();
                    let desc = $('.detail-info-right-content').text();


                    let chapterList = []
                    $('.detail-main-list').children('li').each((i, el) => {
                        chapterList.push({
                            'chapterTitle': $(el).children('a').children('.detail-main-list-main').children('.title3').text(),
                            'chapterLink': 'https://www.mangahere.cc' + $(el).children('a').attr('href'),
                            'chapDate': $(el).children('a').children('.detail-main-list-main').children('.title2').text(),
                        });
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
                } catch (e) {
                    console.log(e)
                }

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
                try {
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
                    response = {
                        'mangaInfo': tempObj
                    }
                    res.send(response)
                } catch (e) {
                    console.log(e)
                }

            });
        });
    } else if (url.indexOf('mangadex') !== -1) {
        let chapterId = url.substring(url.lastIndexOf('title') + 6)
        chapterId = parseInt(chapterId.substring(0, chapterId.lastIndexOf('/')));

        var data = JSON.stringify({ "url": apiUrl + "manga/" + chapterId });
        var config = {
            method: 'get',
            url: 'https://mangadex.org/api/v2/manga/' + chapterId,
            headers: {
                'Content-Type': 'application/json',
            },
            data: data
        };
        axios(config)
            .then(async function(response) {
                let data = response.data.data;
                const retStatus = function(status) {
                    if (status == 1) {
                        return 'Ongoing'
                    } else if (status == 2) {
                        return 'Completed'
                    } else if (status == 3) {
                        return 'Cancelled'
                    } else if (status == 4) {
                        return 'Hiatus'
                    }
                }

                function parseChapterList(list) {
                    let TimeAgo = (function() {
                        var self = {};

                        // Public Methods
                        self.locales = {
                            prefix: '',
                            sufix: 'ago',

                            seconds: 'less than a minute',
                            minute: 'about a minute',
                            minutes: '%d minutes',
                            hour: 'about an hour',
                            hours: 'about %d hours',
                            day: 'a day',
                            days: '%d days',
                            month: 'about a month',
                            months: '%d months',
                            year: 'about a year',
                            years: '%d years'
                        };

                        self.inWords = function(timeAgo) {
                            var seconds = Math.floor((new Date() - parseInt(timeAgo)) / 1000),
                                separator = this.locales.separator || ' ',
                                words = this.locales.prefix + separator,
                                interval = 0,
                                intervals = {
                                    year: seconds / 31536000,
                                    month: seconds / 2592000,
                                    day: seconds / 86400,
                                    hour: seconds / 3600,
                                    minute: seconds / 60
                                };

                            var distance = this.locales.seconds;

                            for (var key in intervals) {
                                interval = Math.floor(intervals[key]);

                                if (interval > 1) {
                                    distance = this.locales[key + 's'];
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
                    }());

                    let retlist = []
                    let listIndex = 0;
                    let tempTitlePrev;
                    let i;
                    for (let index = 0; index < list.length; index++) {
                        i = list[index];
                        currentTitle = 'V.' + (i.volume === '' ? 0 : i.volume) + ' ' + 'Ch.' + i.chapter;
                        if (i.language !== 'gb' || currentTitle === tempTitlePrev) {
                            continue;
                        } else {
                            tempTitlePrev = 'V.' + (i.volume === '' ? 0 : i.volume) + ' ' + 'Ch.' + i.chapter;
                            retlist.push({
                                'chapterTitle': 'V.' + (i.volume === '' ? 0 : i.volume) + ' ' + 'Ch.' + i.chapter,
                                'chapterLink': `https://mangadex.org/api/v2/chapter/${i.id}`,
                                'chapDate': TimeAgo.inWords(i.timestamp * 1000)
                            });
                        }
                    }
                    return retlist;
                }


                var config = {
                    method: 'get',
                    url: 'https://mangadex.org/api/v2/manga/' + chapterId + '/chapters?saver=true',
                    headers: {
                        'Content-Type': 'application/json',
                    }
                };

                axios(config)
                    .then(function(response) {
                        let data2 = response.data.data;
                        response = {
                            'mangaInfo': {
                                'thumb': data.mainCover,
                                'title': data.title,
                                'desc': _.unescape(data.description.substring(0, data.description.lastIndexOf('Descriptions in Other Languages:') - 10).trim()),
                                'status': retStatus(data.publication.status),
                                'author': retStatus(data.author),
                                'lastUpdate': '',
                                'chapterList': parseChapterList(data2.chapters)
                            }
                        }
                        res.send(response)

                    })
                    .catch(function(error) {
                        console.log(error);
                    });
            })
            .catch(function(error) {
                console.log(error);
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
                try {
                    const $ = cheerio.load(html);
                    $('#top-genres').children('.items').children('div').each((i, el) => {
                        genreList.push({
                            link: "https://mangapark.net" + $(el).children('a').eq(0).attr('href'),
                            title: $(el).children('a').eq(0).text(),
                        })
                    });

                    res.send({ genreList: genreList });
                } catch (e) {
                    console.log(e)
                }

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
                try {
                    const $ = cheerio.load(html);
                    $('.browse-bar-filter-list').children('div').children('ul').children('li').each((i, el) => {
                        genreList.push({
                            link: "https://fanfox.net" + $(el).children('a').attr('href'),
                            title: $(el).children('a').text(),
                        })
                        res.send({ genreList: genreList });

                    });
                } catch (e) {
                    console.log(e)
                }


            });
        });
    } else if (req.body.src === "MGHR") {
        let url = "https://www.mangahere.cc/directory/";
        let genreList = [];
        http.get(url, (resp) => {

            let html = '';

            resp.on('data', chunk => {
                html += chunk;
            });

            resp.on('end', () => {
                try {
                    const $ = cheerio.load(html);
                    $('.browse-bar-filter-list').children('div').children('ul').children('li').each((i, el) => {
                        genreList.push({
                            link: "https://www.mangahere.cc" + $(el).children('a').attr('href'),
                            title: $(el).children('a').text(),
                        })
                    });
                } catch (e) {
                    console.log(e)
                }


                res.send({ genreList: genreList });
            });
        });
    } else if (req.body.src === "MGDX") {
        let genreList = [];
        var config = {
            method: 'get',
            url: 'https://mangadex.org/api/v2/tag/',
            data: ''
        };

        axios(config)
            .then(function(response) {
                let data = Object.values(response.data.data);
                for (let i of data) {
                    genreList.push({
                        link: `https://mangadex.org/genre/${i.id}`,
                        title: i.name
                    })
                }
                res.send({ genreList: genreList });
            })
            .catch(function(error) {
                console.log(error);
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
                try {
                    const $ = cheerio.load(html);
                    mangaArr = []
                    tempObj = {}

                    if ($('body').find($('.no-match')).length !== 0) {
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
                } catch (e) {
                    console.log(e)
                }

            });
        });
    } else if (req.body.src === 'MGFX') {
        let url = req.body.link + `${req.body.page}.html`;
        http.get(url, (resp) => {

            let html = '';

            resp.on('data', chunk => {
                html += chunk;
            });

            resp.on('end', () => {
                try {
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
                } catch (e) {
                    console.log(e)
                }
            });
        });
    } else if (req.body.src === 'MGHR') {
        let url = req.body.link + `${req.body.page}.htm`;
        http.get(url, (resp) => {

            let html = '';

            resp.on('data', chunk => {
                html += chunk;
            });

            resp.on('end', () => {
                try {
                    const $ = cheerio.load(html);
                    mangaArr = []
                    tempObj = {}

                    $('.manga-list-1-list').children('li').each((i, el) => {
                        let title = $(el).children('.manga-list-1-item-title').children('a').text().trim();
                        let link = $(el).children('.manga-list-1-item-title').children('a').attr('href');
                        link = 'https://www.mangahere.cc' + link;
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
                } catch (e) {
                    console.log(e)
                }
            });
        });
    } else if (req.body.src === 'MGDX') {
        let url = `https://mangadex.org/genre/2/action/0/${req.body.page}/?s=9#listing`;
        http.get(url, (resp) => {
            let html = '';

            resp.on('data', chunk => {
                html += chunk;
            });

            resp.on('end', () => {
                try {
                    const $ = cheerio.load(html);
                    mangaArr = []
                    tempObj = {}
                    if ($('.container').children('.alert-warning').text().trim() !== '') {
                        res.send({
                            'LatestManga': 'end'
                        })
                    } else {
                        $('.manga-entry').each((i, el) => {
                            tempObj = {
                                'description': '',
                                'title': $(el).children('div').eq(1).children('a').text().trim(),
                                'link': 'https://mangadex.org' + $(el).children('div').eq(1).children('a').attr('href'),
                                'thumb': 'https://mangadex.org' + $(el).children('div').eq(0).children('a').children('img').attr('src')
                            }
                            mangaArr.push(tempObj)
                        });
                        response = {
                            'LatestManga': mangaArr
                        }
                        res.send(response)
                    }
                } catch (e) {
                    console.log(e)
                }


            });
        });

    }
});



app.listen(process.env.PORT || 4000);