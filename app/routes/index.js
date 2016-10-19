'use strict';
var request = require('request');

// NOTE: for development
var fs = require('fs');
// var file = process.argv[2];
// console.log(file);
// var array = fs.readFileSync(file).toString().split("\n");
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
            // TODO: put these as environment variables and remove
            var cred = 'AIzaSyBAbb5Esk6Dpg6_au2bYBQVhL67nRn6kb8';
            var cx = '002785040496228234675:1jidhseq0ay';

            // var url = 'https://www.googleapis.com/customsearch/v1?key=' + cred + '&cx=' + cx + '&q=' + value + ' image';
            var url = 'https://www.googleapis.com/customsearch/v1?key=' + cred + '&cx=' + cx + '&num=' + offset + '&searchType=image&imgType=photo&q=' + value;
            // var url = 'https://www.googleapis.com/customsearch/v1?key=AIzaSyBAbb5Esk6Dpg6_au2bYBQVhL67nRn6kb8&cx=017576662512468239146:omuauf_lfve&q=' + value;
            console.log(url);

            // NOTE: this is a dummy file for defelopment
            // remove for production
            // example object
            // "url": "http://www.wallpapersxl.com/wallpapers/1500x2548/rum/181862/rum-zaya-181862.4.jpg",
            // "snippet": "Wallpapers Rum Zaya .4 ...",
            // "thumbnail": "https://encrypted-tbn1.gstatic.com/images?q=tbn:ANd9GcS2tMLh9AdrPh3fmGheoYCCG35gCBImnqkt4_9UbJMMy-RTJUDadGV1mTVw",
            // "context": "http://www.wallpapersxl.com/wallpaper/1500x2548/rum-zaya-181862.4.html"
            var test = {
                "kind": "customsearch#result",
                "title": "turning heads with dogs and humans - Speech Communication Lab",
                "htmlTitle": "turning heads with <b>dogs</b> and humans - Speech Communication Lab",
                "link": "https://sites.google.com/site/speechskscott/_/rsrc/1418660069272/SpeakingOut/turningheadswithdogsandhumans/dog6.jpg",
                "displayLink": "sites.google.com",
                "snippet": "some dogs (image from ...",
                "htmlSnippet": "some <b>dogs</b> (image from ...",
                "mime": "image/jpeg",
                "image": {
                    "contextLink": "https://sites.google.com/site/speechskscott/SpeakingOut/turningheadswithdogsandhumans",
                    "height": 1080,
                    "width": 1920,
                    "byteSize": 262651,
                    "thumbnailLink": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSVjoay465y9pJ9wXslsYgsFGKxdHGijeT105FlBaO46lIcCsF3W8lc84hY",
                    "thumbnailHeight": 84,
                    "thumbnailWidth": 150
                }

            }
            var body = fs.readFileSync('test.json').toString();
            // console.log(body);

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
            // console.log('items count: ' + data.items.length);
            res.send(retArr);
            // NOTE: end dev

            // request(url, function(error, response, body){
            //   // console.log('error: ');
            //   // console.log(error);
            //   // console.log('res: ');
            //   // console.log(response);
            //   // console.log('body: ');
            //   // console.log(body);
            //   if (!error && response.statusCode == 200) {
            //     res.send(JSON.parse(body));
            addToDb(db, value);
            //   } else {
            //     res.send(error[0]);
            //   }
            // });
        });

    app.route('/api/search/:val')
        .get(function(req, res) {
            var value = req.params.val,
                offset;
            if (req.query.offset === undefined) {
                offset = 15;
            } else {
                offset = req.query.offset;
            }
            console.log('offset: ' + req.query.offset);
            // console.log('value: ');
            // console.log(value);

            var url = 'https://en.wikipedia.org/w/api.php?action=query&format=json&prop=images&titles=' + value + '&imlimit=' + offset;
            console.log(url);
            request(url, function(error, response, body) {
                // console.log(error);
                // console.log(response);
                // console.log(JSON.parse(body));
                if (!error && response.statusCode == 200) {
                    var myObj = JSON.parse(body);
                    var keys = Object.keys(myObj.query.pages);
                    var images = [],
                        tmp = [],
                        tmp2;
                    myObj.query.pages[keys].images.forEach(function(item, key, arr) {
                        // console.log(item.title);
                        images.push(item.title);
                    })

                    var base = 'https://en.wikipedia.org/w/api.php?';
                    var action = 'action=query&';
                    var format = 'format=json&';
                    var prop = 'prop=imageinfo&';
                    var data = images.join('|');
                    var end = 'iiprop=url&iiurlwidth=220'

                    var url = base + action + format + prop + 'titles=' + encodeURIComponent(data) + '&' + end;
                    console.log(url);

                    request(url, function(error, response, body) {
                            //  console.log(error);
                            //  console.log(response);
                            //  console.log(body);
                            if (!error && response.statusCode == 200) {
                                var myObj2 = JSON.parse(body);
                                console.log(Object.keys(myObj2.query.pages));
                                //  var keys2 = Object.keys(myObj2.query.pages);
                                //  var images = [];
                                //  myObj.query.pages[keys].images.forEach(function(item, key, arr){
                                //    console.log(item.title);https://en.wikipedia.org/w/api.php?action=query&format=json&prop=imageinfo&titles=File%3ADisambig+gray.svg%3AFile%3APadlock-silver.svg&iiprop=url&iiurlwidth=220

                                //    images.push(item.title);
                                //  })
                                // TODO: use the images array to make the next query
                                // res.send(myObj.query.pages[keys].images)
                                //  res.send(myObj2);
                                res.send(myObj2);
                            } else {
                                res.send(error);
                            }
                        })
                        // TODO: use the images array to make the next query
                        // res.send(myObj.query.pages[keys].images)
                        // res.send(images);
                }
            })
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
