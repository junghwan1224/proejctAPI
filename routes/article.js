var express = require("express");
var router = express.Router();

const Article = require("../models").article;
/* GET users listing. */

router.get("/list", function(req, res, next) {
  // Get list of items
  Article.findAll({
    where: { type: req.query.type },
    limit: parseInt(req.query.size),
    attributes: ["title", "date", "id"]
  })
    .then(article => {
      res.status(200).send(article);
    })
    .catch(error => {
      console.log(error);
      res.status(400).send(error);
    });
});

router.get("/read", function(req, res, next) {
  Article.findByPk(req.query.id, {
    attributes: ["title", "date", "contents"]
  })
    .then(article => {
      res.status(200).send(article);
    })
    .catch(error => {
      console.log(error);
      res.status(400).send(error);
    });
});

router.post("/create", function(req, res, next) {
  // SECURITY WARNING :: Need to be updated in near future //
  console.log(req.body);
  Article.create({
    type: req.body.type,
    title: req.body.title,
    date: req.body.date,
    contents: req.body.contents,
    attachment: req.body.attachment
  })
    .then(article => res.status(201).send(article))
    .catch(error => {
      console.log(error);
      res.status(400).send(error);
    });
});

module.exports = router;
