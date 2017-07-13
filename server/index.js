// please use a linter - with good linting rules
var express = require('express');
var app = express();


var querystring = require('querystring');
var jsonxml = require('jsontoxml');

var to_json = require('xmljson').to_json;
// one variable on one line
var request = require('request'), 
    url = 'https://paperplane.basecamphq.com',
    verificationCode,
    accessToken,
    auth = "";

// const low = require('lowdb');
// const fileAsync = require('lowdb/lib/storages/file-async');


// Start database using file-async storage
// For ease of use, read is synchronous
// const db = low('db.json', {
//     storage: fileAsync
// });

//put this to make the cross origin from angular to node work
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

// app.post('/posts', (req, res) => {
//     db.get('posts')
//         .push(req.body)
//         .last()
//         .assign({ id: Date.now() })
//         .write()
//         .then(post => res.send(post))
// });


// app.get('/posts/:id', (req, res) => {
//     const post = db.get('posts')
//         .find({ id: req.params.id })
//         .value()

//     res.send(post)
// });

app.get("/auth/basecamp", function(req, res, next) {
    verificationCode = req.query.code;
    console.log("my code is " + verificationCode); // always make it a point to remove logs when deploying - use a logging library to supress unnecessary loglines on prod

    // prod link "https://launchpad.37signals.com/authorization/token?type=web_server&client_id=d119a53aed7fabe1407f1e34f7f29053da10b3bd&redirect_uri=http%3A%2F%2F192.168.0.175%3A3001%2F%2Fauth%2Fbasecamp&client_secret=04241c29abfcfce82686bd384e8585b722abd14e&code=" 
    // use process.env to get links instead of hardcoding
    //local link https://launchpad.37signals.com/authorization/token?type=web_server&client_id=f580e2bd7a470f2bade0a2670696e1c3edb7b7d1&redirect_uri=http%3A%2F%2F127.0.0.1%3A3001%2Fauth%2Fbasecamp&client_secret=67090f417bb8ef3d26f9aab9529e394539984f5d&code=

    request.post({
        url: "https://launchpad.37signals.com/authorization/token?type=web_server&client_id=f580e2bd7a470f2bade0a2670696e1c3edb7b7d1&redirect_uri=http%3A%2F%2F127.0.0.1%3A3001%2Fauth%2Fbasecamp&client_secret=67090f417bb8ef3d26f9aab9529e394539984f5d&code=" + verificationCode, // all codes in config file and shouldn't be checked in

    }, function(error, response, body) {
        console.log(body);
        accessToken = JSON.parse(body).access_token;
        console.log("token is " + accessToken);



        // db.get('posts')
        //     .push(accessToken)
        //     .last()
        //     .assign({ id: Date.now() })
        //     .write()
        //     .then(post => res.redirect('http://127.0.0.1:4200/tasks?accessToken=' + accessToken));

        // prod link http://192.168.0.175:8010/tasks?accessToken=

        //local link http://127.0.0.1:4200/tasks?accessToken=
        return res.redirect('http://127.0.0.1:4200/tasks?accessToken=' + accessToken); // alternate way is to configure basecamp redirect uri to localhost (angular app) and then use server calls - this is safer as access token is not in query string (only code is)
    });

});

//demo request
app.get("/message", function(req, res) {
    res.json({ "message": "success" });
});


//get all the todos assigned to the user
app.get('/todoLists', function(req, res) {
    request({
        url: url + '/todo_lists.xml', // use template literals instead of string concat
        headers: {
            "Authorization": "Bearer " + req.query.accessToken // you can configure the request library to do this automatically
        }
    }, function(error, response, body) {
        // error handling?
        to_json(body, function(error, data) {
            res.json(data);
        });

    });
});

//get the details of the logged in user
app.get('/me', function(req, res) {
    request({
        url: url + '/me.xml',
        headers: {
            "Authorization": "Bearer " + req.query.accessToken
        }
    }, function(error, response, body) {
        // error handling? always handle error cases - else we'll have a hung request
        to_json(body, function(error, data) {
            res.json(data);
        });

    });
});

//get the time entries corresponding to a single todo item
app.get('/todoItems/timeEntries', function(req, res) {
    request({
        url: url + '/todo_items/' + req.query.itemId + '/time_entries.xml',
        headers: {
            "Authorization": "Bearer " + req.query.accessToken
        }
    }, function(error, response, body) {
        to_json(body, function(error, data) {
            res.json(data);
        });

    });
});

//post time entry on a todo item
app.get('/todoItems/makeTimeEntries', function(req, res) {
    if (req.query.data) {
        var data = jsonxml(req.query.data);
        request.post({
            url: url + '/todo_items/' + req.query.itemId + '/time_entries.xml',
            headers: {
                "Authorization": "Bearer " + req.query.accessToken,
                "Content-Type": "application/xml"
            },
            body: data
        }, function(error, response, body) {
            if (!error) {
                res.json({ "message": "success" })
            }
        });
    }

});

//get the comments corresponding to a single todo item
app.get('/todoItems/comments', function(req, res) {
    request({
        url: url + '/todo_items/' + req.query.itemId + '/comments.xml',
        headers: {
            "Authorization": "Bearer " + req.query.accessToken
        }
    }, function(error, response, body) {
        to_json(body, function(error, data) {
            res.json(data);
        });
    });
});

// db.defaults({ posts: [] })
//     .write()
//     .then(() => {
//         app.listen(3001, () => console.log('Server is listening'));
//     });


app.listen(3001);
console.log("listening on localhost 3001");