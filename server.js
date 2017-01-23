var express = require('express');
var session = require('express-session');
var bodyParser = require('body-parser');
var app = express();

app.set('views', __dirname + '/views');
app.engine('html', require('ejs').renderFile);

app.use(session({secret : "hanabhadjosh"
                }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

var sess;
var mysql = require('mysql');
var connection = mysql.createConnection({
    host    : 't-02-a.ameyah.com',
    user    : 'stockit1',
    password: 'orchard',
    database: 'stockit'
});

connection.connect();

app.get('/', function (req, res) {
    sess = req.session;
    if (sess.username) {
        res.redirect('/dashboard');
    } else {
        res.render('index.html');
    }
    
});

app.post('/login', function (req, res) {
    var username = req.body.username, password = req.body.password, query = 'SELECT COUNT(*) as rowsCount from users where username = "' + username + '" and password = "' + password + '"';
    connection.query(query, function (err, rows, fields) {
        if (!err) {
            if (rows[0].rowsCount === 1) {
                sess = req.session;
                sess.username = username;
                res.redirect('/dashboard');
            } else {
                res.redirect('/');
            }
        } else {
            console.log(err);
        }
    });
    
});


app.post('/signup', function (req, res) {
    var username = req.body.username, password = req.body.password, email = req.body.email, query = 'INSERT into users values("' + username + '","' + password + '","' + email + '")';
    connection.query(query, function (err, query_res) {
        if (err) {
            console.log(err);
        } else {
            sess = req.session;
            sess.username = username;
            res.redirect('/dashboard');
        }    
    });
});

app.get('/dashboard', function (req, res) {
    sess = req.session;
    if (sess.username) {
        res.render('dashboard.html');
    } else {
        res.end('login first');
    }
});

app.get('/logout', function (req, res) {
    req.session.destroy(function(err) {
        if (err) {
            console.log(err);
        } else {
            res.redirect('/');
        }
    });
});


app.get('/getholdings', function (req, res) {
    sess = req.session;
    if(sess.username) {
        var holdingsQuery = "select * from stocksheld where username = '" + sess.username + "'";
        connection.query(holdingsQuery,
            function(err,query_res){
                if(err){
                    console.log(err);
                }
                else{
                    console.log(query_res);
                    res.writeHead(200, {
                        'Content-Type' : 'x-application/json'
                    });
                    res.end(JSON.stringify(query_res));
                }
            });
    }
});

/*
app.post('/buy', function (req, res) {
    //sess = req.session;
    var username1 = "sid", symbol = "AAPL", rate = 60, count = 2, companyName = "Apple Inc.";
    var querycheck = 'Select count(*) as rowcount from stocksheld where username = "' + username1 + '" AND symbol = "' + symbol + '"', updateflag = false, insertflag = false;
    var queryupdate = 'update stocksheld set count = count + ' + count + ', spent = spent + ' + rate * count + 'where username = "' + username1 + '" AND symbol = "' + symbol + '"';
    var queryinsert = 'insert into stocksheld values ("' + username1 + '","' + symbol + '","' + companyName + '",' + count + ',' + (count * rate) + ')';
    connection.query(querycheck, function (err, rows, fields) {
        if (!err) {
            if (rows[0].rowcount === 1) {
                updateflag = true;
            } else if (rows[0].rowcount === 0) {
                insertflag = true;
            }
        } else {
            console.log(err);
        }
    });
    if (updateflag) {
        connection.query(queryupdate, function (err, rows, fields) {
            if (err) {
                console.log(err);
            }
        });
    } else if(insertflag) {
        connection.query(queryinsert, function (err, rows, fields) {
            if (err) {
                console.log(err);
            }
        });
    }
});
*/

app.post('/buy',function(req,res){
    sess = req.session;
    if(sess.username){
        var username = sess.username;
        var symbol = sess.body.symbol;
        var rate = sess.body.rate;
        var count = sess.body.count;
        var balance;
        var jsonResponse;
        queryGetBalance = 'SELECT balance from users where username = "' + username + '"';
        connection.query(queryGetBalance,
                        function(err,rows,fields){
                            if(!err){
                                balance = rows[0].balance;
                                if(balance < rate*count){
                                    jsonResponse = {
                                        "success":false,
                                        "message":"insufficientBalance"
                                    };
                                }
                                else{
                                    jsonResponse = {
                                        "success":true,
                                    };
                                    queryUpdateBalance = 'UPDATE users SET balance = balance - ' + (rate*count) + 'where username = "' + username + '"';
                                    queryInsertOrUpdateStockheld = 'INSERT into stockheld values ("' + username + '"' + ',"' + symbol + '",' + count + ',' + (rate*count) + ')';
                                    connection.query(queryUpdateBalance,function(err,query_res){
                                        if(err){
                                            console.log(err);
                                        }
                                    });
                                    connection.query(queryInsertOrUpdateStockheld,function(err,query_res){
                                        if(err){
                                            console.log(err);
                                        }
                                    });
                                }
                                res.jsonp(jsonResponse);
                            }
                            else{
                                console.log(err);
                            }
            
        });
    }
    else{
        console.log('No username')
    }
});

app.get('*.css|*.js', function (req, res) {
    var filename = req.url.replace(/^.*[\\\/]/, '');
    res.sendFile(__dirname + '/views/' + filename);
});

app.listen(4001, function () {
    console.log('started on port 4000');
});