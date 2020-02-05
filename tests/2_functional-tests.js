/*
*
*
*       FILL IN EACH FUNCTIONAL TEST BELOW COMPLETELY
*       -----[Keep the tests in the same order!]-----
*       (if additional are added, keep them at the very end!)
*/

var chaiHttp = require('chai-http');
var chai = require('chai');
var assert = chai.assert;
var server = require('../server');

chai.use(chaiHttp);

suite('Functional Tests', function() {
    
    suite('GET /api/stock-prices => stockData object', function() {
      
      test('1 stock', function(done) {
       chai.request(server)
        .get('/api/stock-prices')
        .query({stock: 'goog'})
        .end(function(err, res){
         assert.isObject(res.body);
         assert.equal(res.body.stockData[0].stock,"GOOG");
         assert.isNumber(res.body.stockData[0].price);
         assert.isNumber(res.body.stockData[0].likes);
         
          //complete this one too
          
          done();
        });
      });
      
      test('1 stock with like', function(done) {
        chai.request(server)
        .get('/api/stock-prices')
        .query({stock: 'goog',like:true})
        .end(function(err, res){
         assert.isObject(res.body);
         assert.equal(res.body.stockData[0].stock,"GOOG");
         assert.isNumber(res.body.stockData[0].price);
         assert.isNumber(res.body.stockData[0].likes);
         assert.isAbove(res.body.stockData[0].likes,0);
          
          done();
        });
      });
      
      test('1 stock with like again (ensure likes arent double counted)', function(done) {
        chai.request(server)
        .get('/api/stock-prices')
        .query({stock: 'goog',like:true})
        .end(function(err, res){
         var oldlikes = res.body.stockData[0].likes;
          
          chai.request(server)
        .get('/api/stock-prices')
        .query({stock: 'goog',like:true})
        .end(function(err, res){
         assert.isObject(res.body);
         assert.equal(res.body.stockData[0].stock,"GOOG");
         assert.isNumber(res.body.stockData[0].price);
         assert.isNumber(res.body.stockData[0].likes);
         assert.equal(res.body.stockData[0].likes,oldlikes);
            
          
          done();
        });
        });
        
      });
      
      test('2 stocks', function(done) {
        chai.request(server)
        .get('/api/stock-prices')
        .query({stock: ['goog','msft']})
        .end(function(err, res){
         assert.isObject(res.body);
          res.body.stockData.sort((a, b) => (a.stock > b.stock) ? 1 : -1);
          assert.include(res.body.stockData[0],{stock:"GOOG"});
          assert.property(res.body.stockData[0],"price");
          assert.property(res.body.stockData[0],"rel_likes");
          assert.include(res.body.stockData[1],{stock:"MSFT"});
          assert.property(res.body.stockData[1],"price");
          assert.property(res.body.stockData[1],"rel_likes");
          
          done();
        });
      });
      
      test('2 stocks with like', function(done) {
        chai.request(server)
        .get('/api/stock-prices')
        .query({stock: ['goog','msft'],like:true})
        .end(function(err, res){
         assert.isObject(res.body);
          res.body.stockData.sort((a, b) => (a.stock > b.stock) ? 1 : -1);
          assert.include(res.body.stockData[0],{stock:"GOOG"});
          assert.property(res.body.stockData[0],"price");
          assert.property(res.body.stockData[0],"rel_likes");
          assert.include(res.body.stockData[1],{stock:"MSFT"});
          assert.property(res.body.stockData[1],"price");
          assert.property(res.body.stockData[1],"rel_likes");
          
          done();
        });
      });
      
    });

});
