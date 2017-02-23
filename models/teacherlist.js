var mongoose                   = require("mongoose"),
    passportLocalMongoose      = require("passport-local-mongoose");
// mongoose.connect("mongodb://localhost/school_db");

var teacherSchema = new mongoose.Schema({
   name: String,
   auth: String,
   username: String,
   teacher_phone: String,
   teacher_mail: String
});

teacherSchema.plugin(passportLocalMongoose);
module.exports = mongoose.model("teacherlist", teacherSchema);
// var teacherList = mongoose.model("teacherlist", teacherSchema);

// teacherList.find({}, function(err, teachers){
//   if(err) {
//       console.log("Error//" + err);
//   } else {
//       console.log(teachers);
//   }
// });