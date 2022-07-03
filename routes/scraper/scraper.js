var express = require("express");
var router = express.Router();

// const mangaPark = require("../models/mangaPark");
const autoComplete = require("../models/autoComplete");
const mangaJar = require("../models/mangaJar");
const niadd = require("../models/niadd")



// const mangaJarObj = new mangaPark();
const mangaJarObj = new mangaJar();
const autoCompleteObj = new autoComplete();
const niaddObj = new niadd();

const sourcesOBJ = {
  MGJR:{
    domain: "mangajar",
    name: "MangaJar",
    type: "manga",
    simpleGenreSelect: true,
    defaultSort: "Popularity (popular first)"
  },
  NIAD:{
    domain: "niadd",
    name: "Niadd (Partially working)",
    type: "manga",
    simpleGenreSelect: false,
    defaultSort: "no-sort"
  }
};

router.post("/dashboardItems", async (req, res) => {
  const src = req.body.src;
  switch(src){
    case "MGJR":
      mangaJarObj.getDashboardItems().then(data =>{
        res.send(data);
      })
      break;
    case "NIAD":
      niaddObj.getDashboardItems().then(data =>{
        res.send(data);
      })
      break;
    default:
      res.send("Incorrect Source")
      break;
  }
});

router.post("/getImageList", async (req, res) => {
  let url = req.body.url;
  if (url.indexOf("mangajar") !== -1) {
    mangaJarObj.getImageList(url).then((data) => {
      res.send(data);
    });
  }else if(url.indexOf("nineanime") !== -1 || url.indexOf("gardenmanage") !== -1 ){
    niaddObj.getImageList(url).then((data) => {
      res.send(data);
    });
  }
  else {
    res.send({ message: "error" });
  }
});

router.post("/getMangaList", (req, res) => {
  // Gets manga list according to params and source
  let pageNo = req.body.page;
  switch (req.body.src) {
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
  // } else {
  //   autoCompleteObj.autoCompleteComic(req.body.title).then((data) => {
  //     res.send(data);
  //   });
  }
});

router.post("/search", (req, res) => {
  let title = req.body.title;
  let maxItem = req.body.maxItems | 20;
  // let maxComicItem = req.body.maxItems | 20;
  if (req.body.type === "manga") {
    {
      mangaJarObj.search(maxItem,title,[]).then((data)=>{
        // console.log(data)
        niaddObj.search(maxItem,title,data).then((data)=>{
          res.send({ searchArray: data });
        });
      })
    }
  } else if (req.body.type === "comic") {
    console.log("TBD")
  } else {
    res.send({ searchArray: "error" });
  }
});


router.post("/getLatestChapterIndex", (req, res) => {
  // console.log(req.body)
  switch (req.body.src) {
    case "MGJR":
      mangaJarObj.getLatestChapterIndex(req.body.link).then((resp) => {
        res.send({result:resp});
      });
      break;
    case "NIAD":
      niaddObj.getLatestChapterIndex(req.body.link).then((resp) => {
        res.send({result:resp});
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
  if (url.indexOf("mangajar") !== -1) {
    mangaJarObj.getMangaInfo(url).then((data) => {
      res.send(data);
    });
  }
  else if(url.indexOf("niadd") !== -1){
    niaddObj.getMangaInfo(url).then((data) => {
      res.send(data);
    });
  } 
});

router.post("/getGenres", (req, res) => {
  switch (req.body.src) {
    case "MGJR":
      mangaJarObj.getGenre().then((data) => {
        res.send(data);
      });
      break;
    case "NIAD":
      niaddObj.getGenre().then((data) => {
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
    case "MGJR":
      mangaJarObj.getGenreManga(req.body.genreArray, req.body.page, req.body.sort).then((data) => {
        res.send(data);
      });
      break;
    case "NIAD":
      niaddObj.getGenreManga(req.body.genreArray, req.body.page, req.body.sort).then((data) => {
        res.send(data);
      });
      break;
    default:
      res.send({ message: "error" });
      break;
  }
});

// router.post("/errorFixer", (req, res) => {
//   switch (req.body.src) {
//     case  "MGJR":
//       if(req.body.fix === "linkFix"){
//         mangaJarObj.getLinkFromName(req.body.name)
//         .then((data)=>{
//           res.send(data);
//         })
//       }
//       break;
//     default:
//       res.send({ message: "error" });
//       break;
//   };
// });

router.get("/sourceList", (req, res) => {
  res.send(sourcesOBJ);
});


module.exports = router;
