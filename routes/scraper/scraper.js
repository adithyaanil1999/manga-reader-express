var express = require("express");
var router = express.Router();

const mangaPark = require("../models/mangaPark");
const mangaHere = require("../models/mangaHere");
const mangaFox = require("../models/mangaFox");
const mangaDex = require("../models/mangaDex");
const readComicOnline = require("../models/readComicOnline");
const autoComplete = require("../models/autoComplete");

const mangaParkObj = new mangaPark();
const mangaHereObj = new mangaHere();
const mangaFoxObj = new mangaFox();
const mangaDexObj = new mangaDex();
const readComicOnlineObj = new readComicOnline();
const autoCompleteObj = new autoComplete();

const sourcesOBJ = {
  MGPK: {
    domain: "mangapark.net",
    name: "MangaPark",
  },
  MGHR: {
    domain: "mangahere",
    name: "MangaHere",
  },
  MGFX: {
    domain: "fanfox.net",
    name: "MangaFOX",
  },
  RCO: {
    domain: "readcomiconline",
    name: "readComicsOnline",
  },
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
  } else if (url.indexOf("mangapark.net") !== -1) {
    mangaParkObj.getImageList(url).then((data) => {
      res.send(data);
    });
  } else if (url.indexOf("mangadex") !== -1) {
    mangaDex.getImageList(url).then((data) => {
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
    case "MGPK":
      mangaParkObj.getMangaList(pageNo).then((data) => {
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
  let maxItem = 20;
  let maxComicItem = 20;
  if (req.body.type === "manga") {
    {
      mangaParkObj.search(maxItem, title, []).then((data) => {
        mangaFoxObj.search(maxItem, title, data).then((data) => {
          mangaHereObj.search(maxItem, title, data).then((data) => {
            res.send({ searchArray: data });
          });
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
    case "MGPK":
      mangaParkObj.getLatestChapter(req.body.link).then((resp) => {
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
      res.send({ message: "error" });
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
  } else if (url.indexOf("mangapark.net") !== -1) {
    mangaParkObj.getMangaInfo(url).then((data) => {
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
    case "MGPK":
      mangaParkObj.getGenre().then((data) => {
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
    case "MGPK":
      mangaParkObj.getGenreManga(req.body.link, req.body.page).then((data) => {
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
