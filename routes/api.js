/*
 *
 *
 *       Complete the API routing below
 *
 *
 */

"use strict";

var expect = require("chai").expect;
var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
var MongoClient = require("mongodb").MongoClient;
var flatten = require("arr-flatten");
var requestIp = require("request-ip");

const CONNECTION_STRING = process.env.DB; //MongoClient.connect(CONNECTION_STRING, function(err, db) {});

//  https://repeated-alpaca.glitch.me/v1/stock/[symbol]/quote

module.exports = function(app) {
  MongoClient.connect(CONNECTION_STRING, function(err, client) {
    var dbo = client.db("stockprice");
    var db = dbo.collection("stockprice");

    app.route("/api/stock-prices").get(function(req, res, next) {
      var stockRequest = [req.query.stock];
      stockRequest = flatten(stockRequest);
      var completed_requests = 0;
      var responses = [];

      function getStock(stock) {
        var xhttp = new XMLHttpRequest();

        xhttp.onreadystatechange = function() {
          if (this.readyState == 4 && this.status == 200) {
            var cb = JSON.parse(this.responseText);
            var stockData = {
              stock: cb.symbol,
              price: cb.latestPrice
            };

            getLikes(stockData);
          }
        };
        xhttp.open(
          "GET",
          "https://repeated-alpaca.glitch.me/v1/stock/" + stock + "/quote",
          true
        );
        xhttp.responseType = "json";
        xhttp.send();
      }

      for (let i in stockRequest) {
        getStock(stockRequest[i]);
      }

      function getLikes(stockData) {
        db.findOne({ stock: stockData.stock }, function(err, cb) {
          const clientIp = requestIp.getClientIp(req);

          if (cb == null && req.query.like || (req.query.like && !cb.ip.includes(clientIp))) {
            db.findOneAndUpdate(
              { stock: stockData.stock },
              { $inc: { likes: 1 }, $push: { ip: clientIp } },
              { upsert: true, projection: { likes: 1 }, returnOriginal: false },
              function(err, result) {
                stockData.likes = result.value.likes || result.likes;
                end(stockData);
              }
            );
          } else {
            stockData.likes =(cb==null)? 0 : cb.likes;
            end(stockData);
          }
          function end(stockData) {
            responses.push(stockData);
            completed_requests++;

            if (completed_requests == stockRequest.length) {
              // All download done, process responses array
              req.responses=responses;
              next();
            }
          }
        });
      }
    });

    app.use(function(req, res) {
      var stockData = req.responses;
      if (stockData.length>1){
        var difference = stockData[0].likes-stockData[1].likes;
        /*
        for (let stock of stockData) {console.log(stock)
          stock.rel_likes=difference;
          delete stock.likes;
}
        */
        stockData[0].rel_likes=difference;
        delete stockData[0].likes;
        delete stockData[1].likes
        stockData[1].rel_likes=-difference;
      }
      res.send({stockData:stockData})
    });

    app.use(function(req, res, next) {
      res
        .status(404)
        .type("text")
        .send("Not Found");
    });
  });
};
