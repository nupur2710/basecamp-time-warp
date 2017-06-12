var express = require('express');
var app = express();


var querystring = require('querystring');
var https = require('https');
var to_json = require('xmljson').to_json;
var request = require('request'),
    url = 'https://paperplane.basecamphq.com',
    verificationCode,
    accessToken,
    auth = "";

//put this to make the cross origin from angular to node work
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});



app.get("/auth/basecamp", function(req, res, next) {
    verificationCode = req.query.code;
    console.log("my code is " + verificationCode);


    // prod link "https://launchpad.37signals.com/authorization/token?type=web_server&client_id=d119a53aed7fabe1407f1e34f7f29053da10b3bd&redirect_uri=http%3A%2F%2F192.168.0.175%3A3001%2F%2Fauth%2Fbasecamp&client_secret=04241c29abfcfce82686bd384e8585b722abd14e&code=" 

    //local link https://launchpad.37signals.com/authorization/token?type=web_server&client_id=f580e2bd7a470f2bade0a2670696e1c3edb7b7d1&redirect_uri=http%3A%2F%2F127.0.0.1%3A3001%2Fauth%2Fbasecamp&client_secret=67090f417bb8ef3d26f9aab9529e394539984f5d&code=

    request.post({
        url: "https://launchpad.37signals.com/authorization/token?type=web_server&client_id=f580e2bd7a470f2bade0a2670696e1c3edb7b7d1&redirect_uri=http%3A%2F%2F127.0.0.1%3A3001%2Fauth%2Fbasecamp&client_secret=67090f417bb8ef3d26f9aab9529e394539984f5d&code=" + verificationCode,

    }, function(error, response, body) {
        accessToken = JSON.parse(body).access_token;
        console.log("token is " + accessToken);
        console.log("success");

        // prod link http://192.168.0.175:8010/timewrap/tasks?accessToken=

        //local link http://127.0.0.1:4200/timewarp?accessToken=
        return res.redirect('http://127.0.0.1:4200/tasks?accessToken=' + accessToken);
    });

});

app.get("/message", function(req, res) {
    res.json({ "message": "success" });
});



app.get('/todoLists', function(req, res) {
    request({
        url: url + '/todo_lists.xml',
        headers: {
            "Authorization": "Bearer " + req.query.accessToken
        }
    }, function(error, response, body) {
        to_json(body, function(error, data) {
            res.json(data);
        });

    });
});

app.get('/me', function(req, res) {
    request({
        url: url + '/me.xml',
        headers: {
            "Authorization": "Bearer " + req.query.accessToken
        }
    }, function(error, response, body) {
        to_json(body, function(error, data) {
            res.json(data);
        });

    });
});

app.get('/rss', function(req, res) {
    request({
        url: url + '/feed/recent_items_rss',
       headers: {
            "Authorization": "Bearer " + req.query.accessToken
        }
    }, function(error, response, body) {
        to_json(body, function(error, data) {
            res.json(data);
        });

    });
});

app.listen(3001);
console.log("listening on localhost 3001");