var express = require("express");
var router = express.Router();

// const mangaPark = require("../models/mangaPark");
const mangaHere = require("../models/mangaHere");
const mangaFox = require("../models/mangaFox");
const mangaDex = require("../models/mangaDex");
const mangaSee = require("../models/mangaSee");
const readComicOnline = require("../models/readComicOnline");
const autoComplete = require("../models/autoComplete");
const mangaJar = require("../models/mangaJar");



// const mangaJarObj = new mangaPark();
const mangaHereObj = new mangaHere();
const mangaFoxObj = new mangaFox();
const mangaDexObj = new mangaDex();
const mangaSeeObj = new mangaSee();
const readComicOnlineObj = new readComicOnline();
const mangaJarObj = new mangaJar();
const autoCompleteObj = new autoComplete();

const sourcesOBJ = {
  // MGHR: {
  //   domain: "mangahere",
  //   name: "MangaHere",
  // },
  // MGFX: {
  //   domain: "fanfox.net",
  //   name: "MangaFox",
  // },
  RCO: {
    domain: "readcomiconline",
    name: "ReadComicOnline",
    isComic:true
  },
  MGJR:{
    domain: "mangajar",
    name: "MangaJar",
  }
  // MGSE:{
  //   domain: "mangasee123.com",
  //   name: "Mangasee",
  // }
};

router.post("/getImageList", async (req, res) => {
  let url = req.body.url;
  if (url.indexOf("fanfox.net/") !== -1) {
    mangaFoxObj.getImageList(url, req.body.reliable).then((data) => {
      res.send(data);
    });
  } else if (url.indexOf("mangahere") !== -1) {
    mangaHereObj.getImageList(url, req.body.reliable).then((data) => {
      res.send(data);
    });
  } else if (url.indexOf("mangajar") !== -1) {
    mangaJarObj.getImageList(url).then((data) => {
      res.send(data);
    });
  } else if (url.indexOf("mangasee123") !== -1) {
    mangaSeeObj.getImageList(url).then((data) => {
      res.send(data);
    });
  } else if (url.indexOf("mangadex") !== -1) {
    mangaDexObj.getImageList(url).then((data) => {
      res.send(data);
    });
  } else if (url.indexOf("readcomiconline.to") !== -1) {
    readComicOnlineObj.getImageList(url).then((data) => {
      res.send(data);
    });
  } else {
    res.send({ message: "error" });
  }
});

router.post("/getMangaList", (req, res) => {
  // Gets manga list according to params and source
  let pageNo = req.body.page;
  switch (req.body.src) {
    case "MGFX":
      mangaFoxObj.getMangaList(pageNo).then((data) => {
        res.send(data);
      });
      break;
    case "MGHR":
      mangaHereObj.getMangaList(pageNo).then((data) => {
        res.send(data);
      });
      break;
    case "MGSE":
        mangaSeeObj.getMangaList(pageNo).then((data) => {
          res.send(data);
        });
        break;
    case "MGDX":
      mangaDexObj.getMangaList(pageNo).then((data) => {
        res.send(data);
      });
      break;
    case "RCO":
      readComicOnlineObj.getMangaList(pageNo).then((data) => {
        res.send(data);
      });
      break;
    case "MGJR":
      mangaJarObj.getMangaList(pageNo).then((data)=>{
        res.send(data)
      });
      break;
    default:
      res.send({ message: "error" });
      break;
  }
});

router.post("/autocomplete", (req, res) => {
  if (req.body.type === "manga") {
    autoCompleteObj.autoCompleteManga(req.body.title).then((data) => {
      res.send(data);
    });
  } else {
    autoCompleteObj.autoCompleteComic(req.body.title).then((data) => {
      res.send(data);
    });
  }
});

router.post("/search", (req, res) => {
  let title = req.body.title;
  let maxItem = req.body.maxItems;
  let maxComicItem = req.body.maxItems;
  if (req.body.type === "manga") {
    {
      mangaFoxObj.search(maxItem, title, []).then((data) => {
        mangaHereObj.search(maxItem, title, data).then((data) => {
          mangaJarObj.search(maxItem,title,data).then((data)=>{
              res.send({ searchArray: data });
          })
        });
      });
    }
  } else if (req.body.type === "comic") {
    try {
      readComicOnlineObj.search(maxComicItem, title, []).then((data) => {
        res.send({ searchArray: data });
      });
    } catch (e) {
      console.log(e);
    }
  } else {
    res.send({ searchArray: "error" });
  }
});

router.post("/getLatestChapter", (req, res) => {
  switch (req.body.src) {
    case "MGFX":
      mangaFoxObj.getLatestChapter(req.body.link).then((data) => {
        res.send(data);
      });
      break;
    case "MGJR":
      mangaJarObj.getLatestChapter(req.body.link).then((resp) => {
        res.send(resp);
      });
      break;
    case "MGSE":
        mangaSeeObj.getLatestChapter(req.body.link).then((resp) => {
          res.send(resp);
        });
        break;
    case "MGHR":
      mangaHereObj.getLatestChapter(req.body.link).then((data) => {
        res.send(data);
      });
      break;
    case "MGDX":
      mangaDexObj.getLatestChapter(req.body.link).then((data) => {
        res.send(data);
      });
      break;
    case "RCO":
      readComicOnlineObj.getLatestChapter(req.body.link).then((data) => {
        res.send(data);
      });
      break;
    default:
      res.send({ message: "Latest error" });
      break;
  }
});

router.post("/getMangaInfo", (req, res) => {
  // Gets info and chapter list of manga from url
  let url = req.body.url;
  if (url.indexOf("fanfox.net") !== -1) {
    mangaFoxObj.getMangaInfo(url).then((data) => {
      res.send(data);
    });
  } else if (url.indexOf("mangahere") !== -1) {
    mangaHereObj.getMangaInfo(url).then((data) => {
      res.send(data);
    });
  } else if (url.indexOf("mangajar") !== -1) {
    mangaJarObj.getMangaInfo(url).then((data) => {
      res.send(data);
    });
  } else if (url.indexOf("mangasee123") !== -1) {
    mangaSeeObj.getMangaInfo(url).then((data) => {
      res.send(data);
    });
  } else if (url.indexOf("mangadex") !== -1) {
    mangaDexObj.getMangaInfo(url).then((data) => {
      res.send(data);
    });
  } else if (url.indexOf("readcomiconline.to/" !== -1)) {
    readComicOnlineObj.getMangaInfo(url).then((data) => {
      res.send(data);
    });
  }
});

router.post("/getGenres", (req, res) => {
  switch (req.body.src) {
    case "MGFX":
      mangaFoxObj.getGenre().then((data) => {
        res.send(data);
      });
      break;
    case "MGJR":
      mangaJarObj.getGenre().then((data) => {
        res.send(data);
      });
      break;
    case "MGSE":
        mangaSeeObj.getGenre().then((data) => {
          res.send(data);
        });
        break;
    case "MGHR":
      mangaHereObj.getGenre().then((data) => {
        res.send(data);
      });
      break;
    case "MGDX":
      mangaDexObj.getGenre().then((data) => {
        res.send(data);
      });
      break;
    case "RCO":
      readComicOnlineObj.getGenre().then((data) => {
        res.send(data);
      });
      break;
    default:
      res.send({ message: "error" });
      break;
  }
});

router.post("/genreManga", (req, res) => {
  switch (req.body.src) {
    case "MGFX":
      mangaFoxObj.getGenreManga(req.body.link, req.body.page).then((data) => {
        res.send(data);
      });
      break;
    case "MGJR":
      mangaJarObj.getGenreManga(req.body.link, req.body.page).then((data) => {
        res.send(data);
      });
      break;
    case "MGSE":
        mangaSeeObj.getGenreManga(req.body.link, req.body.page).then((data) => {
          res.send(data);
        });
        break;
    case "MGHR":
      mangaHereObj.getGenreManga(req.body.link, req.body.page).then((data) => {
        res.send(data);
      });
      break;
    case "MGDX":
      mangaDexObj.getGenreManga(req.body.link, req.body.page).then((data) => {
        res.send(data);
      });
      break;
    case "RCO":
      readComicOnlineObj
        .getGenreManga(req.body.link, req.body.page)
        .then((data) => {
          res.send(data);
        });
      break;
    default:
      res.send({ message: "error" });
      break;
  }
});

router.get("/sourceList", (req, res) => {
  res.send(sourcesOBJ);
});

router.get("/loaderio-d93ad6fc1bf4137c4e38eee965a3e838.html", (req, res) => {
  res.send("loaderio-d93ad6fc1bf4137c4e38eee965a3e838");
});

module.exports = router;
