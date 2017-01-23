var express = require('express');
var session = require('express-session');
var bodyParser = require('body-parser');
var app = express();

app.set('views', __dirname + '/views');
app.engine('html',require('ejs').renderFile);

app.use(session({secret : "hanabhadjosh"
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));

var sess;


var mysql = require('mysql');
var connection = mysql.createConnection({
    host    :'t-02-a.ameyah.com',
    user    :'stockit1',
    password:'orchard',
    database:'stockit'
});

connection.connect();


app.get('/',function(req,res){
    sess = req.session;
    if(sess.username){
        res.redirect('/dashboard');
    }
    else{
        res.render('index.html');
    }
    
});

app.post('/login',function(req,res){
    var username = req.body.username;
    var password = req.body.password;
    var query = 'SELECT COUNT(*) as rowsCount from users where username = "' + username + '" and password = "' + password + '"';
    
    connection.query(query,
            function(err, rows, fields){
                if(!err){
                    if(rows[0].rowsCount == 1){
                        sess = req.session;
                        sess.username = username;
                        res.redirect('/dashboard');    
                    }
                    else{
                        res.redirect('/')
                    }
                }
                else{
                    console.log(err);
                }
    
    });
    
});

app.post('/signup',function(req,res){
    var username = req.body.username;
    var password = req.body.password;
    var email = req.body.email;
    var query = 'INSERT into users values("' +username + '","' + password + '","' + email +'")';
    connection.query(query,
                    function(err,query_res){
        if(err){
            console.log(err);
        }
        else{
            sess = req.session;
            sess.username = username;
            res.redirect('/dashboard');    
        }    
    });
    
});

app.get('/dashboard', function(req,res){
    sess = req.session;
    if(sess.username){
        res.render('dashboard.html');
        
    }
    else{
        res.end('login first');
    }
});

app.get('/logout',function(req,res){
    req.session.destroy(function(err){
        if(err){
            console.log(err);
        }
        else{
            res.redirect('/');
        }
    });
});

app.get('*.css|*.js', function(req, res) {
    var filename = req.url.replace(/^.*[\\\/]/, '')
    res.sendFile(__dirname + '/views/' + filename);
})

app.listen(4000,function(){
    console.log('started on port 4000');
});
