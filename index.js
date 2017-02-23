var express               = require('express'),
	mongoose              = require('mongoose'),
	bodyParser            = require('body-parser'),
	passport              = require('passport'),
	LocalStrategy         = require("passport-local"),
	passportLocalMongoose = require("passport-local-mongoose");

var app = express();

app.set('port', (process.env.PORT || 5000));
var server = require('http').Server(app); 
server.listen(5000, function(){
	console.log("port #" + 5000);   //change 5000 to process.env.PORT when it runs on Heroku
});

var io = require('socket.io')(server);

var mongooseOptions = { server: { socketOptions: { keepAlive: 1,
	connectTimeoutMS: 30000 }}, replset: { socketOptions: { keepAlive: 1, connectTimeoutMS: 30000 }}};

var mongodbURL = 'mongodb://127.0.0.1/db';

mongoose.connect(mongodbURL, mongooseOptions);

var conn = mongoose.connection;

conn.on('error', function(){
	console.error("MONGO ERROR!");
	console.error.bind(console, 'MongoDB connection error:');
});

conn.once('open', function() {
    console.log('MongoDB connection openned');
});

var OnlineChatters  = require('./models/onlineChatters'),
    ChatLog         = require('./models/chatLog'),
    articles        = require("./models/article"),
    classList       = require("./models/classlist"),
    studentList     = require("./models/studentlist"),
    teacherList     = require("./models/teacherlist"),
    contactbooks    = require("./models/contactbook"),
    User            = require("./models/user"),
    insideClassList = require("./models/insideClass");

var currentClass = "";
var currentClassId = "";
var currentTeacher = "undefined";
var currentAuth = "";
var date = new Date();

app.use(express.static(__dirname + '/public'));

// views is directory for all template files
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json()); 
app.use(require("express-session")({
    secret: "12345",
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


app.get('/', function(request, response) {
	articles.find({}, null, { sort:{_id: -1}}, function(err, allArticles){
        if(err){
            console.log(err);
        } else {
            // allArticles.sort(_id:-1);
            response.render('pages/index', {"article": allArticles, "currentUser": request.user});
        }
    });
});

app.get("/class",isLoggedIn, function(req, res){
    contactbooks.find({}, null, { sort:{_id: -1}}, function(err, contactbooks){
        if(err){
            console.log(err);
        } else {
            insideClassList.find({username:req.user.username}, function(err, insideClasslist) {
                if(err) {
                    console.log(err);
                } else {
                    studentList.update({username:req.user.username},
                    {$set:
                                {
                                    last_login: date.getFullYear()+"/"+(date.getMonth()+1)+"/"+date.getDate()
                                }
                            }, function(err, studentlist) {
                        if(err) {
                            console.log(err);
                        } else {
                            res.render("pages/class", {"contactbook": contactbooks,"currentUser": req.user,"insideClasslist": insideClasslist});
                        }
                    });
                     
                }
            });
           
        }
    });
});

app.get("/login", function(req, res){
    res.render("pages/login");
});

app.post("/login",passport.authenticate("local", {
    successRedirect: "/" ,
    failureRedirect: "/login"
}),function(req, res) {
});

app.get("/admin", function(req, res) {
   res.render("pages/admin"); 
});

app.post("/admin", passport.authenticate("local",{
    successRedirect: "/admin/auth" ,
    failureRedirect: "/admin"
}),function(req, res){
    
});

app.get("/admin/auth", function(req, res) {
   teacherList.find({}, function(err, teacherlist) {
       if(err) {
           console.log(err);
       } else {
           teacherlist.forEach(function(teacher){
               if(teacher.username == req.user.username) {
               currentTeacher = teacher.username;
               currentAuth = teacher.auth;
               res.redirect("/admin/post");
           } 
           });
           if(currentTeacher == "undefined"){
               req.logout();
                currentTeacher = "undefined";
                currentAuth = "";
               res.redirect("/admin");
           }
       }
   }); 
});

app.get("/admin/post",isAdminLoggedIn, function(req, res){
    articles.find({}, null, { sort:{_id: -1}}, function(err, allArticles){
        if(err){
            console.log(err);
        } else {
            res.render("pages/admin/post", {"allArticles": allArticles});
        }
    });
});

app.get("/admin/contactbook",isAdminLoggedIn, function(req, res){
    contactbooks.find({}, null, { sort:{_id: -1}}, function(err, allContactbooks){
        if(err){
            console.log(err);
        } else {
            classList.find({}, function(err, classlist) {
                if(err) {
                    console.log(err);
                } else {
                     res.render("pages/admin/contactbook", {"contactbook": allContactbooks,"classlist": classlist});
                }
            })
           
        }
    });
});

app.post("/admin/contactbook", function(req, res) {
     var grade = req.body.classname.substr(0,2);
     var category =  req.body.classname.substring(2);
   contactbooks.create(
       {
           grade: grade,
           category: category,
           content: req.body.content,
           post_user: req.body.post_user,
           post_date: req.body.post_date,
           notification: req.body.notification
       }, function(err, article) {
           if(err) {
               console.log(err);
           } else {
               
               res.redirect("/admin/contactbook");
           }
       }) 
});

app.get("/admin/classManager",isAdminLoggedIn, function(req, res){
    //get all class from db
    classList.find({},function(err, classes){
        if(err){
            console.log(err);
        } else {
            res.render("pages/admin/classManager",{"classList":classes});
        }
    });
});

app.post("/admin/classManager", function(req, res){
    classList.create({
       grade:req.body.grade,
       category:req.body.category,
       class_day:req.body.date,
       class_time:req.body.time,
       teacher:req.body.teacher
    }, function(err, classlist) {
        if(err){
            console.log(err);
        }else {
             //redirect to classManager
    res.redirect("/admin/classManager");
        }
    });
});

app.get("/admin/students",isAdminLoggedIn, function(req, res){
    studentList.find({}, null, { sort:{username:-1}}, function(err, students){
        if(err){
            console.log(err);
        } else {
            res.render("pages/admin/students", {"student": students});
        }
    });
});

app.get("/admin/teachers",isAdminLoggedIn, function(req, res){
    teacherList.find({}, function(err, teachers){
        if(err){
            console.log(err);
        } else {
            if(currentAuth == "1"){
            	res.render("pages/admin/teachers", {"teacher": teachers});
            } else {
                
                res.redirect("pages/admin/post");
            }
        }
    });
});

app.get("/admin/newTeacher",function(req, res){
     res.render("pages/admin/newTeacher");
});

app.post("/admin/newTeacher", function(req, res){
   User.register(new User({username: req.body.username}), req.body.password, function(err,user){
       if(err){
           console.log(err);
           return res.render("pages/admin/newTeacher");
       }
       teacherList.create(
    {
      name: req.body.name,
      username: req.body.username,
      teacher_phone: req.body.teacher_phone,
      teacher_mail: req.body.teacher_mail,
      auth:req.body.auth
    },function(err, teacherlist){
      if(err){
          console.log(err);
      } else {
          console.log("success new teacher");
          console.log(teacherlist);
      }
       
    });
       passport.authenticate("local")(req, res, function(){
           res.redirect("/admin/teachers");
       });
   });
});

app.get("/logout", function(req, res) {
   req.logout();
   res.redirect("/");
});

app.get("/admin/logout", function(req, res) {
   req.logout();
    currentTeacher = "undefined";
    currentAuth = "";
   res.redirect("/admin");
});

// app.listen(app.get('port'), function() {
  // console.log('Node app is running on port', app.get('port'));
// });

function isLoggedIn(req, res ,next){
    if(req.isAuthenticated()){
        return next();
    }
    res.redirect("/login");
};

function isAdminLoggedIn(req, res ,next){
    if(currentTeacher == "undefined"){
               currentTeacher = "undefined";
               currentAuth = "";
                console.log("NO AUTHORITY");
                     res.redirect("/admin");  
           } else {
               return next();
           }
};


