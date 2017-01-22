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
connection.query('SELECT * from users',
                function(err, rows, fields){
                    if(!err){
                        console.log(rows);
                    }
                    else{
                        console.log("error!!!!!!");
                    }
    
});


app.get('/',function(req,res){
    sess = req.session;
    if(sess.email){
        res.redirect('/dashboard');
    }
    else{
        res.render('index.html');
    }
    
});

app.post('/login',function(req,res){
    console.log(req);
    sess = req.session;
    sess.email = req.body.email;
    res.end('done');
});

app.get('/dashboard', function(req,res){
    sess = req.session;
    if(sess.email){
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
