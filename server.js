var express = require('express');
var session = require('express-session');
var bodyParser = require('body-parser');
var app = express();
var fs = require('fs');

app.set('views', __dirname + '/views');
app.engine('html', require('ejs').renderFile);

app.use(session({
    secret: "hanabhadjosh"
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

var sess;
var mysql = require('mysql');
var connection = mysql.createConnection({
    host: 't-02-a.ameyah.com',
    user: 'stockit1',
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
        var getBalanceQuery = "SELECT balance from users WHERE username = '" + sess.username + "'";
        connection.query(getBalanceQuery, function (err, query_res) {
            if (err) {
                console.log(err);
            } else {
                var template = fs.readFileSync('views/dashboard.html');
                template = template.toString();
                template = template.replace("{{username}}", sess.username);
                template = template.replace("{{balance}}", query_res[0].balance);
                res.write(template);
                res.end()
            }
        });

    } else {
        res.redirect('/');
    }
});

app.get('/logout', function (req, res) {
    req.session.destroy(function (err) {
        if (err) {
            console.log(err);
        } else {
            res.redirect('/');
        }
    });
});


app.get('/getholdings', function (req, res) {
    sess = req.session;
    if (sess.username) {
        var holdingsQuery = "select * from stocksheld where username = '" + sess.username + "'";
        connection.query(holdingsQuery,
            function (err, query_res) {
                if (err) {
                    console.log(err);
                }
                else {
                    res.writeHead(200, {
                        'Content-Type': 'x-application/json'
                    });
                    res.end(JSON.stringify(query_res));
                }
            });
    }
});


app.post('/buy', function (req, res) {
    sess = req.session;
    if (sess.username) {
        var username = sess.username;
        var symbol = req.body.companySymbol;
        var rate = req.body.rate;
        var count = req.body.shares;
        var name = req.body.companyName;
        var balance;
        var jsonResponse;
        var queryGetBalance = 'SELECT balance from users where username = "' + username + '"';
        connection.query(queryGetBalance,
            function (err, rows, fields) {
                if (!err) {
                    balance = rows[0].balance;
                    if (balance < rate * count) {
                        jsonResponse = {
                            "success": false,
                            "message": "Your balance is insufficient to complete the transaction"
                        };
                    }
                    else {
                        jsonResponse = {
                            "success": true,
                            "balance": balance - (rate * count)
                        };
                        var queryUpdateBalance = 'UPDATE users SET balance = balance - ' + (rate * count) + ' where username = "' + username + '"';
                        var queryInsertOrUpdateStockheld = 'INSERT into stocksheld values ("' + username + '"' + ',"' + symbol + '","' + name + '",' + count + ',' + (rate * count) + ') ON ' +
                            'DUPLICATE KEY UPDATE count = count+' + count + ', spent = spent+' + (rate * count);
                        connection.query(queryUpdateBalance, function (err, query_res) {
                            if (err) {
                                console.log(err);
                            }
                        });
                        connection.query(queryInsertOrUpdateStockheld, function (err, query_res) {
                            if (err) {
                                console.log(err);
                            }
                        });
                    }
                    res.jsonp(jsonResponse);
                }
                else {
                    console.log(err);
                }

            });
    }
    else {
        console.log('No username')
    }
});

app.post('/buy', function (req, res) {
    sess = req.session;
    if (sess.username) {
        var username = sess.username;
        var symbol = req.body.companySymbol;
        var rate = req.body.rate;
        var count = req.body.shares;
        var name = req.body.companyName;
        var balance;
        var jsonResponse;
        var queryGetBalance = 'SELECT balance from users where username = "' + username + '"';
        connection.query(queryGetBalance,
            function (err, rows, fields) {
                if (!err) {
                    balance = rows[0].balance;
                    if (balance < rate * count) {
                        jsonResponse = {
                            "success": false,
                            "message": "insufficientBalance"
                        };
                    }
                    else {
                        jsonResponse = {
                            "success": true,
                            "balance": balance - (rate * count)
                        };
                        var queryUpdateBalance = 'UPDATE users SET balance = balance - ' + (rate * count) + ' where username = "' + username + '"';
                        var queryInsertOrUpdateStockheld = 'INSERT into stocksheld values ("' + username + '"' + ',"' + symbol + '","' + name + '",' + count + ',' + (rate * count) + ') ON ' +
                            'DUPLICATE KEY UPDATE count = count+' + count + ', spent = spent+' + (rate * count);
                        console.log(queryInsertOrUpdateStockheld);
                        connection.query(queryUpdateBalance, function (err, query_res) {
                            if (err) {
                                console.log(err);
                            }
                        });
                        connection.query(queryInsertOrUpdateStockheld, function (err, query_res) {
                            if (err) {
                                console.log(err);
                            }
                        });
                    }
                    res.jsonp(jsonResponse);
                }
                else {
                    console.log(err);
                }

            });
    }
    else {
        console.log('No username')
    }
});


app.post('/sell', function (req, res) {
    sess = req.session;
    if (sess.username) {
        var username = sess.username;
        var symbol = req.body.companySymbol;
        var rate = req.body.rate;
        var count = req.body.shares;
        var name = req.body.companyName;
        var balance;
        var sharesAvailable;
        var jsonResponse;
        var queryGetSharesAvailable = 'SELECT count from stocksheld where username = "' + username + '" and symbol = "' + symbol + '"';
        var queryGetBalance = 'SELECT balance from users where username = "' + username + '"';
        connection.query(queryGetBalance,
            function (err, rows, fields) {
                if (!err) {
                    balance = rows[0].balance;
                    connection.query(queryGetSharesAvailable,
                        function (err, rows, fields) {
                            if (!err) {
                                if(rows.length == 0){
                                    sharesAvailable = 0;
                                }
                                else{
                                    sharesAvailable = rows[0].count;
                                }
                                if (sharesAvailable < count) {
                                    jsonResponse = {
                                        "success": false,
                                        "message": "insufficientShares"
                                    };
                                }
                                else {
                                    

                                    jsonResponse = {
                                        "success": true,
                                        "balance": balance + (rate * count)
                                    };
                                    var queryUpdateBalance = 'UPDATE users SET balance = balance + ' + (rate * count) + ' where username = "' + username + '"';
                                    var queryUpdateStockheld = 'UPDATE stocksheld SET count = count - ' + count + ', spent = spent - ' + (rate * count) + ' where username = "' + username + '" and symbol = "' + symbol + '"';

                                    console.log(queryUpdateStockheld);
                                    connection.query(queryUpdateBalance, function (err, query_res) {
                                        if (err) {
                                            console.log(err);
                                        }
                                    });
                                    connection.query(queryUpdateStockheld, function (err, query_res) {
                                        if (err) {
                                            console.log(err);
                                        }
                                    });
                                }
                                res.jsonp(jsonResponse);
                            }
                            else {
                                console.log(err);
                            }

                        });
                }
                else{
                    console.log(err);
                }
        });
    }
    else {
        console.log('No username')
    }
});


app.get('*.css|*.js', function (req, res) {
    var filename = req.url.replace(/^.*[\\\/]/, '');
    res.sendFile(__dirname + '/views/' + filename);
});

app.listen(4000, function () {
    console.log('started on port 4000');
});