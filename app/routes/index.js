'use strict';
var request = require('request');

// NOTE: for development
// var fs = require('fs');
// NOTE: end dev

var ClickHandler = require(process.cwd() + '/app/controllers/clickHandler.server.js');

module.exports = function(app, db) {
    var clickHandler = new ClickHandler(db);

    app.route('/')
        .get(function(req, res) {
            res.sendFile(process.cwd() + '/public/index.html');
        });

    app.route('/api/recent')
        .get(function(req, res) {
            var isal = db.collection('isal');
            var retArr = [];
            isal.find().sort({_id:-1}).limit(10).toArray(function(err, docs){
              // console.log('getting docs ');
              // console.log(docs);
              docs.forEach(function(item, index, arr){
                var obj = {};
                obj.data = item.date;
                obj.search = item.search;
                retArr.push(obj);
              });
              res.send(retArr);
            });
        });

    app.route('/api/google/:val')
        .get(function(req, res) {
            var value = req.params.val,
                offset;
            if (req.query.offset === undefined) {
                offset = 10;
            } else {
                offset = req.query.offset;
                if (offset > 10) {
                    offset = 10;
                }
            }

            var cred = process.env.GKEY;
            var cx = process.env.GCX;

            var url = 'https://www.googleapis.com/customsearch/v1?key=' + cred + '&cx=' + cx;
                url += '&num=' + offset + '&searchType=image&imgType=photo&q=' + value;

            console.log(url);

            // NOTE: this is a dummy file for development
            // var url = 'http://localhost:3000';
            // NOTE: end dev

            request(url, function(error, response, body){
              // console.log('error: ');
              // console.log(error);
              // console.log('res: ');
              // console.log(response);
              // console.log('body: ');
              // console.log(body);

              // NOTE: this is a dummy file for development
              // var body = fs.readFileSync('test.json').toString();
              // NOTE: end dev

              if (!error && response.statusCode == 200) {
                var data = JSON.parse(body);
                var items = data.items;
                var retArr = [];
                data.items.forEach(function(item, index, arr) {
                    var retObj = {};
                    // console.log(item);
                    retObj.url = item.link;
                    retObj.snippet = item.snippet;
                    retObj.thumbnail = item.image.thumbnailLink
                    retObj.context = item.image.contextLink;
                    retArr.push(retObj);
                });

                res.send(retArr);

                addToDb(db, value);
              } else {
                res.send(error[0]);
              }
            });
        });

    app.route('/api/clicks')
        .get(clickHandler.getClicks)
        .post(clickHandler.addClick)
        .delete(clickHandler.resetClicks);
};

function addToDb(db, search) {
    var dbObj = {
        'date': new Date(),
        'search': search
    };
    var isal = db.collection('isal');
    //  isal.drop();
    if (isal) {
        console.log('isal found');
        // add search record
        isal.insert(dbObj, function(err, data) {
            if (err) {
                throw err;
            }
            console.log('inserted data: ');
            console.log(data);
        });

    }
}
