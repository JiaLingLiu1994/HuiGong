var express               = require('express'),
	mongoose              = require('mongoose'),
	bodyParser            = require('body-parser'),
	passport              = require('passport'),
	LocalStrategy         = require("passport-local"),
	passportLocalMongoose = require("passport-local-mongoose"),
	 formidable                 = require("formidable"),
    path                       = require("path"),
    fs                         = require("fs"),
    util                       = require('util'),
    async                      = require('async'),
    request                    = require('request'),
    io                         = require("socket.io")(app),
    logger                     = require("morgan");

// require('./public/stylesheets/message')(app);

var app = express();

 //app.set('port', (process.env.PORT || 5000));
//var port = process.env.PORT || 8080;
//var server = require('http').Server(app); 
//server.listen(port , function(){
//	console.log("port #" + 8080 );   //change 5000 to process.env.PORT when it runs on Heroku
//});

// var io = require('socket.io')(server);

// var mongooseOptions = { server: { socketOptions: { keepAlive: 300000,
// 	connectTimeoutMS: 30000 }}, replset: { socketOptions: { keepAlive: 300000, connectTimeoutMS: 30000 }}};

// var mongodbURL = process.env.MONGOLAB_URI_HUIGONG;
//mongoose.Promise = require('bluebird');
mongoose.connect("mongodb://localhost/school_db");

var conn = mongoose.connection;

conn.on('error', console.error.bind(console, "MONGO ERROR:"));

conn.once('open', function() {
    console.log('MongoDB connection openned');
});

var messages        = require('./models/message'),
    articles        = require("./models/article"),
    classList       = require("./models/classlist"),
    studentList     = require("./models/studentlist"),
    teacherList     = require("./models/teacherlist"),
    contactbooks    = require("./models/contactbook"),
    User            = require("./models/user"),
    insideClassList = require("./models/insideClass"),
    device          = require("./models/device");
    
var constants = require('./constants/constants.json');
var registerFunction = require('./functions/register');    
var devicesFunction = require('./functions/devices');
var deleteFunction = require('./functions/delete');
var sendFunction = require('./functions/send-message');

var currentClass = "";
var currentClassId = "";
var currentTeacher = "undefined";
var currentAuth = "";
// var currentUser = "";
var date = new Date();
var imageFolder = path.join(__dirname, '/public/uploads');

app.use(express.static(__dirname + '/public'));

// views is directory for all template files
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

app.use(logger('dev'));
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

// index
app.get('/', function(request, response) {
	articles.find({}, null, { sort:{_id: -1}}, function(err, allArticles){
        if(err){
            console.log(err);
        } else {
            response.render('pages/index', {"article": allArticles, "currentUser": request.user});
        }
    });
});

// users' class details
app.get("/class", isLoggedIn, function(req, res){
    contactbooks.find({}, null, { sort:{_id: -1}}, function(err, contactbooks){
        if(err){
            console.log(err);
        } else {
            insideClassList.find({username: req.user.username}, function(err, insideClasslist) {
                if(err) {
                    console.log(err);
                } else {
                    studentList.update({username: req.user.username},
                    {$set:
                      {
                        last_login: date.getFullYear()+"/"+(date.getMonth()+1)+"/"+date.getDate()
                      }
                    }, function(err, studentlist) {
                      if(err) {
                        console.log(err);
                      } else {
                        res.render("pages/class", {"contactbook": contactbooks, "currentUser": req.user, "insideClasslist": insideClasslist});
                      }
                    });
                     
                }
            });
           
        }
    });
});

// user chatting room
// app.get("/chat", isLoggedIn, function(req, res){
//   teacherList.find({}, null, { sort:{_id: -1}}, function(err, teacherlist){
//   	teacherList.find({username: 'superuser'}, function(err, superuser){
//     	if(err){
//       		console.log(err);
//     	} else {
//       		res.render("pages/chat", {"currentUser": req.user, "thefisrtonTop": superuser, "teacherlist": teacherlist});
//     	}
//   	});
//   });	
// });

app.get("/chat/:id", isLoggedIn, function(req, res){
	async.parallel([
  	function(callback){
  		teacherList.find({}, null, { sort:{_id: 1}}, function(err, teacherlist){
  			callback(err, teacherlist);
  		});
  	},
  	function(callback){
  		teacherList.findById({'_id': req.params.id}, function(err, chatWith){
  			callback(err, chatWith);
  		});
  	},
  	function(callback){
  		messages.find({'$or': [{'userFrom': req.user._id, 'userTo': req.params.id},
  		{'userFrom': req.params.id, 'userTo': req.user._id}]}, function(err, filteredmessages){
  			callback(err, filteredmessages);
  		}, null, { sort: {timestamp: 1}});	
  	}
  ], function(err, results){
  	if(err){
      console.log(err);
    } else {
      res.render("pages/chat", {"currentUser": req.user, "teacherlist": results[0], "chatWith": results[1], "chats": results[2]});
    }
  });
});

app.post("/chat/:id", function(req, res) {
  messages.create(
  {
    body: req.body.content,
    userFrom: req.body.userId,
    userTo: req.body.receiverId,
    userFromName: req.body.userName,
    userToName: req.body.receiverName,
    timestamp: req.body.timestamp    
  }, function(err, message) {
    if(err) {
      console.log(err);
    } else {
      console.log("SUCCESS ADD THE MESSAGE");
      res.redirect("/chat/:id");
    }
  }) 
});

// users login
app.get("/login", function(req, res){
    res.render("pages/login");
});

app.post("/login",passport.authenticate("local", {
    successRedirect: "/" ,
    failureRedirect: "/login"
}),function(req, res) {
});

//users' profile
app.get("/profile", isLoggedIn, function(req, res) {
    studentList.find({username: req.user.username}, function(err, studentlist) {
        if(err) {
            console.log(err);
        } else {
            res.render("pages/profile", {"currentUser": req.user.username, "student": studentlist});
        }
    });
   
});

app.get("/profile_update", isLoggedIn, function(req, res) {
  studentList.find({username: req.user.username}, function(err, students){
    if(err){
      console.log(err);
    } else {
      res.render("pages/profile_update", {"student": students, "currentUser": req.user});
    }
  });
});

app.post("/profile_update", function(req, res){
    studentList.update({username:req.user.username},
    {$set:
     { name:req.body.student_name,
      student_phone: req.body.student_phone,
      father_name: req.body.fa_name,
      father_phone: req.body.fa_phone,
      mother_name: req.body.ma_name,
      mother_phone: req.body.ma_phone,
      home_phone:req.body.home_phone}
    },function(err, studentlist){
      if(err){
          console.log(err);
      } else {
          console.log("success update profile");
          console.log(studentlist);
          res.redirect("/profile");
      }
       
    });
});
        
app.get("/profile_reset",isLoggedIn, function(req, res) {
   User.find({username:req.user.username}, function(err, students){
        if(err){
            console.log(err);
        } else {
            res.render("pages/profile_reset", {"currentUser":req.user});
        }
    });
});

app.post("/profile_reset", function(req, res) {
   if(req.body.password1 == req.body.password2) {
       User.findByUsername(req.user.username).then(function(sanitizedUser){
    if (sanitizedUser){
        sanitizedUser.setPassword(req.body.password1, function(){
            sanitizedUser.save();
            res.redirect("/profile");
        });
    } else {
    }
},function(err){
    console.error(err);
});
   } else {
       res.redirect("/profile_reset");
   }
});

// admin login
app.get("/admin", function(req, res) {
   res.render("pages/admin"); 
});

app.post("/admin", passport.authenticate("local",{
    successRedirect: "/admin/auth",
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

// admin post management
app.get("/admin/post",isAdminLoggedIn, function(req, res){
    articles.find({}, null, { sort:{_id: -1}}, function(err, allArticles){
        if(err){
            console.log(err);
        } else {
            fs.readdir(imageFolder, function(err, files) {
              res.render("pages/admin/post", {"allArticles":allArticles,"files":files});
            });
            
        }
    });
});

app.post("/admin/post", function(req, res) {
   articles.create(
       {
           title: req.body.title,
           content: req.body.content,
           post_user: req.body.post_user,
           post_date: req.body.post_date,
           image: req.body.image,
           notification: req.body.notification
       }, function(err, article) {
           if(err) {
               console.log(err);
           } else {
               
               res.redirect("/admin/post");
           }
       }) 
});


app.get("/admin/upload", function(req, res) {
    
   res.render("pages/admin/upload"); 
});
app.post("/upload", function(req, res) {
 
  // create an incoming form object
  var form = new formidable.IncomingForm();

  // specify that we want to allow the user to upload multiple files in a single request
  form.multiples = true;

  // store all uploads in the /uploads directory
  form.uploadDir = path.join(__dirname, '/public/uploads');

  // every time a file has been uploaded successfully,
  // rename it to it's orignal name
  form.on('file', function(field, file) {
    fs.rename(file.path, path.join(form.uploadDir, file.name));
  });

  // log any errors that occur
  form.on('error', function(err) {
    console.log('An error has occured: \n' + err);
  });

  // once all the files have been uploaded, send a response to the client
  form.on('end', function() {
    res.end('success');
  });

  // parse the incoming request containing the form data
  form.parse(req);
});


app.get("/admin/editPost_article", isAdminLoggedIn, function(req, res) {
  var objectId = mongoose.Types.ObjectId(req.query.article_id);
  articles.find({"_id":objectId}, function(err, edit_article){
    if(err){
      console.log(err);
    } else {
      console.log(edit_article);
      res.render("pages/admin/editPost_article", {"edit_article": edit_article, "currentAuth": currentAuth});
    }
  });
});

app.post("/admin/editPost_article", function(req, res){
  var objectId = mongoose.Types.ObjectId(req.body.article_id);
  articles.update({"_id": objectId},
  {$set:
    { 
      title: req.body.title,
      content: req.body.content,
      post_user: req.body.post_user,
      post_date: req.body.post_date,
      notification: req.body.notification
    }
  }, {upsert: false}, function(err, article){
    if(err){
      console.log(err);
    } else {
      console.log("SUCCESS EDIT THE ARTICLE");
      console.log(article);
      res.redirect("/admin/post");
    }
       
  })
});

app.post("/admin/deletePost_article", function(req, res) {
  var objectId = mongoose.Types.ObjectId(req.body.article_id);
  articles.remove({"_id":objectId}, function(err,articles) {
    if(err) {
      console.log(err);
    } else {
      console.log("SUCCESS DELETE THE ARTICLE");
      res.redirect("/admin/post");
    }
  }); 
});


// admin contactbook management
app.get("/admin/contactbook",isAdminLoggedIn, function(req, res){
    contactbooks.find({}, null, { sort:{_id: -1}}, function(err, allContactbooks){
        if(err){
            console.log(err);
        } else {
            classList.find({}, function(err, classlist) {
                if(err) {
                    console.log(err);
                } else {
                    fs.readdir(imageFolder, function(err, files){
                     res.render("pages/admin/contactbook", {"contactbook":allContactbooks,"classlist":classlist,"files":files});
                    });
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
           image:req.body.image,
           notification: req.body.notification
       }, function(err, article) {
           if(err) {
               console.log(err);
           } else {
               
               res.redirect("/admin/contactbook");
           }
       }) 
});

app.get("/admin/editPost_contactbook", isAdminLoggedIn, function(req, res){
  var objectId = mongoose.Types.ObjectId(req.query.contactbook_id);
  contactbooks.find({"_id": objectId}, function(err, contactbook){
    if(err){
      console.log(err);
    } else {
      classList.find({}, function(err, classlist){
        if(err) {
          console.log(err);
        } else {
          res.render("pages/admin/editPost_contactbook", {"contactbook": contactbook, "classlist": classlist, "currentAuth": currentAuth});
        }
      });     
    }
  });
});

app.post("/admin/editPost_contactbook", function(req, res){
  var grade = req.body.classname.substr(0,2);
  var category =  req.body.classname.substring(2);
  var objectId = mongoose.Types.ObjectId(req.body.contactbook_id);
  contactbooks.update({"_id":objectId},
  {$set:
    { grade:grade,
      category:category,
      content: req.body.content,
      post_user: req.body.post_user,
      post_date: req.body.post_date,
      notification: req.body.notification
     }
  }, {upsert: false}, function(err, contactbook){
    if(err){
      console.log(err);
    } else {
      console.log("SUCCESS EDIT THE CPNTACTBOOK");
      console.log(contactbook);
      res.redirect("/admin/contactbook");
      } 
    })
});

app.post("/admin/deleteContactbook", function(req, res) {
  var objectId = mongoose.Types.ObjectId(req.body.contactbook_id);
  contactbooks.remove({"_id": objectId}, function(err, articles) {
    if(err) {
      console.log(err);
    } else {
      console.log("SUCCESS DELETE THE CONTACTBOOK");
      res.redirect("/admin/contactbook");
    }
  }); 
});

// admin class management
app.get("/admin/classManager",isAdminLoggedIn, function(req, res){
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
    grade: req.body.grade,
    category: req.body.category,
    class_day: req.body.date,
    class_time: req.body.time,
    teacher: req.body.teacher
  }, function(err, classlist) {
    if(err){
      console.log(err);
    } else {
      console.log("SUCCESS ADD THE CLASS");
      res.redirect("/admin/classManager");
    }
  });
});

app.get("/admin/newClass", isAdminLoggedIn, function(req, res){
     res.render("pages/admin/newClass");
});

app.post("/admin/deleteClass", function(req, res) {
  insideClassList.remove({className: req.body.currentClass}, function(err, insideclasses){
    if(err) {
      console.log(err);
    } else {
      var grade = currentClass.substr(0,2);
      var category = currentClass.substring(2);
      classList.remove({grade:grade, category:category}, function(err,currentclass) {
        if(err) {
          console.log(err);
        } else {
          console.log("DELETE THE CLASS FROM USERLIST AND CLASS LIST");
          res.redirect("/admin/classManager");
        }
      });  
    }
  });
});

app.get("/admin/insideClass", isAdminLoggedIn, function(req, res){
  if(typeof req.query.classname != "undefined"){
    currentClass = req.query.classname;
  }
    
  insideClassList.find({className: currentClass}, function(err, insideclasses) {
    if(err) {
      console.log(err); 
    }else {
      studentList.find({}, function(err, students) {
        if(err){
          console.log(err);
        } else {
          res.render("pages/admin/insideClass", {"insideclass": insideclasses, "student": students, "currentClass": currentClass, "currentAuth": currentAuth});
        }
      });
    }
  });
});

app.get("/admin/addStudentToClass", isAdminLoggedIn, function(req, res) {
  insideClassList.find({className: currentClass}, function(err, insideclasses) {
    if(err) {
      console.log(err);
    }else {
      studentList.find({}, function(err, students) {
        if(err){
          console.log(err);
        } else {
          res.render("pages/admin/addStudentToClass", {"insideclass": insideclasses, "student": students});
        }
      });
    }
  });
});

app.post("/admin/addStudentToClass", function(req, res) {
  var checkedStudent = req.body.checkedStudent;
  if(typeof checkedStudent == "object") {
    checkedStudent.forEach(function(username ) {
      insideClassList.create(
      {
        className:currentClass,
        username:username
      }, function(err, insideClasslist) {
        if(err) {
          console.log(err);
        }
      });
    });
  }else {
    insideClassList.create(
    {
      className:currentClass,
      username:checkedStudent
    }, function(err, insideClasslist) {
      if(err) {
        console.log(err);
      }
    });
  };
  
  res.redirect("/admin/insideClass");
});

app.post("/admin/deleteStudentInClass", function(req, res) {
  if(typeof req.query.classname != "undefined"){
    currentClass = req.query.classname;
  }
  
  insideClassList.remove(
  {
    className:currentClass,
    username:req.body.username
  },function(err,insideclasses){
    if(err) {
      console.log(err);
    } else {
      res.redirect("/admin/insideClass");     
    }
  });
});

// admin students management
app.get("/admin/students",isAdminLoggedIn, function(req, res){
  studentList.find({}, null, { sort:{username:-1}}, function(err, students){
    if(err){
      console.log(err);
    } else {
      res.render("pages/admin/students", {"student": students});
    }
  });
});

app.get("/admin/newStudent", isAdminLoggedIn, function(req, res){
  res.render("pages/admin/newStudent");
});

app.post("/admin/newStudent", function(req, res){
  var account = req.body.year + req.body.account;
  User.register( new User({username:account}), req.body.password, function(err,user){
    if(err){
      console.log(err);
      return res.render("pages/admin/newStudent");
    }
    
    studentList.create(
    {
      name: req.body.student_name,
      username: account,
      student_phone: req.body.student_phone,
      father_name: req.body.fa_name,
      father_phone: req.body.fa_phone,
      mother_name: req.body.ma_name,
      mother_phone: req.body.ma_phone,
      home_phone:req.body.home_phone,
    },function(err, studentlist){
      if(err){
          console.log(err);
      } else {
          console.log("SUCCESS ADD THE STUDENT");
          console.log(studentlist);
          res.redirect("/admin/students");
      }
    });
       
  });
});

app.get("/admin/editStudents", isAdminLoggedIn, function(req, res) {
  studentList.find({username: req.query.username}, function(err, students){
    if(err){
      console.log(err);
    } else {
      res.render("pages/admin/editStudents", {"student": students, "currentAuth": currentAuth});
    }
  });
});

app.post("/admin/editStudents", function(req, res){
  studentList.update({username:req.body.username},
  {$set:
    { name: req.body.student_name,
      student_phone: req.body.student_phone,
      father_name: req.body.fa_name,
      father_phone: req.body.fa_phone,
      mother_name: req.body.ma_name,
      mother_phone: req.body.ma_phone,
      home_phone: req.body.home_phone,
      point: req.body.point
    }
  }, {upsert: false}, function(err, studentlist){
    if(err){
      console.log(err);
    } else {
      console.log("SUCCESS EDIT THE STUDENT");
      console.log(studentlist);
      res.redirect("/admin/students");
    }
  })
});

app.post("/admin/deleteStudent", function(req, res) {
  console.log(req.body.username);
  User.remove({username: req.body.username}, function(err, userlist) {
    if(err) {
      console.log(err);
    } else {
      studentList.remove({username: req.body.username}, function(err, studentlist) {
        if(err) {
          console.log(err);
        } else {
          console.log("DELETE THE STUDENT FROM USERLIST AND STUDENT LIST");
          res.redirect("/admin/students");
        }
      });
    }
  }); 
});

// admin teachers management
app.get("/admin/teachers", isAdminLoggedIn, function(req, res){
  teacherList.find({}, function(err, teachers){
    if(err){
      console.log(err);
    } else {
      if(currentAuth == "1"){
        res.render("pages/admin/teachers", {"teacher": teachers});
      } else {          
        res.redirect("/admin/post");
      }
    }
  });
});

app.get("/admin/newTeacher",function(req, res){
  res.render("pages/admin/newTeacher");
});

app.post("/admin/newTeacher", function(req, res){
  User.register(new User({username: req.body.username}), req.body.password, function(err, user){
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
      auth: req.body.auth
    },function(err, teacherlist){
      if(err){
        console.log(err);
      } else {
        console.log("SUCCESS ADD THE TEACHER");
        console.log(teacherlist);
      }
       
    });
      passport.authenticate("local")(req, res, function(){
      res.redirect("/admin/teachers");
      });
  });
});

app.get("/admin/editTeachers", isAdminLoggedIn, function(req, res) {
  teacherList.find({username:req.query.username}, function(err, teacher){
    if(err){
      console.log(err);
    } else {
      res.render("pages/admin/editTeachers", {"teacher": teacher});
    }
  });
});

app.post("/admin/editTeachers", function(req, res){
  teacherList.update({username:req.body.username},
  {$set:
    { name:req.body.teacher_name,
      auth: req.body.auth,
      username: req.body.username,
      teacher_phone: req.body.teacher_phone,
      teacher_mail: req.body.teacher_mail
    }
  }, {upsert: false}, function(err, teacherlist){
    if(err){
      console.log(err);
    } else {
      console.log("SUCCESS EDIT THE TEACHER");
      console.log(teacherlist);
      res.redirect("/admin/teachers");
    }
  })
});

app.post("/admin/deleteTeacher", function(req, res) {
  console.log(req.body.username);
  User.remove({username: req.body.username}, function(err, userlist) {
    if(err) {
      console.log(err);
    } else {
      teacherList.remove({username: req.body.username}, function(err, teacherlist) {
        if(err) {
          console.log(err);
        } else {
          console.log("DELETE THE TEACHER FROM USERLIST AND TEACHER LIST");
          res.redirect("/admin/teachers");
        }
      });
    }
  }); 
});

// admin chatting room
app.get("/admin/admin_chat/:id", isAdminLoggedIn, function(req, res){
	async.parallel([
  	function(callback){
  		studentList.find({}, null, { sort:{_id: 1}}, function(err, studentlist){
  			callback(err, studentlist);
  		});
  	},
  	function(callback){
  		studentList.findById({'_id': req.params.id}, function(err, chatWith){
  			callback(err, chatWith);
  		});
  	},
  	function(callback){
  		messages.find({'$or': [{'userFrom': req.user._id, 'userTo': req.params.id},
  		{'userFrom': req.params.id, 'userTo': req.user._id}]}, function(err, filteredmessages){
  			callback(err, filteredmessages);
  		}, null, { sort: {timestamp: 1}});	
  	},
  	function(callback){
  		messages.find({'$or': [{'userFrom': req.user._id}, {'userTo': req.user._id}]}, function(err, filteredEachLastmessages){
  			callback(err, filteredEachLastmessages);
  		}, null, { sort: {timestamp: 1}});	
  	}

  ], function(err, results){
  	if(err){
      console.log(err);
    } else {
      res.render("pages/admin/admin_chat", {"currentUser": req.user, "studentlist": results[0], "chatWith": results[1], "chats": results[2]});
    }
  });
});

app.post("/admin/admin_chat", function(req, res) {
  messages.create(
  {
    body: req.body.content,
    userFrom: req.body.userId,
    userTo: req.body.receiverId,
    userFromName: req.body.userName,
    userToName: req.body.receiverName,
    timestamp: req.body.timestamp    
  }, function(err, message) {
    if(err) {
      console.log(err);
    } else {
      console.log("SUCCESS ADD THE MESSAGE");
    }
  }) 
});

// user logout
app.get("/logout", function(req, res) {
   req.logout();
   res.redirect("/");
});

// admin logout
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

app.listen(process.env.PORT, process.env.IP, function(){
    console.log(process.env.PORT);
   console.log("Server has started"); 
});

io.on('connection', function(socket){
 
        console.log("Client Connected");
        socket.emit('update', { message: 'Hello Client',update:false });
 
          socket.on('update', function(msg){
 
            console.log(msg);
          });
    });
 
    app.post('/devices',function(req,res) {
 
        var deviceName = req.body.deviceName;
        var deviceId   = req.body.deviceId;
        var registrationId = req.body.registrationId;
        var username   = req.body.username;
        var name;
        studentList.find({username:username}, function(err, student) {
            if(err) {
              console.log(err);
            } else {
              student.forEach(function(student){name=student.name});
              if ( typeof deviceName  == 'undefined' || typeof deviceId == 'undefined' || typeof registrationId  == 'undefined' || typeof username  == 'undefined' ) {
 
            console.log(constants.error.msg_invalid_param.message);
 
            res.json(constants.error.msg_invalid_param);
 
        } else if ( !deviceName.trim() || !deviceId.trim() || !registrationId.trim() || !username.trim()) {
 
            console.log(constants.error.msg_empty_param.message);
 
            res.json(constants.error.msg_empty_param);
 
        } else {
 
            registerFunction.register( deviceName, deviceId, registrationId, username, name, function(result) {
 
                res.json(result);
 
                if (result.result != 'error'){
 
                    io.emit('update', { message: 'New Device Added',update:true});
 
                }
            });
        }
            }
        });
        // teacherList.find({username:username}, function(err, teacher) {
        //     if(err) {
        //       console.log(err);
        //     } else {
        //       name = teacher.name;
        //     }
        // });
        
    });
 
    app.get('/devices',function(req,res) {
 
        devicesFunction.listDevices(function(result) {
 
            res.json(result);
 
        });
    });
 
    app.delete('/devices/:device',function(req,res) {
 
        var registrationId = req.params.device;
 
        deleteFunction.removeDevice(registrationId,function(result) {
 
            res.json(result);
 
        });
 
    });
 
    app.post('/send',function(req,res){
 
        var message = req.body.message;
        var registrationId = req.body.registrationId;
 
        sendFunction.sendMessage(message,registrationId,function(result){
 
            res.json(result);
        });
    });
    
    app.post('/sendToClass',function(req,res){
 
        var message = req.body.message;
        var classname = req.body.classname;
       insideClassList.find({}, function(err, insideClass) {
           if(err) {
             console.log(err);
           } else {
             insideClass.forEach(function(c){
               if(classname == c.className)
               {
                 device.find({}, function(err, device) {
                  if(err) {
                    console.log(err);
                  } else {
                    device.forEach(function(d){
                      if(c.username == d.username){
                        console.log(d.registrationId);
                        var registrationId = d.registrationId;
                        sendFunction.sendMessage(message,registrationId,function(result){
                         });
                        }
                      });
                    }
                });   
               }
             });
              res.redirect("admin/push");
           }
       });
        
    });
    
    app.get("/admin/pushToClass", isAdminLoggedIn, function(req, res) {
        classList.find({},function(err, classes) {
            if(err){
              console.log(err);
            } else {
              res.render("pages/admin/pushToClass",{"classes":classes});
            }
        })
    })
    
      app.get('/admin/push',isAdminLoggedIn,function(req,res) {
 
        res.render('pages/admin/push');
 
    });